<script setup lang="ts">
// Show 3-4 skeleton items by default
const skeletonItems = Array.from({ length: 8 }, (_, i) => i);
</script>

<template>
  <div class="divide-y divide-zinc-200/70 dark:divide-zinc-700/70">
    <div
      v-for="index in skeletonItems"
      :key="index"
      class="stagger-item px-4 py-5 min-w-0 grid grid-flow-col grid-col-2 sm:grid-cols-[1fr_2fr]"
      :style="{ animationDelay: `${index * 60}ms` }"
    >
      <!-- Title skeleton -->
      <h3 class="font-semibold text-lg">
        <div
          class="skeleton-item h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-700"
        />
      </h3>

      <!-- Details skeleton -->
      <div class="space-y-1 text-sm text-body">
        <!-- Date line -->
        <div class="flex-inline items-center gap-2">
          <div
            class="skeleton-item h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700"
          />
          <div
            class="skeleton-item h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700"
          />
        </div>
        <br />
        <!-- Time line (sometimes shown) -->
        <div v-if="index % 3 !== 0" class="flex-inline items-center gap-2">
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
</template>

<style scoped>
.stagger-item {
  animation: fadeSlideIn 0.4s ease both;
}

/* Subtle shimmer effect for skeleton */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
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
