<script setup lang="ts">
import type { Event } from "./types";
import {
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
  <div class="mb-8 space-y-4 max-w-180 mx-auto">
    <div v-for="event in events" :key="event.id" class="card-event">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 :class="getTitleClass(event.title)">
            {{ event.title }}
          </h3>
          <div class="text-md grid grid-cols-1 items-center text-muted sm:grid-cols-2">
            <div class="flex items-center">
              <div class="z-0 i-heroicons:calendar-20-solid" />
              &nbsp;
              <span class="mr-4 text-body">
                {{ formatEventDateRange(event) }}
              </span>
            </div>
            <div
              v-if="!isAllDayEvent(event) && event.start !== event.end && !isMultiDayEvent(event)"
              class="flex items-center"
            >
              <div class="z-0 i-heroicons:clock-16-solid" />
              &nbsp;
              <span class="mr-4 text-body">
                {{ formatEventTime(event.start) }}
                <span v-if="event.end"> - {{ formatEventTime(event.end) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
