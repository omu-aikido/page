import { client } from "@/lib/client";
import { onUnmounted, ref } from "vue";

export function useCalendar() {
  const events = ref<CalendarEvent[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function fetchEvents(start: Date, end: Date) {
    loading.value = true;
    error.value = null;
    try {
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      const res = await client.calendar.json.$get({
        query: { start: startStr, end: endStr },
      });
      if (res.ok) {
        events.value = await res.json();
      }
    } catch (e) {
      error.value = String(e);
    } finally {
      loading.value = false;
    }
  }

  onUnmounted(() => {
    loading.value = true;
  })

  return { events, loading, error, fetchEvents };
}

export type CalendarEvent = {
  id: string;
  start: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  end: string; // ISO 8601 for timed events, yyyy-mm-dd for all-day
  title: string;
  isAllDay: boolean;
  location?: string;
  description?: string;
};
/**
 * Parses event dates and adjusts the end date for range calculations.
 * - For all-day events (date-only strings like "2025-04-05"):
 *   Parse as local date and subtract 1 day from end to get the actual last day.
 * - For timed events (ISO 8601 strings):
 *   Parse as-is and subtract 1 minute to handle exclusive end boundaries.
 */
export function getEventDateRange(event: CalendarEvent) {
  if (event.isAllDay) {
    // All-day events use yyyy-mm-dd format
    // Parse start date
    const [startYear, startMonth, startDay] = event.start
      .split("-")
      .map(Number) as [number, number, number];
    const startDate = new Date(startYear, startMonth - 1, startDay);

    // Parse end date and subtract 1 day (since end date is exclusive in iCal)
    const [endYear, endMonth, endDay] = event.end.split("-").map(Number) as [
      number,
      number,
      number,
    ];
    const endDate = new Date(endYear, endMonth - 1, endDay);
    endDate.setDate(endDate.getDate() - 1);

    return { startDate, endDate };
  }

  // For timed events, use standard ISO 8601 parsing
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  // Subtract 1 minute to handle exclusive end boundary
  endDate.setMinutes(endDate.getMinutes() - 1);

  return { startDate, endDate };
}

/**
 * Determines if an event is an "All Day" event.
 * Uses the isAllDay flag from the API response.
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  return event.isAllDay;
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const { startDate, endDate } = getEventDateRange(event);

  return (
    startDate.getFullYear() !== endDate.getFullYear() ||
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getDate() !== endDate.getDate()
  );
}

/**
 * Formats the date range string.
 * e.g., "2月1日", "2月23日 - 2月27日"
 */
export function formatEventDateRange(event: CalendarEvent): string {
  const { startDate, endDate } = getEventDateRange(event);

  const format = (d: Date) =>
    d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()
  ) {
    return format(startDate);
  }

  return `${format(startDate)} - ${format(endDate)}`;
}

/**
 * Formats the time string.
 */
export function formatEventTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
