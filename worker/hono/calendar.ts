import { Hono } from "hono";
import { convertIcsCalendar, generateIcsCalendar } from "ts-ics";

/**
 * Configuration
 */
const CALENDAR_BASE_URL = "https://calendar.google.com/calendar/ical/";
const CALENDAR_DEFAULT_PATH = "new.ocuaikido%40gmail.com/public/basic.ics";
const CALENDAR_ICS_URL = `${CALENDAR_BASE_URL}${CALENDAR_DEFAULT_PATH}`;

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

/**
 * Utility: fetch ICS text from a remote URL and validate response.
 */
async function fetchIcsText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    // Include status information to aid debugging and monitoring.
    const body = await res.text().catch(() => "<unreadable body>");
    throw new Error(`Failed to fetch ICS (${res.status} ${res.statusText}): ${body}`);
  }
  return await res.text();
}

/**
 * Utility: parse ICS text into the library's calendar structure.
 * We intentionally keep the conversion separate so callers can decide how to filter/serialize.
 */
function parseIcs(text: string): ParsedCalendar {
  // The library expects parameters (undefined, rawText) in prior code; keep same usage.
  const parsed = convertIcsCalendar(undefined, text) as ParsedCalendar;
  if (!parsed || !parsed.events) {
    return { ...parsed, events: [] };
  }
  return parsed;
}

/**
 * Helper: normalize an event date value into a Date object.
 * Accepts either an object like { date: 'yyyy-mm-dd...' } or a raw date string.
 */
function toDate(value: { date: string } | string | undefined): Date | null {
  if (!value) return null;
  const s = typeof value === "string" ? value : value.date;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d;
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
    return start <= windowEnd && end >= windowStart;
  });
}

/**
 * Convert filtered events to the JSON shape exposed by /json endpoint.
 */
function eventsToJson(events: RawIcsEvent[]) {
  return events
    .map((ev) => {
      const start = toDate(ev.start);
      const end = toDate(ev.end) || start;
      return {
        id: ev.uid ?? null,
        title: ev.summary ?? "",
        start: start ? start.toISOString() : null,
        end: end ? end.toISOString() : null,
        location: ev.location,
        description: ev.description,
      };
    })
    .filter((e) => e.start !== null)
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());
}

/**
 * Build an ICS calendar document containing only the provided events.
 * We re-use the parsed calendar's metadata where possible.
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
 * Compute the time-window used by both endpoints.
 * - For /ics we keep the same window semantics as before but centralized here.
 * - Back 2 months to +3 months for ICS; JSON uses slightly different window: from today to +3 months.
 */
function computeWindowForIcs() {
  // ICS previously used: start = now - 2 months; end = now + 3 months
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - 2);
  const end = new Date(now);
  end.setMonth(end.getMonth() + 3);
  // Normalize start time to 00:00:00 of that day for inclusivity
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function computeWindowForJson() {
  // JSON now uses: start = first day of current month 00:00:00; end = last day of current month 23:59:59
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * GET /ics
 * Returns a filtered ICS calendar (text/calendar).
 */

const app = new Hono()
  .get("/ics", async (c) => {
    try {
      const icsText = await fetchIcsText(CALENDAR_ICS_URL);
      const parsed = parseIcs(icsText);
      const events = parsed.events ?? [];

      const { start, end } = computeWindowForIcs();
      const filtered = filterEventsInWindow(events, start, end);

      if (filtered.length === 0) {
        // Return an empty calendar (still valid ICS) rather than 500
        const empty = buildIcsCalendarFromParsed(parsed, []);
        return c.text(empty, 200, { "Content-Type": "text/calendar" });
      }

      const ics = buildIcsCalendarFromParsed(parsed, filtered);
      return c.text(ics, 200, { "Content-Type": "text/calendar" });
    } catch (err: any) {
      // Distinguish upstream fetch errors vs. internal errors by message content
      console.error("Error in /calendar/ics:", err);
      const msg = (err && err.message) || "Internal Server Error";
      // If upstream fetch failed, propagate 502 Bad Gateway; otherwise 500.
      const status = msg.startsWith("Failed to fetch ICS") ? 502 : 500;
      return c.text(msg, status);
    }
  })
  .get("/json", async (c) => {
    try {
      const icsText = await fetchIcsText(CALENDAR_ICS_URL);
      const parsed = parseIcs(icsText);
      const events = parsed.events ?? [];

      // Parse query parameters for custom date range
      const startParam = c.req.query("start");
      const endParam = c.req.query("end");

      let start: Date;
      let end: Date;

      if (startParam && endParam) {
        // Use query parameters if provided
        start = new Date(startParam);
        end = new Date(endParam);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return c.json({ error: "Invalid date format in start or end parameter" }, 400);
        }
      } else {
        // Default to this month
        const window = computeWindowForJson();
        start = window.start;
        end = window.end;
      }

      const filtered = filterEventsInWindow(events, start, end);

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
