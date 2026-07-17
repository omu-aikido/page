<script setup lang="ts">
import type {
  RandoriPlaybackMode,
  RandoriTimerStatus,
} from "~/composables/useRandoriTimer";

defineProps<{
  activeRound: number;
  displayTime: string;
  progress: number;
  remaining: number;
  resetDisabled: boolean;
  running: boolean;
  playbackMode: RandoriPlaybackMode;
  startDisabled: boolean;
  status: RandoriTimerStatus;
  totalRounds: number;
}>();

defineEmits<{ reset: []; toggle: [] }>();
</script>

<template>
  <section class="card mt-6 overflow-hidden" aria-live="polite">
    <div class="flex items-center justify-between text-sm fg-muted">
      <div aria-hidden="true"></div>
      <span>{{ activeRound }} / {{ totalRounds }}</span>
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
        class="button accent px-8 py-3 font-bold before:content-empty"
        :class="running ? 'before:i-ri:pause-fill' : 'before:i-ri:play-fill'"
        :disabled="startDisabled"
        :aria-label="
          status === 'playing'
            ? '一時停止'
            : status === 'paused'
              ? '再開'
              : '開始'
        "
        @click="$emit('toggle')"
      ></button>
      <button
        type="button"
        class="button base bordered-muted border px-4 py-3 before:i-ri:restart-line before:content-empty"
        aria-label="最初からやり直す"
        :disabled="resetDisabled"
        @click="$emit('reset')"
      />
    </div>
  </section>
  <p class="mx-4 mt-2 text-sm fg-muted">
    <template v-if="playbackMode === 'background'">
      他のアプリを開いている間も合図音を再生します。端末やOSの状態によって停止する場合があります。
    </template>
    <template v-else>
      画面を閉じたり他のアプリへ移動すると、タイマーや合図音が停止する場合があります。
    </template>
  </p>
</template>
