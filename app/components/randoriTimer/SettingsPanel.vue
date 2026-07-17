<script setup lang="ts">
import {
  builtInRandoriPresets,
  formatDurations,
  type RandoriPreset,
} from "~/utils/randoriTimer";

const props = defineProps<{
  customPresets: RandoriPreset[];
  durations: number[];
  running: boolean;
  selectedId: string;
}>();

const emit = defineEmits<{
  deletePreset: [id: string];
  savePreset: [name: string];
  setDurations: [durations: number[], presetId?: string];
}>();

const bulkCount = ref(3);
const bulkSeconds = ref(30);
const presetName = ref("");

function applyBulkEdit() {
  const count = Math.max(1, Math.min(20, Math.round(bulkCount.value || 1)));
  const seconds = clampSeconds(bulkSeconds.value);
  bulkCount.value = count;
  bulkSeconds.value = seconds;
  emit(
    "setDurations",
    Array.from({ length: count }, () => seconds),
  );
}

function updateDuration(index: number, value: number) {
  const updated = [...props.durations];
  updated[index] = clampSeconds(value);
  emit("setDurations", updated);
}

function addPerson() {
  if (props.durations.length >= 20) return;
  emit("setDurations", [
    ...props.durations,
    props.durations.at(-1) ?? bulkSeconds.value,
  ]);
  bulkCount.value = props.durations.length + 1;
}

function removePerson(index: number) {
  if (props.durations.length === 1) return;
  emit(
    "setDurations",
    props.durations.filter((_, itemIndex) => itemIndex !== index),
  );
  bulkCount.value = props.durations.length - 1;
}

function savePreset() {
  if (!presetName.value.trim()) return;
  emit("savePreset", presetName.value);
  presetName.value = "";
}

function clampSeconds(value: number) {
  return Math.max(5, Math.min(600, Math.round(value || 5)));
}
</script>

<template>
  <section
    class="mt-8"
    :class="{ 'pointer-events-none opacity-55': running }"
    :aria-disabled="running"
  >
    <div
      class="flex items-baseline justify-between border-b-2 pb-2 bordered-base"
    >
      <h2 class="h2">プリセット</h2>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2" aria-label="組み込みプリセット">
      <button
        v-for="preset in builtInRandoriPresets"
        :key="preset.id"
        type="button"
        class="button base bordered-muted border p-4 text-left"
        :class="
          selectedId === preset.id
            ? 'bordered-accent ring-1 ring-sky-600 dark:ring-sky-500'
            : ''
        "
        :disabled="running"
        @click="$emit('setDurations', preset.durations, preset.id)"
      >
        <span class="block text-lg font-bold">{{ preset.name }}</span
        ><span class="mt-1 block text-sm fg-muted">{{
          formatDurations(preset.durations)
        }}</span>
      </button>
    </div>

    <div class="mt-5">
      <ol class="mt-2 overflow-hidden rounded border bordered-muted bg-base">
        <li
          v-for="(duration, index) in durations"
          :key="index"
          class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 bordered-base"
        >
          <label class="flex flex-1 items-center justify-between gap-4"
            ><span class="font-bold">{{ index + 1 }}人目</span
            ><span class="relative w-32"
              ><input
                :value="duration"
                class="w-full rounded border bordered-muted bg-base px-3 py-2 pr-9 text-right font-mono fg-base tabular-nums"
                type="number"
                min="5"
                max="600"
                step="5"
                :aria-label="`${index + 1}人目の持ち時間`"
                @change="
                  updateDuration(
                    index,
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              /><span
                class="pointer-events-none absolute right-3 top-2 fg-muted"
                >秒</span
              ></span
            ></label
          >
          <button
            type="button"
            class="button p-2 fg-muted hover:text-red-600 before:i-ri:delete-bin-line before:content-empty"
            :disabled="durations.length === 1"
            :aria-label="`${index + 1}人目を削除`"
            @click="removePerson(index)"
          />
        </li>
      </ol>
      <button
        type="button"
        class="button base bordered-muted mt-2 w-full border border-dashed py-2 fg-muted before:i-ri:add-fill before:mr-1 before:content-empty"
        :disabled="durations.length >= 20"
        @click="addPerson"
      >
        人を追加
      </button>
    </div>

    <details class="mt-5 rounded border bordered-muted bg-ghost p-4">
      <summary class="cursor-pointer font-bold">一括編集</summary>
      <div class="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label class="stack gap-1 text-sm fg-muted"
          >人数<span class="relative"
            ><input
              v-model.number="bulkCount"
              class="w-full rounded border bordered-muted bg-base px-3 py-2 pr-9 fg-base"
              type="number"
              min="1"
              max="20"
            /><span class="pointer-events-none absolute right-3 top-2 fg-muted"
              >人</span
            ></span
          ></label
        >
        <label class="stack gap-1 text-sm fg-muted"
          >時間<span class="relative"
            ><input
              v-model.number="bulkSeconds"
              class="w-full rounded border bordered-muted bg-base px-3 py-2 pr-9 fg-base"
              type="number"
              min="5"
              max="600"
              step="5"
            /><span class="pointer-events-none absolute right-3 top-2 fg-muted"
              >秒</span
            ></span
          ></label
        >
        <button
          type="button"
          class="button base bordered-muted border px-4 py-2"
          @click="applyBulkEdit"
        >
          全員に反映
        </button>
      </div>
    </details>

    <div class="mt-5 flex gap-2">
      <input
        v-model="presetName"
        class="min-w-0 flex-1 rounded border bordered-muted bg-base px-3 py-2 fg-base"
        type="text"
        maxlength="20"
        placeholder="この設定に名前をつける"
        @keyup.enter="savePreset"
      />
      <button
        type="button"
        class="button accent px-4 py-2 before:i-ri:add-line before:mr-1 before:content-empty"
        :disabled="!presetName.trim()"
        @click="savePreset"
      >
        保存
      </button>
    </div>

    <div
      v-if="customPresets.length"
      class="mt-3 divide-y bordered-muted border-y"
    >
      <div
        v-for="preset in customPresets"
        :key="preset.id"
        class="flex items-center"
      >
        <button
          type="button"
          class="button flex-1 px-1 py-3 text-left"
          @click="$emit('setDurations', preset.durations, preset.id)"
        >
          <span class="block font-bold">{{ preset.name }}</span
          ><span class="block text-sm fg-muted">{{
            formatDurations(preset.durations)
          }}</span>
        </button>
        <button
          type="button"
          class="button p-3 fg-muted hover:text-red-600 before:i-ri:delete-bin-line before:content-empty"
          :aria-label="`${preset.name}を削除`"
          @click="$emit('deletePreset', preset.id)"
        />
      </div>
    </div>
  </section>
</template>
