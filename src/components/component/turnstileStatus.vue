<script setup lang="ts">
import { useTurnstile } from "@/composables/useTurnstile";

interface Props {
  siteKey: string;
}

const props = defineProps<Props>();
const { token, status, executeChallenge, widgetRef } = useTurnstile(props.siteKey);

defineExpose({ token, status, executeChallenge, widgetRef });
</script>

<template>
  <div class="relative">
    <div
      :ref="(el) => (widgetRef = el as HTMLElement)"
      class="absolute opacity-0 pointer-events-none"
    />
    <div class="inline-flex items-center gap-2 my-4">
      <div v-if="status === 'idle' || status === 'checking'" class="status-pending">
        <div class="i-heroicons:arrow-path h-5 w-5 animate-spin" />
      </div>
      <div v-else-if="status === 'verified'" class="status-icon-success">
        <div class="i-heroicons:check-circle-16-solid h-5 w-5" />
      </div>
      <div v-else-if="status === 'expired' || status === 'error'" class="status-icon-error">
        <div class="i-heroicons:exclamation-triangle h-5 w-5" />
      </div>

      <div v-if="status === 'idle' || status === 'checking'" class="text-sm status-pending">
        <span>{{
          status === "idle" ? "セキュリティ確認を読み込み中..." : "人間かどうか確認中..."
        }}</span>
      </div>
      <div v-else-if="status === 'verified'" class="text-sm status-success">
        <span>確認完了</span>
      </div>
      <div v-else-if="status === 'expired' || status === 'error'" class="">
        <span class="text-sm status-error">{{
          status === "expired" ? "確認の期限が切れました。" : "確認中にエラーが発生しました。"
        }}</span>
        <button type="button" @click="executeChallenge()" class="link-retry">再試行 →</button>
      </div>
    </div>
  </div>
</template>
