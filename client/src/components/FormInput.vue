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
  <div class="form-field stack gap-1">
    <label :for="id" class="text-sm font-bold fg-base">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="text-error font-bold"
        >*</span
      >
    </label>
    <input
      v-if="rows === 1"
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="border bordered-muted bg-base rounded px-3 py-2 outline-none focus:border-accent"
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
      class="border bordered-muted bg-base rounded px-3 py-2 outline-none resize-y focus:border-accent"
      @input="handleInput"
    />
    <p v-if="error" class="text-error text-xs mt-1">{{ error }}</p>
  </div>
</template>
