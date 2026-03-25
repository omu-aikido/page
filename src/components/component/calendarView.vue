<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import type { Event } from "./types";
import CalendarList from "./calendarList.vue";
import CalendarGrid from "./calendarGrid.vue";
import { client } from "lib/client";

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
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      res = await client.calendar.json.$get({
        query: { start: now.toISOString(), end: end.toISOString() },
      });
    } else {
      res = await client.calendar.json.$get();
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
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
  <div v-if="!loading && !error" class="mb-6">
    <div class="view-toggle-container">
      <button
        type="button"
        @click="viewMode = 'list'"
        :class="viewMode === 'list' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'"
      >
        <div class="i-heroicons:list-bullet-16-solid" />
        リスト
      </button>
      <button
        type="button"
        @click="viewMode = 'calendar'"
        :class="viewMode === 'calendar' ? 'view-toggle-btn-active' : 'view-toggle-btn-inactive'"
      >
        <div class="i-heroicons:calendar-days-16-solid" />
        カレンダー
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="loading" class="py-12 text-center">
    <div class="spinner mb-4"></div>
    <p class="text-lg text-muted">Loading...</p>
  </div>

  <!-- Error State -->
  <div v-if="error" class="alert-error">
    <div class="flex items-center">
      <div class="shrink-0">
        <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-status-error dark:text-red-200">
          エラーが発生しました
        </h3>
        <p class="mt-1 text-sm status-error">{{ error }}</p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-if="!loading && !error && currentMonthEvents.length === 0" class="py-12 text-center">
    <svg
      class="mx-auto mb-4 h-12 w-12 text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <p class="mb-2 text-lg text-muted">今月予定されている稽古はありません</p>
  </div>

  <!-- Calendar Grid View -->
  <CalendarGrid
    v-if="!loading && !error && currentMonthEvents.length > 0 && viewMode === 'calendar'"
    :events="currentMonthEvents"
  />

  <!-- Calendar List View -->
  <CalendarList
    v-if="!loading && !error && currentMonthEvents.length > 0 && viewMode === 'list'"
    :events="currentMonthEvents"
  />
</template>
