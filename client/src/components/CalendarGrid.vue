<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  type CalendarEvent,
  getEventDateRange,
  isMultiDayEvent,
  formatEventTime,
  useCalendar,
} from "@/composables/useCalendar";

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

const { events, error, fetchEvents } = useCalendar();

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());

onMounted(() => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 2);
  fetchEvents(start, end);
});

const todayDate = computed(() => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    date: now.getDate(),
  };
});

function prevMonth() {
  const now = new Date();
  const minMonth = now.getMonth();
  if (currentYear.value === now.getFullYear() && currentMonth.value <= minMonth)
    return;

  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  const now = new Date();
  const maxMonth = now.getMonth() + 1;
  if (currentYear.value === now.getFullYear() && currentMonth.value >= maxMonth)
    return;

  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function canGoNext() {
  const now = new Date();
  return (
    currentYear.value < now.getFullYear() ||
    currentMonth.value < now.getMonth() + 1
  );
}

function canGoPrev() {
  const now = new Date();
  return (
    currentYear.value > now.getFullYear() || currentMonth.value > now.getMonth()
  );
}

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
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth.value; day++) {
    days.push(new Date(currentYear.value, currentMonth.value, day));
  }

  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    days.push(null);
  }

  return days;
});

const eventsByDate = computed(() => {
  const result = new Map<string, CalendarEvent[]>();
  events.value.forEach((event) => {
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
      const key = dateKey(current);
      if (!result.has(key)) result.set(key, []);
      result.get(key)!.push(event);
      current.setDate(current.getDate() + 1);
    }
  });
  return result;
});

function getEventsForDate(date: Date): CalendarEvent[] {
  return eventsByDate.value.get(dateKey(date)) || [];
}

function getEventBadgeClass(title: string): string {
  if (title.includes("中百舌鳥")) return "event-nakamozu";
  if (title.includes("杉本")) return "event-sugimoto";
  if (title.includes("森之宮")) return "event-morinomiya";
  if (title.includes("会")) return "event-event";
  return "event-default";
}

function isToday(date: Date): boolean {
  return (
    date.getDate() === todayDate.value.date &&
    date.getMonth() === todayDate.value.month &&
    date.getFullYear() === todayDate.value.year
  );
}

const WEEKDAY_CLASSES: Record<string, string> = {
  日: "text-red-500",
  月: "fg-base",
  火: "fg-base",
  水: "fg-base",
  木: "fg-base",
  金: "fg-base",
  土: "text-blue-500",
};

function getWeekdayClass(weekday: string): string {
  return WEEKDAY_CLASSES[weekday] ?? "fg-ghost";
}

function isStartDay(event: CalendarEvent, date: Date): boolean {
  const startDate = new Date(event.start);
  return (
    startDate.getFullYear() === date.getFullYear() &&
    startDate.getMonth() === date.getMonth() &&
    startDate.getDate() === date.getDate()
  );
}

function getEventAnimationDelay(event: CalendarEvent): number {
  const index = events.value.findIndex((e) => e.id === event.id);
  return index >= 0 ? index * 30 : 0;
}
</script>

<template>
  <div v-if="error" class="text-error">エラーが発生しました</div>

  <div
    id="calendar-grid"
    class="calendar-container overflow-hidden"
    role="grid"
    aria-labelledby="cal-title"
  >
    <h2 id="cal-title" class="h2 mb-4 flex items-center justify-between">
      <button
        class="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!canGoPrev()"
        aria-label="前の月"
        @click="prevMonth"
      >
        <div class="i-ri:arrow-left-s-line h-5 w-5" />
      </button>
      <span>{{ monthName }}</span>
      <button
        class="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!canGoNext()"
        aria-label="次の月"
        @click="nextMonth"
      >
        <div class="i-ri:arrow-right-s-line h-5 w-5" />
      </button>
    </h2>

    <!-- 曜日ヘッダー: role="row" -->
    <div class="grid grid-cols-7 mb-2" role="row">
      <div
        v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
        :key="day"
        role="columnheader"
        class="text-sm font-semibold text-center"
        :class="getWeekdayClass(day)"
      >
        {{ day }}
      </div>
    </div>

    <!-- 日付グリッド: role="rowgroup" (tbodyに相当) -->
    <div class="grid grid-cols-7 gap-1" role="rowgroup">
      <div
        v-for="(date, index) in calendarDays"
        :key="index"
        role="gridcell"
        class="min-h-24 rounded-sm p-1 border bg-zinc-200/20 dark:bg-zinc-800/20"
        :class="[
          !date && 'opacity-60',
          date && isToday(date)
            ? 'border bordered-accent print:bordered-muted'
            : 'border bordered-muted',
        ]"
      >
        <template v-if="date">
          <time
            class="text-xs font-semibold ml-1 fg-base"
            :datetime="`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`"
          >
            {{ date.getDate() }}
          </time>

          <ul class="mt-1 space-y-1">
            <li
              v-for="event in getEventsForDate(date)"
              :key="event.id"
              class="rounded px-1 py-0.5 text-[11px] leading-tight stagger-item"
              :class="getEventBadgeClass(event.title)"
              :title="`${event.title} ${formatEventTime(event.start)}${event.end ? ' - ' + formatEventTime(event.end) : ''}`"
              :style="{ animationDelay: `${getEventAnimationDelay(event)}ms` }"
            >
              <span class="truncate block">{{ event.title }}</span>
              <span class="flex-inline truncate">
                <time
                  v-if="isStartDay(event, date) && !isMultiDayEvent(event)"
                  class="block mt-0.5 text-[10px] opacity-80"
                >
                  {{ formatEventTime(event.start) }}
                </time>
              </span>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  container-type: inline-size;
}

.stagger-item {
  animation: fadeSlideIn 0.4s ease both;
}

@media (prefers-reduced-motion: reduce) {
  .stagger-item {
    animation: none;
  }
}
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
