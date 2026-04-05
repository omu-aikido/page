<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import type { Event } from "./calendarUtils";
import CalendarList from "./calendarList.vue";
import CalendarGrid from "./calendarGrid.vue";
import CalendarListSkeleton from "./CalendarListSkeleton.vue";
import CalendarGridSkeleton from "./CalendarGridSkeleton.vue";
import { client } from "@/lib/client";

const events = ref<Event[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const viewMode = ref<"list" | "calendar">("list");

let cancelled = false;
let controller: AbortController;

async function fetchEvents() {
  loading.value = true;
  error.value = null;

  try {
    let res;
    if (viewMode.value === "list") {
      // List: Fetch next 30 days starting from today
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);

      res = await client.calendar.json.$get({
        query: { start: now.toISOString(), end: end.toISOString() },
      });
    } else {
      // Calendar: Use API default (current month)
      res = await client.calendar.json.$get();
    }
    if (!res.ok) {
      throw new Error(
        `Failed to fetch events: ${res.status} ${res.statusText}`,
      );
    }
    const data = (await res.json()) as Event[];
    if (!cancelled) {
      events.value = Array.isArray(data) ? data : [];
    }
  } catch (err: unknown) {
    if (!cancelled && !(err instanceof Error && err.name === "AbortError")) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = "稽古予定の読み込みに失敗しました";
      }
      events.value = [];
    }
  } finally {
    if (!cancelled) loading.value = false;
  }
}

const currentMonthEvents = computed(() => events.value);

watch(viewMode, () => {
  controller.abort();
  controller = new AbortController();
  fetchEvents();
});

onMounted(() => {
  controller = new AbortController();
  fetchEvents();
});

onUnmounted(() => {
  cancelled = true;
  if (controller) controller.abort();
});
</script>

<template>
  <!-- View Mode Toggle -->
  <div v-if="!error" class="mb-4 flex items-center justify-end gap-2">
    <button
      type="button"
      class="btn-toggle cursor-pointer"
      :class="{ 'btn-toggle-active': viewMode === 'list' }"
      :disabled="loading"
      @click="viewMode = 'list'"
    >
      <span class="i-ri:list-check text-base" />
      リスト
    </button>
    <button
      type="button"
      class="btn-toggle cursor-pointer"
      :class="{ 'btn-toggle-active': viewMode === 'calendar' }"
      :disabled="loading"
      @click="viewMode = 'calendar'"
    >
      <span class="i-ri:calendar-fill text-base" />
      カレンダー
    </button>
  </div>

  <!-- Loading State - Skeleton -->
  <CalendarListSkeleton v-if="loading && viewMode === 'list'" />
  <CalendarGridSkeleton v-if="loading && viewMode === 'calendar'" />

  <!-- Error State -->
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

  <!-- Empty State -->
  <div
    v-if="!loading && !error && currentMonthEvents.length === 0"
    class="px-3"
  >
    <div class="i-heroicons:calendar h-6 w-6 text-muted" />
    <p class="text-body mt-2">今月予定されている稽古はありません</p>
  </div>

  <!-- Calendar Grid View -->
  <CalendarGrid
    v-if="
      !loading &&
      !error &&
      currentMonthEvents.length > 0 &&
      viewMode === 'calendar'
    "
    :events="currentMonthEvents"
  />

  <!-- Calendar List View -->
  <CalendarList
    v-if="
      !loading && !error && currentMonthEvents.length > 0 && viewMode === 'list'
    "
    :events="currentMonthEvents"
  />
</template>
