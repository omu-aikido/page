<script setup lang="ts">
import { ref, computed } from "vue";

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
  const days: number[] = [];
  for (let i = 0; i < firstDayOfMonth.value; i++) days.push(0);
  for (let day = 1; day <= daysInMonth.value; day++) days.push(day);
  return days;
});

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
</script>

<template>
  <div class="">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-heading text-xl font-bold">{{ monthName }}</h2>
    </div>

    <!-- Calendar -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <!-- Weekday headers -->
        <thead>
          <tr>
            <th
              v-for="(day, i) in weekDays"
              :key="i"
              class="py-2 text-center text-sm font-semibold text-body"
            >
              {{ day }}
            </th>
          </tr>
        </thead>

        <!-- Calendar days -->
        <tbody>
          <tr
            v-for="(_, weekIndex) in Array(Math.ceil(calendarDays.length / 7))"
            :key="weekIndex"
          >
            <td
              v-for="(day, dayIndex) in calendarDays.slice(
                weekIndex * 7,
                (weekIndex + 1) * 7,
              )"
              :key="dayIndex"
              class="border border-zinc-200/50 p-2 dark:border-zinc-700/50"
              :class="{ 'bg-zinc-50 dark:bg-zinc-800/30': day === 0 }"
            >
              <div v-if="day !== 0" class="min-h-24">
                <!-- Day number skeleton -->
                <div
                  class="mb-2 h-5 w-6 rounded bg-zinc-200 dark:bg-zinc-700"
                />

                <!-- Event placeholders -->
                <div class="space-y-1">
                  <div
                    v-for="i in 2"
                    :key="i"
                    class="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-700/50"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Subtle shimmer effect for skeleton */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

div {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 2s infinite;
}
</style>
