import { Hono } from "hono";
import { cache } from "hono/cache";
import { convertIcsCalendar, generateIcsCalendar } from "ts-ics";

/**
 * Configuration
 */
const CALENDAR_BASE_URL = "https://calendar.google.com/calendar/ical/";
const CALENDAR_ID = "aikido.omu";
const CALENDAR_DEFAULT_PATH = "%40gmail.com/public/basic.ics";
const CALENDAR_ICS_URL = `${CALENDAR_BASE_URL}${CALENDAR_ID}${CALENDAR_DEFAULT_PATH}`;

/**
 * Local lightweight types for the parts we consume from the ICS parser.
 */
type RawIcsEvent = {
  uid?: string;
  summary?: string;
  start: { date: string } | string;
  end?: { date: string } | string;
  location?: string;
  description?: string;
  [k: string]: any;
};

type ParsedCalendar = {
  prodId?: string;
  method?: string;
  timezones?: unknown;
  events?: RawIcsEvent[] | null;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  end: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  isAllDay: boolean;
  location?: string;
  description?: string;
};

/**
 * Utility: fetch ICS text from a remote URL and validate response.
 */
async function fetchIcsText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable body>");
    throw new Error(`Failed to fetch ICS (${res.status} ${res.statusText}): ${body}`);
  }
  return await res.text();
}

/**
 * Utility: parse ICS text into the library's calendar structure.
 */
function parseIcs(text: string): ParsedCalendar {
  const parsed = convertIcsCalendar(undefined, text) as ParsedCalendar;
  if (!parsed || !parsed.events) {
    return { ...parsed, events: [] };
  }
  return parsed;
}

/**
 * Helper: normalize an event date value into a Date object.
 * Also detects if it's an all-day event (date-only format).
 */
function toDate(
  value: { date: string } | string | undefined,
): { date: Date; isAllDay: boolean } | null {
  if (!value) return null;
  const s = typeof value === "string" ? value : value.date;

  // Check if it's a date-only format (yyyy-mm-dd)
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(s);

  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return { date: d, isAllDay };
}

/**
 * Filter events to those within the provided inclusive window.
 */
function filterEventsInWindow(
  events: RawIcsEvent[],
  windowStart: Date,
  windowEnd: Date,
): RawIcsEvent[] {
  return events.filter((ev) => {
    const start = toDate(ev.start);
    if (!start) return false;
    const end = toDate(ev.end) ?? start;
    // Include events that overlap the [windowStart, windowEnd] range
    return start.date <= windowEnd && end.date >= windowStart;
  });
}

/**
 * Convert filtered events to the JSON shape exposed by /json endpoint.
 * For all-day events, return date in yyyy-mm-dd format.
 * For timed events, return ISO 8601 format.
 */
function eventsToJson(events: RawIcsEvent[]): CalendarEvent[] {
  return events
    .map((ev) => {
      const start = toDate(ev.start);
      if (!start) return null;
      const end = toDate(ev.end) || start;

      const isAllDay = start.isAllDay;
      const formatDate = (d: Date) => {
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const date = String(d.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${date}`;
      };

      return {
        id: ev.uid ?? "",
        title: ev.summary ?? "",
        start: isAllDay ? formatDate(start.date) : start.date.toISOString(),
        end: isAllDay ? formatDate(end.date) : end.date.toISOString(),
        isAllDay,
        location: ev.location,
        description: ev.description,
      };
    })
    .filter((e) => e !== null)
    .sort((a, b) => new Date(a!.start).getTime() - new Date(b!.start).getTime()) as CalendarEvent[];
}

/**
 * Build an ICS calendar document containing only the provided events.
 */
function buildIcsCalendarFromParsed(parsed: ParsedCalendar, events: RawIcsEvent[]) {
  const icsCalendar: any = {
    version: "2.0",
    prodId: parsed.prodId,
    method: parsed.method,
    timezones: parsed.timezones,
    events,
  };
  return generateIcsCalendar(icsCalendar);
}

/**
 * Compute the time-window used by endpoints.
 */
function computeWindowForJson() {
  // JSON: start = first day of current month 00:00:00; end = last day of current month 23:59:59
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const app = new Hono()
  .use(
    "*",
    cache({
      cacheName: "omu-aikido-api-cache",
      cacheControl: "max-age=600, s-maxage=1200, private, must-revalidate",
      cacheableStatusCodes: [200, 404, 412],
    }),
  )
  .get("/ics", async (c) => {
    try {
      const icsText = await fetchIcsText(CALENDAR_ICS_URL);
      const parsed = parseIcs(icsText);
      const events = parsed.events ?? [];

      const now = new Date();
      const start = new Date(now);
      start.setMonth(start.getMonth() - 2);
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const filtered = filterEventsInWindow(events, start, end);

      if (filtered.length === 0) {
        const empty = buildIcsCalendarFromParsed(parsed, []);
        return c.text(empty, 200, { "Content-Type": "text/calendar" });
      }

      const ics = buildIcsCalendarFromParsed(parsed, filtered);
      return c.text(ics, 200, { "Content-Type": "text/calendar" });
    } catch (err: any) {
      console.error("Error in /calendar/ics:", err);
      const msg = (err && err.message) || "Internal Server Error";
      const status = msg.startsWith("Failed to fetch ICS") ? 502 : 500;
      return c.text(msg, status);
    }
  })
  .get("/json", async (c) => {
    try {
      const icsText = await fetchIcsText(CALENDAR_ICS_URL);
      const parsed = parseIcs(icsText);
      const events = parsed.events ?? [];

      console.log(`[/calendar/json] Total events from ICS: ${events.length}`);

      // Parse query parameters for custom date range
      const startParam = c.req.query("start");
      const endParam = c.req.query("end");

      let start: Date;
      let end: Date;

      if (startParam && endParam) {
        // Use query parameters if provided
        start = new Date(startParam);
        end = new Date(endParam);
        // Validate date parameters
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return c.json(
            {
              error:
                "Invalid date format in start or end parameter. Use ISO 8601 format (e.g., 2025-01-01T00:00:00Z)",
            },
            400,
          );
        }
        // Ensure start <= end
        if (start > end) {
          return c.json({ error: "start parameter must be before end parameter" }, 400);
        }
      } else {
        // Default to this month
        const window = computeWindowForJson();
        start = window.start;
        end = window.end;
      }

      console.log(`[/calendar/json] Filtering from ${start.toISOString()} to ${end.toISOString()}`);

      const filtered = filterEventsInWindow(events, start, end);
      console.log(`[/calendar/json] Filtered events: ${filtered.length}`);

      const json = eventsToJson(filtered);
      return c.json(json);
    } catch (err: any) {
      console.error("Error in /calendar/json:", err);
      const msg = (err && err.message) || "Internal Server Error";
      const status = msg.startsWith("Failed to fetch ICS") ? 502 : 500;
      return c.json({ error: msg }, status);
    }
  });

export default app;
