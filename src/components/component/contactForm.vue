<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import FormInput from "./formInput.vue";
import TurnstileStatus from "./turnstileStatus.vue";
import { client } from "lib/client";

const form = reactive({
  name: "",
  email: "",
  subject: "",
  body: "",
});

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const status = ref<SubmitStatus>("idle");
const errorMessage = ref("");

const fieldErrors = reactive({
  name: "",
  email: "",
  subject: "",
  body: "",
});

const siteKey = import.meta.env.PUBLIC_CF_TURNSTILE_SITEKEY;

const turnstileRef = ref<InstanceType<typeof TurnstileStatus> | null>(null);

const isReadyToSubmit = computed(() => {
  const hasContent =
    form.name.trim() && form.email.trim() && form.subject.trim() && form.body.trim();
  const isVerified = turnstileRef.value?.status === "verified";
  return hasContent && isVerified;
});

function validateForm(): boolean {
  let isValid = true;

  if (!form.name.trim()) {
    fieldErrors.name = "お名前は必須です";
    isValid = false;
  } else {
    fieldErrors.name = "";
  }

  if (!form.email.trim()) {
    fieldErrors.email = "メールアドレスは必須です";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    fieldErrors.email = "有効なメールアドレスを入力してください";
    isValid = false;
  } else {
    fieldErrors.email = "";
  }

  if (!form.subject.trim()) {
    fieldErrors.subject = "件名は必須です";
    isValid = false;
  } else {
    fieldErrors.subject = "";
  }

  if (!form.body.trim()) {
    fieldErrors.body = "お問い合わせ内容は必須です";
    isValid = false;
  } else {
    fieldErrors.body = "";
  }

  return isValid;
}

async function handleSubmit() {
  const turnstile = turnstileRef.value;
  if (!turnstile || turnstile.status !== "verified") {
    errorMessage.value =
      turnstile?.status === "error"
        ? "確認中にエラーが発生しました。再試行してください。"
        : turnstile?.status === "expired"
          ? "期限切れしました。再度チャレンジを完了してください。"
          : "チャレンジを完了してから送信してください。";
    status.value = "error";
    return;
  }

  if (!validateForm()) {
    status.value = "error";
    return;
  }

  status.value = "submitting";
  errorMessage.value = "";

  try {
    const res = await client.contact.$post({
      json: {
        name: form.name,
        email: form.email,
        subject: form.subject,
        body: form.body,
        "cf-turnstile-response": turnstile.token,
      },
    });

    if (res.ok) {
      status.value = "success";
      Object.assign(form, { name: "", email: "", subject: "", body: "" });
    } else {
      status.value = "error";
      errorMessage.value =
        res.status === 403
          ? "チャレンジの検証に失敗しました。再度お試しください。"
          : "送信に失敗しました。しばらく経ってから再度お試しください。";
    }
  } catch {
    status.value = "error";
    errorMessage.value = "ネットワークエラーが発生しました。";
  }
}
</script>

<template>
  <!-- 送信成功 -->
  <div
    v-if="status === 'success'"
    role="alert"
    class="my-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
  >
    お問い合わせを受け付けました。ありがとうございます。
  </div>

  <form v-else novalidate @submit.prevent="handleSubmit">
    <!-- エラー通知 -->
    <div
      v-if="status === 'error' && errorMessage"
      role="alert"
      class="my-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
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

    <TurnstileStatus ref="turnstileRef" :siteKey="siteKey" />

    <button
      type="submit"
      :disabled="status === 'submitting' || !isReadyToSubmit"
      class="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-neutral-900"
    >
      {{ status === "submitting" ? "送信中..." : "送信する" }}
    </button>
  </form>
</template>
