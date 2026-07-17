<script setup lang="ts">
const mainNav = navlinks[0]?.children ?? [];
const links = mainNav.flatMap((parent) => [parent, ...(parent.children ?? [])]);
</script>

<template>
  <nav class="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
    <NuxtLink
      v-for="linkItem in links"
      :key="linkItem.path"
      :to="linkItem.path"
      class="guide-link w-fit font-semibold"
    >
      {{ linkItem.title }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
.guide-link {
  position: relative;
  text-decoration: none;
}
.guide-link::after {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 1px;
  content: "";
  background: #0284c7;
  transition: width 150ms;
}
.guide-link:hover::after {
  width: 100%;
}
</style>
