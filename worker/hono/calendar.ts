import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { convertIcsCalendar } from "ts-ics";
import * as v from "valibot";

import type { IcsCalendar, IcsEvent } from "ts-ics";

type CalendarEvent = {
  id: string;
  start: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  end: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  title: string;
  isAllDay: boolean;
  location?: string;
  description?: string;
};

/**
 * Configuration
 */
const CALENDAR_BASE_URL = "https://calendar.google.com/calendar/ical/";
const CALENDAR_ID = "aikido.omu";
const CALENDAR_DEFAULT_PATH = "%40gmail.com/public/basic.ics";
const CALENDAR_ICS_URL = `${CALENDAR_BASE_URL}${CALENDAR_ID}${CALENDAR_DEFAULT_PATH}`;

/**
 * Cache for parsed events (Layer 2)
 */
let cachedEvents: { events: IcsEvent[]; fetchedAt: number } | null = null;
let inFlight: Promise<IcsEvent[]> | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Validation schemas using Valibot
 */
const vIcsCalendar = v.custom<IcsCalendar>((input) => {
  return typeof input === "object" && input !== null;
});

async function fetchIcsText(): Promise<string> {
  const res = await fetch(CALENDAR_ICS_URL);
  if (!res.ok) throw new Error(`Failed to fetch ICS (${res.status})`);
  return res.text();
}

function parseIcs(text: string): IcsEvent[] {
  return convertIcsCalendar(vIcsCalendar, text).events ?? [];
}

async function getEvents(): Promise<IcsEvent[]> {
  const now = Date.now();
  if (cachedEvents && now - cachedEvents.fetchedAt < CACHE_TTL) {
    return cachedEvents.events;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const text = await fetchIcsText();
      const events = parseIcs(text);
      cachedEvents = { events, fetchedAt: Date.now() };
      return events;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function filterEvents(events: IcsEvent[], start: Date, end: Date): IcsEvent[] {
  return events.filter((ev) => {
    const s = ev.start.date;
    if (!s) return false;
    const e = ev.end ? ev.end.date : ev.start.date;
    return s <= end && e >= start;
  });
}

function eventsToJson(events: IcsEvent[]): CalendarEvent[] {
  return events
    .map((ev) => {
      const start = ev.start.date;
      const end = ev.end ? ev.end.date : ev.start.date;
      const allDay = ev.start.type === "DATE";

      const fmt = (d: Date) => {
        if (allDay) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        } else {
          return d.toISOString();
        }
      };

      return {
        id: ev.uid ?? "",
        title: ev.summary ?? "",
        start: fmt(start),
        end: fmt(end),
        isAllDay: allDay,
        location: ev.location,
        description: ev.description,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

function getWindow(monthsBefore = 2, monthsAfter = 3) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBefore, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthsAfter + 1, 0, 23, 59, 59);
  return { start, end };
}

const app = new Hono().get(
  "/json",
  vValidator(
    "query",
    v.object({
      start: v.optional(v.pipe(v.string(), v.isoDate())),
      end: v.optional(v.pipe(v.string(), v.isoDate())),
    }),
  ),
  async (c) => {
    try {
      const events = await getEvents();
      const q = c.req.valid("query");

      let start: Date;
      let end: Date;

      if (q.start && q.end) {
        start = new Date(q.start);
        end = new Date(q.end);
        if (start > end) return c.json({ error: "start must be before end" }, 400);
      } else {
        ({ start, end } = getWindow(1, 1));
      }

      const filtered = filterEvents(events, start, end);
      return c.json(eventsToJson(filtered), 200, {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      });
    } catch (e) {
      console.error(e);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
);

export default app;
