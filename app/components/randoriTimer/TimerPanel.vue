<script setup lang="ts">
defineProps<{
  activeRound: number;
  displayTime: string;
  progress: number;
  remaining: number;
  running: boolean;
  totalRounds: number;
}>();

defineEmits<{ reset: []; toggle: [] }>();
</script>

<template>
  <section class="card mt-6 overflow-hidden" aria-live="polite">
    <div class="flex items-center justify-between text-sm fg-muted">
      <span>{{ activeRound }}人目 / {{ totalRounds }}</span>
    </div>
    <div
      class="my-4 text-center font-mono text-7xl font-bold leading-none tracking-tighter sm:text-9xl tabular-nums"
      aria-label="残り時間"
    >
      {{ displayTime }}
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <i
        class="block h-full bg-accent transition-[width] duration-800 ease-linear"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <div class="mt-5 flex justify-center gap-2">
      <button
        type="button"
        class="button accent px-8 py-3 font-bold before:mr-1 before:content-empty"
        :class="running ? 'before:i-ri:pause-fill' : 'before:i-ri:play-fill'"
        @click="$emit('toggle')"
      ></button>
      <button
        type="button"
        class="button base bordered-muted border px-4 py-3 before:i-ri:restart-line before:content-empty"
        aria-label="最初からやり直す"
        @click="$emit('reset')"
      />
    </div>
  </section>
</template>
