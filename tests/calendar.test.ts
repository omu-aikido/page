import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  clampCalendarMonth,
  createJstDate,
  formatEventDateRange,
  formatMonthlyEventTime,
  formatLocalDate,
  getJstDaysInMonth,
} from "../app/composables/useCalendar";
import {
  CALENDAR_CACHE_FRESH_SECONDS,
  CALENDAR_CACHE_STALE_SECONDS,
  createCalendarCacheKey,
  getCalendarCacheState,
  parseCalendarRangeQuery,
} from "../server/services/calendar-policy";
import { parseCalendarEvents } from "../server/services/calendar";

const JULY_2026 = new Date("2026-07-19T12:00:00+09:00");

function expectInvalidCalendarRange(query: Record<string, unknown>) {
  try {
    parseCalendarRangeQuery(query, JULY_2026);
    throw new Error("expected calendar range validation to fail");
  } catch (error) {
    expect((error as { statusCode?: number }).statusCode).toBe(400);
  }
}

describe("calendar JST helpers", () => {
  it("JST の月境界とうるう年を扱う", () => {
    expect(formatLocalDate(createJstDate(2026, 0, 1))).toBe("2026-01-01");
    expect(getJstDaysInMonth(2024, 1)).toBe(29);
    expect(getJstDaysInMonth(2026, 1)).toBe(28);
  });

  it("月表示を当月と翌月に制限する", () => {
    expect(clampCalendarMonth(2026, 5, JULY_2026)).toEqual({
      year: 2026,
      month: 6,
    });
    expect(clampCalendarMonth(2026, 7, JULY_2026)).toEqual({
      year: 2026,
      month: 7,
    });
    expect(clampCalendarMonth(9999, 0, JULY_2026)).toEqual({
      year: 2026,
      month: 7,
    });
    expect(clampCalendarMonth(Number.NaN, Number.NaN, JULY_2026)).toEqual({
      year: 2026,
      month: 6,
    });
  });
});

describe("calendar request policy", () => {
  it("当月から翌月までの正規化された範囲を許可する", () => {
    expect(
      parseCalendarRangeQuery(
        { start: "2026-07-01", end: "2026-08-31" },
        JULY_2026,
      ),
    ).toEqual({ start: "2026-07-01", end: "2026-08-31" });
  });

  it("無効日付、過去月、遠未来を拒否する", () => {
    expectInvalidCalendarRange({ start: "2026-02-31", end: "2026-03-01" });
    expectInvalidCalendarRange({ start: "2026-06-01", end: "2026-06-30" });
    expectInvalidCalendarRange({ start: "9999-01-01", end: "9999-01-31" });
  });

  it("キャッシュキーから未使用のクエリを除外する", () => {
    const key = createCalendarCacheKey(
      "https://omu-aikido.com/__calendar?start=bad&extra=cache-buster",
      { start: "2026-07-19", end: "2026-08-09" },
    );
    expect(key.url).toBe(
      "https://omu-aikido.com/__calendar?start=2026-07-19&end=2026-08-09",
    );
  });

  it("15分までは fresh、その後24時間までは stale と判定する", () => {
    const now = Date.now();
    expect(
      getCalendarCacheState(
        String(now - CALENDAR_CACHE_FRESH_SECONDS * 1000 + 1),
        now,
      ),
    ).toBe("fresh");
    expect(
      getCalendarCacheState(
        String(now - CALENDAR_CACHE_FRESH_SECONDS * 1000),
        now,
      ),
    ).toBe("stale");
    expect(
      getCalendarCacheState(
        String(now - CALENDAR_CACHE_STALE_SECONDS * 1000),
        now,
      ),
    ).toBe("expired");
    expect(getCalendarCacheState("invalid", now)).toBe("expired");
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

  it("月表示では同日内の時刻指定予定に開始・終了時刻を表示する", () => {
    const events = parseCalendarEvents(fixture, {
      start: "2026-07-06",
      end: "2026-07-06",
    });
    const event = events.find((item) => item.id === "weekly-1");

    expect(event && formatMonthlyEventTime(event)).toBe("18:00 - 20:00");
  });
});
