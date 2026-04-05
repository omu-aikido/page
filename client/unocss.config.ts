import {
  defineConfig,
  presetWind4,
  presetIcons,
  presetAttributify,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "media",
    }),
    presetAttributify(),
    presetIcons(),
    presetTypography({
      cssExtend: {
        p: {
          margin: 0,
        },
      },
    }),
  ],
  transformers: [
    transformerDirectives(), // @apply, @screen
    transformerVariantGroup(), // hover:(text-red bg-blue) 記法
  ],
  theme: {
    colors: {
      brand: {
        50: "#eef6ff",
        100: "#dbeaff",
        500: "#2563eb",
        600: "#1d4ed8",
        700: "#1e40af",
      },
    },
    fontFamily: {
      sans: ["IBM Plex Sans", "Noto Sans JP", "system-ui", "sans-serif"],
      mono: ['"IBM Plex Mono"', "monospace"],
    },
  },
  shortcuts: [
    {
      "text-heading": "font-sans font-bold text-zinc-900 dark:text-zinc-100",
      "text-body": "font-sans text-zinc-700 dark:text-zinc-300",
      "text-muted": "font-sans text-zinc-500 dark:text-zinc-400",
      "container-page": "mx-auto w-full max-w-5xl px-4 pb-6 md:px-6",
      "page-aikido-bg":
        "bg-[radial-gradient(circle_at_15%_0%,rgba(29,78,216,0.12),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(6,95,70,0.14),transparent_38%)]",
      "card-base":
        "rounded-xl border border-zinc-200/70 bg-white/90 p-4 shadow-sm dark:(border-zinc-700/70 bg-zinc-900/70)",
      "card-kasumi":
        "rounded-xl border border-zinc-300/70 bg-gradient-to-br from-white via-zinc-50 to-brand-50/70 p-5 shadow-[0_1px_0_rgba(255,255,255,0.8),0_16px_40px_-24px_rgba(30,64,175,0.55)] dark:(border-zinc-700/80 from-zinc-900 via-zinc-900 to-zinc-800)",
      "section-soft":
        "rounded-lg border-y border-zinc-200/80 py-5 dark:border-zinc-700/70",
      "row-soft": "border-b border-zinc-200/70 py-3 dark:border-zinc-700/70",
      "heading-kicker":
        "mb-2 inline-flex rounded-full border border-brand-500/40 bg-brand-500/10 px-2.5 py-0.5 text-xs tracking-[0.2em] text-brand-700 dark:(text-brand-100 border-brand-500/40 bg-brand-500/15)",
      "btn-base":
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition duration-200 ease-out active:translate-y-0.5 disabled:(cursor-not-allowed opacity-60)",
      "btn-primary":
        "btn-base bg-brand-600 text-white hover:(bg-brand-700 -translate-y-0.5 shadow-[0_12px_22px_-16px_rgba(30,64,175,0.75)]) active:(translate-y-0 shadow-none) focus-visible:(outline-none ring-2 ring-brand-500/50)",
      "btn-secondary":
        "btn-base border border-zinc-300 bg-white text-zinc-800 hover:(bg-zinc-100 -translate-y-0.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.35)]) active:(translate-y-0 shadow-none) dark:(border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700)",
      "btn-toggle":
        "btn-base border border-zinc-300 bg-white/80 text-zinc-700 dark:(border-zinc-700 bg-zinc-900 text-zinc-200)",
      "btn-toggle-active":
        "bg-brand-600 text-white border-brand-600 shadow-[0_6px_16px_-10px_rgba(37,99,235,0.8)] dark:(bg-brand-600 text-white border-brand-600)",
      "form-field": "mb-4 flex flex-col gap-1.5",
      "form-label": "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
      "form-input":
        "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm transition focus:(outline-none ring-2 ring-brand-500/40 border-brand-500) disabled:(cursor-not-allowed bg-zinc-100 text-zinc-500) dark:(border-zinc-700 bg-zinc-900 text-zinc-100 disabled:(bg-zinc-800 text-zinc-500))",
      "form-error": "text-sm text-red-600 dark:text-red-400",
      "status-pending": "text-amber-600 dark:text-amber-400",
      "status-success": "text-emerald-600 dark:text-emerald-400",
      "status-error": "text-red-600 dark:text-red-400",
      link: "text-brand-600 visited:text-emerald-600 hover:underline dark:(text-brand-500 visited:text-emerald-500)",
      "link-brand":
        "font-semibold text-brand-600 hover:underline dark:text-brand-500",
      "link-retry":
        "ml-2 inline-flex text-sm font-semibold text-brand-600 hover:underline dark:text-brand-500",
      "event-title-default": "text-zinc-900 dark:text-zinc-100",
      "event-title-nakamo": "text-sky-700 dark:text-sky-300",
      "event-title-sugimoto": "text-violet-700 dark:text-violet-300",
      "event-title-kai": "text-emerald-700 dark:text-emerald-300",
      "event-badge-default":
        "bg-zinc-100 text-zinc-700 dark:(bg-zinc-800 text-zinc-200)",
      "event-badge-nakamo":
        "bg-sky-100 text-sky-800 dark:(bg-sky-900/40 text-sky-200)",
      "event-badge-sugimoto":
        "bg-violet-100 text-violet-800 dark:(bg-violet-900/40 text-violet-200)",
      "event-badge-kai":
        "bg-emerald-100 text-emerald-800 dark:(bg-emerald-900/40 text-emerald-200)",
      "weekday-sunday": "text-red-600 dark:text-red-400",
      "weekday-saturday": "text-blue-600 dark:text-blue-400",
      "weekday-weekday": "text-zinc-600 dark:text-zinc-300",
      /* Typography Presets */
      "prose-base":
        "font-sans text-base leading-relaxed text-zinc-700 dark:text-zinc-300",
      "prose-h1":
        "font-sans text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-100",
      "prose-h2":
        "font-sans text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-100",
      "prose-h3":
        "font-sans text-lg font-bold text-zinc-900 dark:text-zinc-100",
      "prose-strong": "font-bold text-zinc-900 dark:text-zinc-100",
      "prose-a":
        "text-brand-600 underline decoration-1.5 underline-offset-3 transition hover:(text-brand-700 dark:text-brand-400)",
      "prose-blockquote":
        "border-l-3 border-brand-600 pl-4 italic font-medium text-zinc-700 dark:text-zinc-300",
      "prose-code":
        "font-mono text-sm bg-brand-600/10 px-1 py-0.5 rounded text-brand-700 dark:(bg-brand-600/20 text-brand-300)",
      "prose-pre":
        "bg-zinc-900 text-zinc-100 p-6 rounded-lg overflow-auto text-sm leading-relaxed",
      "prose-list": "space-y-2 ml-4",
      "prose-li": "font-normal text-zinc-700 dark:text-zinc-300",
    },
  ],
});
