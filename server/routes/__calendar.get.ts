import { defineEventHandler, getQuery, getRequestURL } from "h3";

import { getCalendarEventsJson } from "../services/calendar";
import {
  CALENDAR_CACHE_STORAGE_CONTROL,
  CALENDAR_CACHE_TIMESTAMP_HEADER,
  CALENDAR_CLIENT_CACHE_CONTROL,
  type CalendarRange,
  createCalendarCacheKey,
  getCalendarCacheState,
  parseCalendarRangeQuery,
} from "../services/calendar-policy";
import { getCloudflareRuntime } from "../utils/cloudflare";

const refreshes = new Map<string, Promise<Response>>();

function createStoredResponse(json: string): Response {
  return new Response(json, {
    headers: {
      "Cache-Control": CALENDAR_CACHE_STORAGE_CONTROL,
      "Content-Type": "application/json; charset=utf-8",
      [CALENDAR_CACHE_TIMESTAMP_HEADER]: String(Date.now()),
    },
  });
}

function createClientResponse(
  response: Response,
  cacheStatus: "HIT" | "STALE" | "MISS",
): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", CALENDAR_CLIENT_CACHE_CONTROL);
  headers.set("X-Calendar-Cache", cacheStatus);
  headers.delete(CALENDAR_CACHE_TIMESTAMP_HEADER);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function refreshCalendarCache(
  cache: Cache,
  cacheKey: Request,
  range: CalendarRange,
): Promise<Response> {
  const refreshKey = cacheKey.url;
  let refresh = refreshes.get(refreshKey);

  if (!refresh) {
    refresh = (async () => {
      const events = await getCalendarEventsJson(range);
      const response = createStoredResponse(JSON.stringify(events));

      try {
        await cache.put(cacheKey, response.clone());
      } catch (error) {
        console.error("Failed to store calendar response in cache", error);
      }

      return response;
    })().finally(() => {
      refreshes.delete(refreshKey);
    });
    refreshes.set(refreshKey, refresh);
  }

  return (await refresh).clone();
}

function scheduleRefresh(
  context: Record<string, unknown>,
  refresh: Promise<Response>,
): void {
  const task = refresh
    .then(() => undefined)
    .catch((error) => {
      console.error("Failed to refresh stale calendar response", error);
    });

  try {
    const executionContext = getCloudflareRuntime(context).context;
    if (executionContext) {
      executionContext.waitUntil(task);
      return;
    }
  } catch {
    // Non-Cloudflare development runtimes may not expose an execution context.
  }

  void task;
}

export default defineEventHandler(async (event) => {
  const range = parseCalendarRangeQuery(getQuery(event));
  const cacheKey = createCalendarCacheKey(
    getRequestURL(event).toString(),
    range,
  );
  const cache = await caches.open("calendar-json-v1");

  let cached: Response | undefined;
  try {
    cached = await cache.match(cacheKey);
  } catch (error) {
    console.error("Failed to read calendar response cache", error);
  }

  if (cached) {
    const state = getCalendarCacheState(
      cached.headers.get(CALENDAR_CACHE_TIMESTAMP_HEADER),
    );

    if (state === "fresh") {
      return createClientResponse(cached, "HIT");
    }

    if (state === "stale") {
      scheduleRefresh(
        event.context,
        refreshCalendarCache(cache, cacheKey, range),
      );
      return createClientResponse(cached, "STALE");
    }
  }

  const response = await refreshCalendarCache(cache, cacheKey, range);
  return createClientResponse(response, "MISS");
});
