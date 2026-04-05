<script setup lang="ts">
interface Props {
  id: string;
  label: string;
  modelValue: string;
  type?: "text" | "email";
  error: string | undefined;
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
  <div class="form-field">
    <label :for="id" class="form-label">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-red-600">*</span>
    </label>
    <input
      v-if="rows === 1"
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="form-input"
      @input="handleInput"
    />
    <textarea
      v-else
      :id="id"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :autocomplete="autocomplete"
      class="form-input resize-y"
      @input="handleInput"
    />
    <p v-if="error" class="form-error">{{ error }}</p>
  </div>
</template>
