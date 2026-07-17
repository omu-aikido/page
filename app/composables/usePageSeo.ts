export function usePageSeo(title: string, description = "") {
  const route = useRoute();
  const canonical = computed(
    () => `https://omu-aikido.com${route.path === "/" ? "" : route.path}`,
  );

  useSeoMeta({
    title: `${title} | 大阪公立大学合氣道部`,
    description,
  });
  useHead({ link: [{ rel: "canonical", href: canonical }] });
}
