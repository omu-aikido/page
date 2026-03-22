<script setup lang="ts">
interface Props {
  id: string;
  label: string;
  modelValue: string;
  type?: "text" | "email";
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  required: false,
  disabled: false,
  rows: 1,
  autocomplete: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <label
    :for="id"
    class="mt-4 mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100"
  >
    {{ label }}
    <span v-if="required" aria-hidden="true" class="text-red-500">*</span>
  </label>
  <input
    v-if="rows === 1"
    :id="id"
    :type="type"
    :value="modelValue"
    :required="required"
    :disabled="disabled"
    :autocomplete="autocomplete"
    @input="handleInput"
    :class="[
      'w-full rounded-lg border bg-white px-3 py-2 text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
      error ? 'border-red-500' : 'border-neutral-300',
    ]"
  />
  <textarea
    v-else
    :id="id"
    :value="modelValue"
    :required="required"
    :disabled="disabled"
    :rows="rows"
    :autocomplete="autocomplete"
    @input="handleInput"
    :class="[
      'w-full rounded-lg border bg-white px-3 py-2 text-neutral-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
      error ? 'border-red-500' : 'border-neutral-300',
    ]"
  />
  <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
    {{ error }}
  </p>
</template>
