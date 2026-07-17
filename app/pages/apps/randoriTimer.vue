<script setup lang="ts">
definePageMeta({
  title: "乱取りタイマー",
  description: "掛かり稽古の交代を、音で知らせるタイマー",
});

import TimerPanel from "~/components/randoriTimer/TimerPanel.vue";
import SettingsPanel from "~/components/randoriTimer/SettingsPanel.vue";

const timer = useRandoriTimer();
</script>

<template>
  <section class="mx-auto max-w-3xl py-8">
    <header>
      <h1 class="h1">乱取りタイマー</h1>
      <p class="mt-2 fg-muted">交代の合図を音で知らせます。</p>
    </header>

    <TimerPanel
      :active-round="timer.activeRound.value"
      :display-time="timer.displayTime.value"
      :progress="timer.progress.value"
      :remaining="timer.remaining.value"
      :running="timer.running.value"
      :total-rounds="timer.durations.value.length"
      @reset="timer.reset"
      @toggle="timer.toggle"
    />

    <SettingsPanel
      :custom-presets="timer.customPresets.value"
      :durations="timer.durations.value"
      :running="timer.running.value"
      :selected-id="timer.selectedId.value"
      @delete-preset="timer.deletePreset"
      @save-preset="timer.savePreset"
      @set-durations="timer.setDurations"
    />
  </section>
</template>
