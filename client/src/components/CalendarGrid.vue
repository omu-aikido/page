<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  type CalendarEvent,
  getEventDateRange,
  isMultiDayEvent,
  formatEventTime,
  useCalendar,
} from "@/composables/useCalendar";

const { events, error, fetchEvents } = useCalendar();

const today = new Date();
const start = new Date(today.getFullYear(), today.getMonth(), 1);
const end = new Date(today.getFullYear(), today.getMonth() + 1, 2);

onMounted(() => {
  fetchEvents(start, end).then(() => console.log(events.value));
});

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
  if (title.includes("中百舌鳥")) return "event-nakamozu";
  if (title.includes("杉本")) return "event-sugimoto";
  if (title.includes("森之宮")) return "event-morinomiya";
  if (title.includes("会")) return "event-event";
  return "event-default";
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
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
  <div v-if="error" class="text-red-500">エラーが発生しました</div>

  <div
    id="calendar-grid"
    class="calendar-container overflow-hidden"
    role="grid"
    aria-labelledby="cal-title"
  >
    <h2 id="cal-title" class="text-heading text-xl font-bold mb-4">
      {{ monthName }}
    </h2>

    <!-- 曜日ヘッダー: role="row" -->
    <div class="grid grid-cols-7 mb-1" role="row">
      <div
        v-for="day in ['日', '月', '火', '水', '木', '金', '土']"
        :key="day"
        role="columnheader"
        class="px-1 py-2 text-sm font-semibold text-center"
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
        class="min-h-24 rounded-sm p-1 border bg-zinc-50 dark:bg-zinc-800/40"
        :class="[
          !date && 'opacity-60',
          date && isToday(date)
            ? 'border-lime'
            : 'border-zinc-200/70 dark:border-zinc-700/70',
        ]"
      >
        <template v-if="date">
          <time
            class="text-xs font-semibold ml-1"
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
              :style="{ animationDelay: `${date.getDate() * 30}ms` }"
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
