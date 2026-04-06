<script setup lang="ts">
import { computed, ref } from "vue";
import {
  type CalendarEvent,
  getEventDateRange,
  isMultiDayEvent,
  formatEventTime,
} from "@/composables/useCalendar";

interface CalendarGridProps {
  events: CalendarEvent[];
}

const props = defineProps<CalendarGridProps>();

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());

const daysInMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate(),
);
const firstDayOfMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).getDay(),
);
const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  }),
);

const calendarDays = computed(() => {
  const days: Date[] = [];
  for (let i = 0; i < firstDayOfMonth.value; i++)
    days.push(null as unknown as Date);
  for (let day = 1; day <= daysInMonth.value; day++)
    days.push(new Date(currentYear.value, currentMonth.value, day));
  return days;
});

const eventsByDate = computed(() => {
  const result = new Map<string, CalendarEvent[]>();
  props.events.forEach((event) => {
    const { startDate, endDate } = getEventDateRange(event);
    const current = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    const end = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );
    while (current <= end) {
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (!result.has(dateKey)) result.set(dateKey, []);
      result.get(dateKey)!.push(event);
      current.setDate(current.getDate() + 1);
    }
  });
  return result;
});

function getEventsForDate(date: Date): CalendarEvent[] {
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

function isStartDay(event: CalendarEvent, date: Date): boolean {
  const startDate = new Date(event.start);
  return (
    startDate.getFullYear() === date.getFullYear() &&
    startDate.getMonth() === date.getMonth() &&
    startDate.getDate() === date.getDate()
  );
}
</script>

<template>
  <div class="calendar-container overflow-hidden px-2">
    <div class="space-y-3">
      <div>
        <h2 class="text-heading text-xl font-bold">{{ monthName }}</h2>
      </div>
      <div class="space-y-1">
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
            :key="day"
            class="px-1 py-2 text-center text-xs font-semibold"
            :class="getWeekdayClass(day)"
          >
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(date, index) in calendarDays"
            :key="index"
            class="min-h-20 rounded-md border border-zinc-200/70 bg-zinc-50 p-1 dark:(border-zinc-700/70 bg-zinc-800/40)"
          >
            <div v-if="date" class="h-full">
              <span
                class="text-xs font-semibold"
                :class="[
                  getDayClass(date),
                  isToday(date)
                    ? 'rounded bg-brand-100 px-1.5 py-0.5 dark:bg-brand-700/30'
                    : '',
                ]"
                >{{ date.getDate() }}</span
              >
              <div class="mt-1 space-y-1">
                <div
                  v-for="event in getEventsForDate(date)"
                  :key="event.id"
                  class="rounded px-1 py-0.5 text-[11px] leading-tight"
                  :class="getEventBadgeClass(event.title)"
                  :title="`${event.title} ${formatEventTime(event.start)}${event.end ? ' - ' + formatEventTime(event.end) : ''}`"
                >
                  <div class="truncate">{{ event.title }}</div>
                  <div
                    v-if="isStartDay(event, date) && !isMultiDayEvent(event)"
                    class="mt-0.5 text-[10px] opacity-80"
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
