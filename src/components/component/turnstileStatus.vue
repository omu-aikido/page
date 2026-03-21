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
    <!-- Turnstile widget container (hidden) -->
    <div
      :ref="(el) => (widgetRef = el as HTMLElement)"
      class="absolute opacity-0 pointer-events-none"
    />

    <div class="flex-inline gap-2 my-4">
      <div
        v-if="status === 'idle' || status === 'checking'"
        class="text-amber-700 dark:text-amber-200"
      >
        <div class="i-heroicons:arrow-path h-5 w-5 animate-spin" />
      </div>
      <div v-else-if="status === 'verified'" class="text-green-700 dark:text-green-200">
        <div class="i-heroicons:check-circle-16-solid h-5 w-5" />
      </div>
      <div
        v-else-if="status === 'expired' || status === 'error'"
        class="text-red-700 dark:text-red-200"
      >
        <div class="i-heroicons:exclamation-triangle h-5 w-5" />
      </div>

      <!-- Status UI -->
      <div
        v-if="status === 'idle' || status === 'checking'"
        class="text-sm text-amber-700 dark:text-amber-200"
      >
        <span>{{
          status === "idle" ? "セキュリティ確認を読み込み中..." : "人間かどうか確認中..."
        }}</span>
      </div>

      <div v-else-if="status === 'verified'" class="text-sm text-green-700 dark:text-green-200">
        <span>確認完了</span>
      </div>

      <div v-else-if="status === 'expired' || status === 'error'" class="mb-4 rounded-lg px-4 py-3">
        <div class="flex items-center gap-2 text-sm text-red-700 dark:text-red-200">
          <span>{{
            status === "expired" ? "確認の期限が切れました。" : "確認中にエラーが発生しました。"
          }}</span>
        </div>
        <button
          type="button"
          @click="executeChallenge()"
          class="mt-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          再試行 →
        </button>
      </div>
    </div>
  </div>
</template>
