<script setup lang="ts">
import { onMounted } from "vue";
import CalendarListSkeleton from "./CalendarListSkeleton.vue";
import {
  useCalendar,
  isAllDayEvent,
  isMultiDayEvent,
  formatEventDateRange,
  formatEventTime,
} from "@/composables/useCalendar";

const { events, loading, error, fetchEvents } = useCalendar();

const weekCount = 3;

onMounted(() => {
  const start = new Date();
  const end = new Date(start.getTime() + weekCount * 7 * 24 * 60 * 60 * 1000);
  fetchEvents(start, end);
});

function getTitleClass(title: string) {
  if (title.includes("中百舌鳥")) return "event-nakamozu";
  if (title.includes("杉本")) return "event-sugimoto";
  if (title.includes("森之宮")) return "event-morinomiya";
  if (title.includes("会")) return "event-event";
  return "event-default";
}
</script>

<template>
  <div class="relative">
    <div class="absolute inset-0 z-10 pointer-events-none">
      <CalendarListSkeleton :loading="loading" />
    </div>
    <div v-if="error" class="px-3">
      <div class="flex items-start gap-3">
        <div class="status-icon-error">
          <div class="i-ri:error-warning-line h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h3 class="h3">エラーが発生しました</h3>
          <p class="status-error mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && events.length === 0" class="px-3">
      <div class="i-ri:calendar-view h-6 w-6 fg-muted" aria-hidden />
      <p class="fg-muted mt-2">今月予定されている稽古はありません</p>
    </div>

    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="stagger-item bordered-muted [&:not(:last-child)]:border-b px-4 py-5 min-w-0 grid grid-flow-col grid-cols-2 sm:grid-cols-[1fr_2fr]"
      :class="getTitleClass(event.title)"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <h3 class="h3 w-4em">
        {{ event.title }}
      </h3>
      <stack class="text-sm fg-muted">
        <div class="inline-flex items-center gap-2">
          <div class="i-ri:calendar-view h-4 w-4" aria-hidden />
          {{ formatEventDateRange(event) }}
        </div>
        <div
          v-if="
            !isAllDayEvent(event) &&
            event.start !== event.end &&
            !isMultiDayEvent(event)
          "
          class="inline-flex items-center gap-2"
          aria-hidden
        >
          <div class="i-ri:time-line h-4 w-4" />
          {{ formatEventTime(event.start) }}
          <span v-if="event.end"> - {{ formatEventTime(event.end) }}</span>
        </div>
      </stack>
    </div>
  </div>
</template>

<style scoped>
.stagger-item {
  animation: fadeSlideIn 0.4s ease both;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
