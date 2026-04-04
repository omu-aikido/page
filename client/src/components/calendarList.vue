<script setup lang="ts">
import {
  type Event,
  isAllDayEvent,
  isMultiDayEvent,
  formatEventDateRange,
  formatEventTime,
} from "./calendarUtils";

interface CalendarListProps {
  events: Event[];
}

defineProps<CalendarListProps>();

function getTitleClass(title: string) {
  if (title.includes("中百舌鳥")) {
    return "event-title-nakamo";
  } else if (title.includes("杉本")) {
    return "event-title-sugimoto";
  } else if (title.includes("会")) {
    return "event-title-kai";
  } else {
    return "event-title-default";
  }
}
</script>

<template>
  <div class="section-soft divide-y divide-zinc-200/70 dark:divide-zinc-700/70">
    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="stagger-item py-3"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <div class="flex items-start gap-3">
        <div
          class="mt-1 h-2.5 w-2.5 rounded-full"
          :class="getTitleClass(event.title)"
        />
        <div class="min-w-0">
          <h3 class="font-semibold text-lg" :class="getTitleClass(event.title)">
            {{ event.title }}
          </h3>
          <div class="mt-2 space-y-1 text-sm text-body">
            <div class="flex items-center">
              <div class="i-heroicons:calendar-days h-4 w-4" />
              <span class="ml-2">
                {{ formatEventDateRange(event) }}
              </span>
            </div>
            <div
              v-if="
                !isAllDayEvent(event) &&
                event.start !== event.end &&
                !isMultiDayEvent(event)
              "
            >
              <div class="flex items-center">
                <div class="i-heroicons:clock h-4 w-4" />
                <span class="ml-2">
                  {{ formatEventTime(event.start) }}
                  <span v-if="event.end">
                    - {{ formatEventTime(event.end) }}</span
                  >
                </span>
              </div>
            </div>
          </div>
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
