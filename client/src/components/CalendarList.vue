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
const start = new Date();
const end = new Date(start.getTime() + weekCount * 7 * 24 * 60 * 60 * 1000);

onMounted(() => {
  fetchEvents(start, end);
});

function getTitleClass(title: string) {
  switch (true) {
    case title.includes("中百舌鳥"):
      return "event-nakamozu";
    case title.includes("杉本"):
      return "event-sugimoto";
    case title.includes("森之宮"):
      return "event-morinomiya";
    case title.includes("会"):
      return "event-event";
    default:
      return "event-default";
  }
}
</script>

<template>
  <CalendarListSkeleton v-if="loading" />

  <div v-if="error" class="px-3">
    <div class="flex items-start gap-3">
      <div class="status-icon-error">
        <div class="i-heroicons:exclamation-triangle h-5 w-5" />
      </div>
      <div class="min-w-0">
        <h3 class="text-heading text-lg font-bold">エラーが発生しました</h3>
        <p class="status-error mt-1">{{ error }}</p>
      </div>
    </div>
  </div>

  <div v-if="!loading && !error && events.length === 0" class="px-3">
    <div class="i-heroicons:calendar h-6 w-6 text-muted" />
    <p class="text-body mt-2">今月予定されている稽古はありません</p>
  </div>

  <div class="divide-y divide-zinc-200/70 dark:divide-zinc-700/70">
    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="stagger-item px-4 py-5 min-w-0 grid grid-flow-col grid-col-2 sm:grid-cols-[1fr_2fr] grid-cols-[1fr-1fr]"
      :class="getTitleClass(event.title)"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <h3
        class="font-semibold text-lg"
        :class="getTitleClass(event.title)"
      >
        {{ event.title }}
      </h3>
      <div class="space-y-1 text-sm text-body">
        <div class="flex-inline items-center gap-2">
          <div class="i-ri:calendar-view h-4 w-4" aria-hidden />
          {{ formatEventDateRange(event) }}
        </div>
        <br />
        <div
          v-if="
            !isAllDayEvent(event) &&
            event.start !== event.end &&
            !isMultiDayEvent(event)
          "
          class="flex-inline items-center gap-2"
          aria-hidden
        >
          <div class="i-ri:time-line h-4 w-4" />
          {{ formatEventTime(event.start) }}
          <span v-if="event.end"> - {{ formatEventTime(event.end) }}</span>
        </div>
      </div>
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
