import { createError } from "h3";

import {
  createJstDate,
  formatLocalDate,
  getCurrentJstYearMonth,
  parseLocalDate,
} from "../../app/composables/useCalendar";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_MS = 62 * DAY_MS;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const CALENDAR_CACHE_FRESH_SECONDS = 15 * 60;
export const CALENDAR_CACHE_STALE_SECONDS = 24 * 60 * 60;
export const CALENDAR_CACHE_TIMESTAMP_HEADER = "x-calendar-cache-created-at";
export const CALENDAR_CACHE_STORAGE_CONTROL = `public, max-age=${CALENDAR_CACHE_STALE_SECONDS}`;
export const CALENDAR_CLIENT_CACHE_CONTROL = [
  "public",
  "max-age=60",
  `s-maxage=${CALENDAR_CACHE_FRESH_SECONDS}`,
  `stale-while-revalidate=${CALENDAR_CACHE_STALE_SECONDS - CALENDAR_CACHE_FRESH_SECONDS}`,
  `stale-if-error=${CALENDAR_CACHE_STALE_SECONDS}`,
].join(", ");

export type CalendarRange = {
  start: string;
  end: string;
};

export type CalendarCacheState = "fresh" | "stale" | "expired";

function invalidCalendarRange(): never {
  throw createError({
    statusCode: 400,
    statusMessage: "invalid calendar range",
  });
}

function parseDateQuery(value: unknown, endOfDay = false): Date {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
    invalidCalendarRange();
  }

  const date = parseLocalDate(value, { endOfDay });
  if (Number.isNaN(date.getTime()) || formatLocalDate(date) !== value) {
    invalidCalendarRange();
  }

  return date;
}

export function getAllowedCalendarWindow(now = new Date()) {
  const { year, month } = getCurrentJstYearMonth(now);
  const start = createJstDate(year, month, 1);
  const end = parseLocalDate(
    formatLocalDate(createJstDate(year, month + 2, 0)),
    { endOfDay: true },
  );
  return { start, end };
}

export function parseCalendarRangeQuery(
  query: Record<string, unknown>,
  now = new Date(),
): CalendarRange {
  const start = parseDateQuery(query.start);
  const end = parseDateQuery(query.end, true);

  if (end < start || end.getTime() - start.getTime() > MAX_RANGE_MS) {
    invalidCalendarRange();
  }

  const allowed = getAllowedCalendarWindow(now);
  if (start < allowed.start || end > allowed.end) {
    invalidCalendarRange();
  }

  return {
    start: query.start as string,
    end: query.end as string,
  };
}

export function createCalendarCacheKey(
  requestUrl: string,
  range: CalendarRange,
): Request {
  const url = new URL(requestUrl);
  url.pathname = "/__calendar";
  url.search = "";
  url.searchParams.set("start", range.start);
  url.searchParams.set("end", range.end);
  return new Request(url.toString(), { method: "GET" });
}

export function getCalendarCacheState(
  createdAt: string | null,
  now = Date.now(),
): CalendarCacheState {
  const timestamp = Number(createdAt);
  if (!Number.isFinite(timestamp)) return "expired";

  const age = Math.max(0, now - timestamp);
  if (age < CALENDAR_CACHE_FRESH_SECONDS * 1000) return "fresh";
  if (age < CALENDAR_CACHE_STALE_SECONDS * 1000) return "stale";
  return "expired";
}
