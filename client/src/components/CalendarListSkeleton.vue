<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  loading: boolean;
}>();

// 0から7までの配列
const skeletonItems = Array.from({ length: 8 }, (_, i) => i);
const exitStates = ref<boolean[]>(Array.from({ length: 8 }, () => false));
const isFullyExited = ref(false);

watch(
  () => props.loading,
  (newVal) => {
    if (!newVal) {
      skeletonItems.forEach((_, i) => {
        setTimeout(() => {
          exitStates.value[i] = true;

          // 最後のアイテムが消えるタイミングでDOMから消す
          if (i === skeletonItems.length - 1) {
            setTimeout(() => {
              isFullyExited.value = true;
            });
          }
        }, i * 60);
      });
    }
  },
);
</script>

<template>
  <div
    v-if="!isFullyExited"
    class="divide-y divide-zinc-200/70 dark:divide-zinc-700/70"
  >
    <!-- 修正ポイント: (item, index) として、0から始まるindexを確実に取得する -->
    <div
      v-for="(item, index) in skeletonItems"
      :key="item"
      class="stagger-item px-4 py-5 min-w-0 grid grid-flow-col grid-col-2 sm:grid-cols-[1fr_2fr]"
      :class="{ 'is-exiting': exitStates[index] }"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <h3 class="font-semibold text-lg">
        <div
          class="skeleton-item h-1em rounded bg-zinc-200 dark:bg-zinc-700"
          :class="[index % 3 !== 0 ? 'w-4em' : 'w-3em']"
        />
      </h3>

      <div class="space-y-1 text-sm text-body">
        <div class="flex-inline items-center gap-2">
          <div
            class="skeleton-item h-4 w-1em rounded bg-zinc-200 dark:bg-zinc-700"
          />
          <div
            class="skeleton-item h-4 w-5em rounded bg-zinc-200 dark:bg-zinc-700"
          />
        </div>
        <br />
        <div class="flex-inline items-center gap-2">
          <div
            class="skeleton-item h-4 w-1em rounded bg-zinc-200 dark:bg-zinc-700"
          />
          <div
            class="skeleton-item h-4 w-8em rounded bg-zinc-200 dark:bg-zinc-700"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stagger-item {
  animation: fadeSlideIn 0.4s ease both;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.is-exiting {
  opacity: 0 !important;
  transform: translateY(-4px) !important;
  pointer-events: none;
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
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

.skeleton-item {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 4s infinite;
}
</style>
