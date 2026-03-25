<script setup lang="ts">
import { Dialog, DialogPanel } from "@headlessui/vue";
import { ref, onMounted, onUnmounted } from "vue";

const open = ref(false);
const onOpen = () => (open.value = true);
const onClose = () => (open.value = false);
const onToggle = () => (open.value = !open.value);

onMounted(() => {
  if (typeof window === "undefined") return;
  window.addEventListener("sidebar:open", onOpen);
  window.addEventListener("sidebar:close", onClose);
  window.addEventListener("sidebar:toggle", onToggle);
});

onUnmounted(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("sidebar:open", onOpen);
  window.removeEventListener("sidebar:close", onClose);
  window.removeEventListener("sidebar:toggle", onToggle);
});
</script>

<template>
  <Dialog :open="open" @close="open = false" class="lg:hidden">
    <aside>
      <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto card-glass">
        <div class="flex items-center justify-between">
          <a href="/" class="-m-1.5 p-1.5">
            <span class="sr-only">大阪公立大学合氣道部</span>
            <img alt="" src="/favicon.svg" class="h-10 w-auto rounded-full" />
          </a>
          <button
            type="button"
            @click="open = false"
            class="-m-2.5 rounded-md p-2.5 text-text-secondary dark:text-text-muted"
          >
            <span class="sr-only">メニューを閉じる</span>
            <div class="i-heroicons:x-mark-16-solid h-6 w-6" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-neutral-500/10 dark:divide-neutral-100/10">
            <nav class="space-y-2 py-6">
              <a href="/" class="link-nav -mx-3 block rounded-lg px-3">ホーム</a>
              <a href="/about" class="link-nav -mx-3 block rounded-lg px-3">合氣道部について</a>
              <a href="/calendar" class="link-nav -mx-3 block rounded-lg px-3">稽古予定</a>
              <a href="/access" class="link-nav -mx-3 block rounded-lg px-3">アクセス</a>
              <div class="py-6">
                <a href="/support" class="link-nav-cta -mx-3 block rounded-lg px-3"
                  >応援する<span aria-hidden="true">&rarr;</span></a
                >
              </div>
            </nav>
          </div>
        </div>
      </DialogPanel>
    </aside>
  </Dialog>
</template>
