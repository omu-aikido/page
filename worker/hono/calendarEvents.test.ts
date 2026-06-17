/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import { expandCalendarEvents, eventsToJson, filterEvents } from "./calendarEvents";

import type { IcsDateObject, IcsEvent } from "ts-ics";

const stamp = {
  date: new Date("2026-06-01T00:00:00.000Z"),
  type: "DATE-TIME" as const,
};

type TimedEventInput = Omit<Partial<IcsEvent>, "duration" | "end" | "start"> & {
  uid: string;
  summary: string;
  start: IcsDateObject;
  end: IcsDateObject;
};

function timedEvent(overrides: TimedEventInput): IcsEvent {
  return {
    stamp,
    ...overrides,
  };
}

describe("calendar event recurrence expansion", () => {
  test("expands recurring events into occurrences within the requested window", () => {
    const event = timedEvent({
      uid: "weekly-practice",
      summary: "週次稽古",
      start: {
        date: new Date("2026-06-01T10:00:00.000Z"),
        type: "DATE-TIME",
      },
      end: {
        date: new Date("2026-06-01T11:30:00.000Z"),
        type: "DATE-TIME",
      },
      recurrenceRule: {
        frequency: "WEEKLY",
        count: 4,
      },
    });

    const expanded = eventsToJson(
      filterEvents(
        expandCalendarEvents([event], {
          start: new Date("2026-06-01T00:00:00.000Z"),
          end: new Date("2026-06-30T23:59:59.999Z"),
        }),
        new Date("2026-06-01T00:00:00.000Z"),
        new Date("2026-06-30T23:59:59.999Z"),
      ),
    );

    expect(expanded.map((ev) => ev.start)).toEqual([
      "2026-06-01T10:00:00.000Z",
      "2026-06-08T10:00:00.000Z",
      "2026-06-15T10:00:00.000Z",
      "2026-06-22T10:00:00.000Z",
    ]);
    expect(expanded.map((ev) => ev.end)).toEqual([
      "2026-06-01T11:30:00.000Z",
      "2026-06-08T11:30:00.000Z",
      "2026-06-15T11:30:00.000Z",
      "2026-06-22T11:30:00.000Z",
    ]);
    expect(expanded.map((ev) => ev.id)).toEqual([
      "weekly-practice",
      "weekly-practice#2026-06-08T10:00:00.000Z",
      "weekly-practice#2026-06-15T10:00:00.000Z",
      "weekly-practice#2026-06-22T10:00:00.000Z",
    ]);
  });

  test("excludes recurrence instances listed in EXDATE", () => {
    const event = timedEvent({
      uid: "weekly-practice",
      summary: "週次稽古",
      start: {
        date: new Date("2026-06-01T10:00:00.000Z"),
        type: "DATE-TIME",
      },
      end: {
        date: new Date("2026-06-01T11:30:00.000Z"),
        type: "DATE-TIME",
      },
      recurrenceRule: {
        frequency: "WEEKLY",
        count: 3,
      },
      exceptionDates: [
        {
          date: new Date("2026-06-08T10:00:00.000Z"),
          type: "DATE-TIME",
        },
      ],
    });

    const expanded = eventsToJson(
      expandCalendarEvents([event], {
        start: new Date("2026-06-01T00:00:00.000Z"),
        end: new Date("2026-06-30T23:59:59.999Z"),
      }),
    );

    expect(expanded.map((ev) => ev.start)).toEqual([
      "2026-06-01T10:00:00.000Z",
      "2026-06-15T10:00:00.000Z",
    ]);
  });

  test("uses RECURRENCE-ID events to replace the generated occurrence", () => {
    const recurring = timedEvent({
      uid: "weekly-practice",
      summary: "週次稽古",
      start: {
        date: new Date("2026-06-01T10:00:00.000Z"),
        type: "DATE-TIME",
      },
      end: {
        date: new Date("2026-06-01T11:30:00.000Z"),
        type: "DATE-TIME",
      },
      recurrenceRule: {
        frequency: "WEEKLY",
        count: 3,
      },
    });
    const override = timedEvent({
      uid: "weekly-practice",
      summary: "変更後の稽古",
      start: {
        date: new Date("2026-06-08T12:00:00.000Z"),
        type: "DATE-TIME",
      },
      end: {
        date: new Date("2026-06-08T13:30:00.000Z"),
        type: "DATE-TIME",
      },
      recurrenceId: {
        value: {
          date: new Date("2026-06-08T10:00:00.000Z"),
          type: "DATE-TIME",
        },
      },
    });

    const expanded = eventsToJson(
      expandCalendarEvents([recurring, override], {
        start: new Date("2026-06-01T00:00:00.000Z"),
        end: new Date("2026-06-30T23:59:59.999Z"),
      }),
    );

    expect(expanded.map((ev) => [ev.title, ev.start])).toEqual([
      ["週次稽古", "2026-06-01T10:00:00.000Z"],
      ["変更後の稽古", "2026-06-08T12:00:00.000Z"],
      ["週次稽古", "2026-06-15T10:00:00.000Z"],
    ]);
  });
});
