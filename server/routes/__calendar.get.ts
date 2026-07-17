import { getCalendarEventsJson } from "../services/calendar";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const start = typeof query.start === "string" ? query.start : undefined;
  const end = typeof query.end === "string" ? query.end : undefined;
  if (!start || !end) {
    throw createError({
      statusCode: 400,
      statusMessage: "start and end are required",
    });
  }
  const startTime = Date.parse(`${start}T00:00:00+09:00`);
  const endTime = Date.parse(`${end}T23:59:59+09:00`);
  if (
    Number.isNaN(startTime) ||
    Number.isNaN(endTime) ||
    endTime < startTime ||
    endTime - startTime > 62 * 24 * 60 * 60 * 1000
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "invalid calendar range",
    });
  }
  return getCalendarEventsJson({ start, end });
});
