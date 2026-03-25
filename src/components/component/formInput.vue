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
  <label :for="id" class="label-base">
    {{ label }}
    <span v-if="required" aria-hidden="true" class="required-mark">*</span>
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
    :class="['input-base', error ? 'input-error' : 'input-valid']"
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
    :class="['input-base', error ? 'input-error' : 'input-valid']"
  />
  <p v-if="error" class="error-text">{{ error }}</p>
</template>
