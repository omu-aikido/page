<script setup lang="ts">
definePageMeta({
  title: "乱取りタイマー",
  description: "乱取り特化のタイマー",
});

import TimerPanel from "~/components/randoriTimer/TimerPanel.vue";
import SettingsPanel from "~/components/randoriTimer/SettingsPanel.vue";

const timer = useRandoriTimer();
</script>

<template>
  <section class="mx-auto max-w-3xl">
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
