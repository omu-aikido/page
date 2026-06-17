import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { convertIcsCalendar } from "ts-ics";
import * as v from "valibot";

import { eventsToJson, expandCalendarEvents, filterEvents } from "./calendarEvents";

import type { IcsCalendar, IcsEvent } from "ts-ics";

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

      const expanded = expandCalendarEvents(events, { start, end });
      const filtered = filterEvents(expanded, start, end);
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
