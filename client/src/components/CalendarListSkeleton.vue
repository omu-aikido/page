<script setup lang="ts">
// Show 3-4 skeleton items by default
const skeletonItems = Array.from({ length: 4 }, (_, i) => i);
</script>

<template>
  <div class="divide-y divide-zinc-200/70 dark:divide-zinc-700/70">
    <div v-for="index in skeletonItems" :key="index" class="py-3">
      <div class="flex items-start gap-3">
        <!-- Color dot skeleton -->
        <div
          class="mt-1 h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700"
        />
        <div class="min-w-0 flex-1">
          <!-- Title skeleton -->
          <div class="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />

          <!-- Details skeleton -->
          <div class="mt-2 space-y-2">
            <!-- Date line -->
            <div class="flex items-center gap-2">
              <div class="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div class="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <!-- Time line (sometimes shown) -->
            <div v-if="index % 3 !== 0" class="flex items-center gap-2">
              <div class="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div class="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
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
