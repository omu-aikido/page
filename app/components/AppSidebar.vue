<script setup lang="ts">
const route = useRoute();
const dialog = ref<HTMLDialogElement>();

const isActive = (path: string) => route.path === path;
const close = () => dialog.value?.close();
const open = () => dialog.value?.showModal();

watch(() => route.fullPath, close);
</script>

<template>
  <button
    type="button"
    class="i-ri:menu-line text-2xl transition hover:(cursor-pointer fg-accent)"
    aria-label="メニューを開く"
    @click="open"
  />
  <dialog
    ref="dialog"
    class="sidebar m-0 ml-auto h-100dvh w-80 max-w-full border-0 bg-base p-0 fg-base"
    @click.self="close"
  >
    <div class="m-4 flex min-h-[calc(100dvh-2rem)] flex-col">
      <button
        type="button"
        class="i-ri:close-line mb-2 ml-auto text-3xl transition hover:(cursor-pointer fg-accent)"
        aria-label="メニューを閉じる"
        @click="close"
      />
      <nav class="mx-2 flex flex-1 flex-col gap-2" aria-label="サイトメニュー">
        <template v-for="parent in navlinks" :key="parent.path">
          <NuxtLink
            :to="parent.path"
            class="rounded-sm px-2 py-1"
            :class="isActive(parent.path) ? 'accent' : 'hover:muted'"
          >
            {{ parent.title }}
          </NuxtLink>
          <template v-for="child in parent.children" :key="child.path">
            <NuxtLink
              :to="child.path"
              class="rounded-sm px-2 py-1"
              :class="isActive(child.path) ? 'accent' : 'hover:muted'"
            >
              {{ child.title }}
            </NuxtLink>
            <NuxtLink
              v-for="grandchild in child.children"
              :key="grandchild.path"
              :to="grandchild.path"
              class="rounded-sm py-1 pl-6 pr-2"
              :class="isActive(grandchild.path) ? 'accent' : 'hover:muted'"
            >
              {{ grandchild.title }}
            </NuxtLink>
          </template>
        </template>
      </nav>
    </div>
  </dialog>
</template>

<style scoped>
.sidebar::backdrop {
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(2px);
}

.sidebar[open] {
  animation: slide-in 0.2s ease-out;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar[open] {
    animation: none;
  }
}
</style>
