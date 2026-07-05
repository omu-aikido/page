<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import { actions, isInputError } from "astro:actions";

import FormInput from "@/components/FormInput.vue";
import TurnstileStatus from "@/components/TurnstileStatus.vue";
import {
  getTurnstileErrorMessage,
  hasContactFormErrors,
  validateContactForm,
} from "@/lib/contact-form";

const form = reactive({
  name: "",
  email: "",
  subject: "",
  body: "",
});

const EMPTY_FIELD_ERRORS = {
  name: "",
  email: "",
  subject: "",
  body: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const status = ref<SubmitStatus>("idle");
const errorMessage = ref("");

const fieldErrors = reactive({ ...EMPTY_FIELD_ERRORS });

const siteKey = import.meta.env.PUBLIC_CF_TURNSTILE_SITEKEY ?? "";

const turnstileRef = ref<InstanceType<typeof TurnstileStatus> | null>(null);

const isReadyToSubmit = computed(() => {
  const hasContent =
    form.name.trim() &&
    form.email.trim() &&
    form.subject.trim() &&
    form.body.trim();
  const isVerified = turnstileRef.value?.status === "verified";
  return hasContent && isVerified;
});

function syncFieldErrors(nextErrors: typeof EMPTY_FIELD_ERRORS) {
  Object.assign(fieldErrors, nextErrors);
}

async function handleSubmit() {
  const turnstile = turnstileRef.value;
  if (!turnstile || turnstile.status !== "verified") {
    errorMessage.value = getTurnstileErrorMessage(
      turnstile?.status,
      turnstile?.errorCode,
    );
    status.value = "error";
    return;
  }

  const nextErrors = validateContactForm(form);
  syncFieldErrors(nextErrors);
  if (hasContactFormErrors(nextErrors)) {
    status.value = "error";
    return;
  }

  status.value = "submitting";
  errorMessage.value = "";

  try {
    const formData = new FormData();
    formData.set("name", form.name);
    formData.set("email", form.email);
    formData.set("subject", form.subject);
    formData.set("body", form.body);
    formData.set("cf-turnstile-response", turnstile.token);

    const result = await actions.contact(formData);

    if (!result.error) {
      status.value = "success";
      Object.assign(form, { name: "", email: "", subject: "", body: "" });
      syncFieldErrors({ ...EMPTY_FIELD_ERRORS });
      turnstile.reset();
    } else {
      status.value = "error";

      if (isInputError(result.error)) {
        syncFieldErrors({
          name: result.error.fields.name?.[0] ?? "",
          email: result.error.fields.email?.[0] ?? "",
          subject: result.error.fields.subject?.[0] ?? "",
          body: result.error.fields.body?.[0] ?? "",
        });
        errorMessage.value =
          result.error.fields["cf-turnstile-response"]?.[0] ??
          "入力内容を確認してください。";
      } else {
        errorMessage.value =
          result.error.message ||
          "送信に失敗しました。しばらく経ってから再度お試しください。";
      }

      turnstile.reset();
    }
  } catch {
    status.value = "error";
    errorMessage.value = "ネットワークエラーが発生しました。";
    turnstile.reset();
  }
}
</script>

<template>
  <Transition name="bounce">
    <div v-if="status === 'success'" role="alert" class="card text-center">
      <div class="mx-auto mb-3 w-fit text-success">
        <div class="i-ri:checkbox-circle-line h-5 w-5" />
      </div>
      <p class="fg-base text-lg font-bold">お問い合わせを受け付けました。</p>
      <p class="fg-muted mt-1">ありがとうございます。</p>
    </div>
  </Transition>

  <form
    v-if="status !== 'success'"
    novalidate
    class="stack gap-4 mt-4"
    @submit.prevent="handleSubmit"
  >
    <div
      v-if="status === 'error' && errorMessage"
      role="alert"
      class="text-error mb-3"
    >
      {{ errorMessage }}
    </div>

    <FormInput
      id="cf-name"
      v-model="form.name"
      label="お名前"
      :error="fieldErrors.name"
      required
      autocomplete="name"
      :disabled="status === 'submitting'"
    />

    <FormInput
      id="cf-email"
      v-model="form.email"
      label="メールアドレス"
      type="email"
      :error="fieldErrors.email"
      required
      autocomplete="email"
      :disabled="status === 'submitting'"
    />

    <FormInput
      id="cf-subject"
      v-model="form.subject"
      label="件名"
      :error="fieldErrors.subject"
      required
      :disabled="status === 'submitting'"
    />

    <FormInput
      id="cf-body"
      v-model="form.body"
      label="お問い合わせ内容"
      :error="fieldErrors.body"
      required
      :rows="6"
      :disabled="status === 'submitting'"
    />

    <div class="stack">
      <TurnstileStatus ref="turnstileRef" :siteKey="siteKey" />
      <p v-if="!siteKey" class="text-sm text-error">
        PUBLIC_CF_TURNSTILE_SITEKEY が未設定です。このままでは送信できません。
      </p>
      <button
        type="submit"
        :disabled="status === 'submitting' || !isReadyToSubmit"
        class="button accent ml-auto w-fit sm:w-auto px-4 py-2"
      >
        {{ status === "submitting" ? "送信中..." : "送信する" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@media (prefers-reduced-motion: reduce) {
  .bounce-enter-active {
    animation: none;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
