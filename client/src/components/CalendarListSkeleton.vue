<script setup lang="ts">
// Show 3-4 skeleton items by default
const skeletonItems = Array.from({ length: 8 }, (_, i) => i);
</script>

<template>
  <div class="divide-y divide-zinc-200/70 dark:divide-zinc-700/70">
    <div v-for="index in skeletonItems" :key="index" class="px-4 py-5 min-w-0 grid grid-flow-col grid-col-2 sm:grid-cols-[1fr_2fr] grid-cols-[1fr-1fr]">
      <div class="flex items-start gap-3">
        <h3
          class="font-semibold text-lg"
        >
          <!-- Title skeleton -->
          <div
            class="skeleton-item h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-700"
          />
        </h3>
          <!-- Details skeleton -->
          <div class="mt-2 space-y-2">
            <!-- Date line -->
            <div class="flex items-center gap-2">
              <div
                class="skeleton-item h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700"
              />
              <div
                class="skeleton-item h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700"
              />
            </div>

            <!-- Time line (sometimes shown) -->
            <div v-if="index % 3 !== 0" class="flex items-center gap-2">
              <div
                class="skeleton-item h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700"
              />
              <div
                class="skeleton-item h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700"
              />
            </div>
          </div>
        </div>
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
