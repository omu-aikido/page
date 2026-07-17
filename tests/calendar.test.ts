import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  createJstDate,
  formatEventDateRange,
  formatLocalDate,
  getJstDaysInMonth,
} from "../app/composables/useCalendar";
import { parseCalendarEvents } from "../server/services/calendar";

describe("calendar JST helpers", () => {
  it("JST の月境界とうるう年を扱う", () => {
    expect(formatLocalDate(createJstDate(2026, 0, 1))).toBe("2026-01-01");
    expect(getJstDaysInMonth(2024, 1)).toBe(29);
    expect(getJstDaysInMonth(2026, 1)).toBe(28);
  });
});

describe("ICS parsing", () => {
  const fixture = readFileSync(
    fileURLToPath(new URL("./fixtures/calendar.ics", import.meta.url)),
    "utf8",
  );

  it("終日予定の排他的 DTEND を1日として表示する", () => {
    const events = parseCalendarEvents(fixture, {
      start: "2026-07-20",
      end: "2026-07-20",
    });
    expect(events).toHaveLength(2);
    const event = events.find((item) => item.id === "all-day-1");
    expect(event?.isAllDay).toBe(true);
    expect(event && formatEventDateRange(event)).toContain("7月20日");
  });

  it("RRULE を展開し EXDATE を除外する", () => {
    const events = parseCalendarEvents(fixture, {
      start: "2026-07-01",
      end: "2026-07-31",
    }).filter((event) => event.title.includes("中百舌鳥"));
    expect(events).toHaveLength(2);
    expect(events.map((event) => event.start.slice(0, 10))).toEqual([
      "2026-07-06",
      "2026-07-20",
    ]);
  });
});
