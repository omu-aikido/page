import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { convertIcsCalendar, generateIcsCalendar } from "ts-ics";
import * as v from "valibot";

import type { IcsCalendar, IcsEvent } from "ts-ics";

/**
 * Configuration
 */
const CALENDAR_BASE_URL = "https://calendar.google.com/calendar/ical/";
const CALENDAR_ID = "aikido.omu";
const CALENDAR_DEFAULT_PATH = "%40gmail.com/public/basic.ics";
const CALENDAR_ICS_URL = `${CALENDAR_BASE_URL}${CALENDAR_ID}${CALENDAR_DEFAULT_PATH}`;

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

function filterEvents(events: IcsEvent[], start: Date, end: Date): IcsEvent[] {
  return events.filter((ev) => {
    const s = ev.start.date;
    if (!s) return false;
    const e = ev.end ? ev.end.date : ev.start.date;
    return s <= end && e >= start;
  });
}

function eventsToJson(events: IcsEvent[]) {
  return events
    .map((ev) => {
      const start = ev.start.date;
      const end = ev.end ? ev.end.date : ev.start.date;
      const allDay = ev.start.type === "DATE";
      const fmt = (d: Date) => (allDay ? d.toISOString().slice(0, 10) : d.toISOString());

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

function buildIcs(events: IcsEvent[]): string {
  return generateIcsCalendar({
    version: "2.0",
    prodId: "-//omu-aikido//calendar//JP",
    events,
  });
}

function getWindow(monthsBefore = 2, monthsAfter = 3) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBefore, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthsAfter + 1, 0, 23, 59, 59);
  return { start, end };
}

const app = new Hono()
  .use(
    "*",
    cache({
      cacheName: "omu-aikido-api-cache",
      cacheControl: "max-age=600, s-maxage=1200, private, must-revalidate",
      cacheableStatusCodes: [200, 404, 500],
    }),
  )
  .get("/ics", async (c) => {
    try {
      const text = await fetchIcsText();
      const events = parseIcs(text);
      const { start, end } = getWindow();
      const filtered = filterEvents(events, start, end);
      return c.text(buildIcs(filtered), 200, { "Content-Type": "text/calendar" });
    } catch (e) {
      return c.text((e as Error).message, 502);
    }
  })
  .get(
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
        const events = await fetchIcsText().then((text) => parseIcs(text));
        const q = c.req.valid("query");

        let start: Date;
        let end: Date;

        console.log(`/api/calendar/json ${q.start} to ${q.end}`);
        if (q.start && q.end) {
          start = new Date(q.start);
          end = new Date(q.end);
          if (start > end) return c.json({ error: "start must be before end" }, 400);
        } else {
          ({ start, end } = getWindow(1, 1));
        }

        const filtered = filterEvents(events, start, end);
        return c.json(eventsToJson(filtered));
      } catch {
        return c.json({ error: "Internal Servr Error" }, 500);
      }
    },
  );

export default app;
