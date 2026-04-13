<script setup lang="ts">
import { useTurnstile } from "@/composables/useTurnstile";

interface Props {
  siteKey: string;
}

const props = defineProps<Props>();
const { token, status, executeChallenge, widgetRef } = useTurnstile(
  props.siteKey,
);

defineExpose({ token, status, executeChallenge, widgetRef });
</script>

<template>
  <div class="relative">
    <div
      :ref="(el) => (widgetRef = el as HTMLElement)"
      class="absolute opacity-0 pointer-events-none"
    />
    <div class="inline-flex items-center gap-2 my-4">
      <div v-if="status === 'idle' || status === 'checking'" class="fg-accent">
        <div class="i-ri:loader-4-line h-5 w-5 animate-spin" />
      </div>
      <div v-else-if="status === 'verified'" class="text-success">
        <div class="i-ri:checkbox-circle-fill h-5 w-5" />
      </div>
      <div
        v-else-if="status === 'expired' || status === 'error'"
        class="text-error"
      >
        <div class="i-ri:error-warning-fill h-5 w-5" />
      </div>

      <div
        v-if="status === 'idle' || status === 'checking'"
        class="text-sm fg-ghost"
      >
        <span>{{
          status === "idle"
            ? "セキュリティ確認を読み込み中..."
            : "人間かどうか確認中..."
        }}</span>
      </div>
      <div
        v-else-if="status === 'verified'"
        class="text-sm text-success font-bold"
      >
        <span>確認完了</span>
      </div>
      <div v-else-if="status === 'expired' || status === 'error'" class="">
        <span class="text-sm text-error font-medium">{{
          status === "expired"
            ? "確認の期限が切れました。"
            : "確認中にエラーが発生しました。"
        }}</span>
        <button
          type="button"
          class="link ml-2 font-bold"
          @click="executeChallenge()"
        >
          再試行 →
        </button>
      </div>
    </div>
  </div>
</template>
