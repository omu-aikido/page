import { onMounted, onUnmounted, ref } from "vue";

export function useScrollReveal(selector = "[data-reveal]") {
  const observer = ref<IntersectionObserver | null>(null);

  onMounted(() => {
    observer.value = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.value?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    for (const el of document.querySelectorAll(selector)) {
      observer.value.observe(el);
    }
  });

  onUnmounted(() => {
    observer.value?.disconnect();
  });
}
