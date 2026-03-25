<script setup lang="ts">
import { computed, ref } from "vue";
import type { Event } from "./types";
import { getEventDateRange, isMultiDayEvent, formatEventTime } from "./calendarUtils";

interface CalendarGridProps {
  events: Event[];
}

const props = defineProps<CalendarGridProps>();

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());

const daysInMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate(),
);
const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay());
const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  }),
);

const calendarDays = computed(() => {
  const days: Date[] = [];
  for (let i = 0; i < firstDayOfMonth.value; i++) days.push(null as unknown as Date);
  for (let day = 1; day <= daysInMonth.value; day++)
    days.push(new Date(currentYear.value, currentMonth.value, day));
  return days;
});

const eventsByDate = computed(() => {
  const result = new Map<string, Event[]>();
  props.events.forEach((event) => {
    const { startDate, endDate } = getEventDateRange(event);
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    while (current <= end) {
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (!result.has(dateKey)) result.set(dateKey, []);
      result.get(dateKey)!.push(event);
      current.setDate(current.getDate() + 1);
    }
  });
  return result;
});

function getEventsForDate(date: Date): Event[] {
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return eventsByDate.value.get(dateKey) || [];
}

function getEventBadgeClass(title: string): string {
  if (title.includes("中百舌鳥")) return "event-badge-nakamo";
  if (title.includes("杉本")) return "event-badge-sugimoto";
  if (title.includes("会")) return "event-badge-kai";
  return "event-badge-default";
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// 動的クラス生成のため、semantic color shortcuts を使用
function getDayClass(date: Date): string {
  const day = date.getDay();
  if (day === 0) return "text-red-600 dark:text-red-400"; // 日曜日
  if (day === 6) return "text-blue-600 dark:text-blue-400"; // 土曜日
  return "text-heading";
}

function getWeekdayClass(weekday: string): string {
  if (weekday === "日") return "weekday-sunday";
  if (weekday === "土") return "weekday-saturday";
  return "weekday-weekday";
}

function isStartDay(event: Event, date: Date): boolean {
  const startDate = new Date(event.start);
  return (
    startDate.getFullYear() === date.getFullYear() &&
    startDate.getMonth() === date.getMonth() &&
    startDate.getDate() === date.getDate()
  );
}
</script>

<template>
  <div class="calendar-container container-main">
    <div class="card-base">
      <div class="calendar-header">
        <h2 class="text-title">{{ monthName }}</h2>
      </div>
      <div class="p-4 pt-0">
        <div class="grid grid-cols-7 gap-2 mb-3">
          <div
            v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
            :key="day"
            class="text-center font-medium py-2 text-[min(0.875rem,2.5cqw)]"
            :class="getWeekdayClass(day)"
          >
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-0.5">
          <div
            v-for="(date, index) in calendarDays"
            :key="index"
            class="calendar-cell"
            :class="[
              !date ? 'calendar-cell-empty' : 'calendar-cell-filled',
              date && isToday(date) ? 'calendar-cell-today' : 'calendar-day-default',
            ]"
          >
            <div v-if="date" class="h-full flex flex-col overflow-hidden">
              <span class="mb-2 font-medium text-[min(1rem,3cqw)]" :class="getDayClass(date)">{{
                date.getDate()
              }}</span>
              <div class="flex-1 space-y-1 overflow-y-auto">
                <div
                  v-for="event in getEventsForDate(date)"
                  :key="event.id"
                  class="px-[0.5cqw] py-[0.25cqw] rounded border"
                  :class="getEventBadgeClass(event.title)"
                  :title="`${event.title} ${formatEventTime(event.start)}${event.end ? ' - ' + formatEventTime(event.end) : ''}`"
                >
                  <div class="font-medium truncate text-[min(0.75rem,2cqw)]">{{ event.title }}</div>
                  <div
                    v-if="isStartDay(event, date) && !isMultiDayEvent(event)"
                    class="opacity-75 mt-0.5 text-[min(0.75rem,2cqw)]"
                  >
                    {{ formatEventTime(event.start) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  container-type: inline-size;
}
</style>
