import {
  defineConfig,
  presetWind4,
  presetIcons,
  presetAttributify,
  presetTypography,
  presetTagify,
  transformerDirectives,
  transformerVariantGroup,
  presetWebFonts,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "media",
    }),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Inter:400,700",
        mono: "Fira+Code:400,700",
      },
    }),
    presetTagify(),
  ],
  transformers: [
    transformerDirectives(), // @apply, @screen
    transformerVariantGroup(), // hover:(text-red bg-blue) 記法
  ],
  theme: {
    colors: {
      brand: {
        50: "oklch(97.0% 0.03 251.2)",
        100: "oklch(93.0% 0.06 251.2)",
        200: "oklch(89.0% 0.09 251.2)",
        300: "oklch(83.0% 0.12 251.2)",
        400: "oklch(80.0% 0.15 251.2)",
        500: "oklch(75.0% 0.18 251.2)",
        600: "oklch(70.0% 0.21 251.2)",
        700: "oklch(60.0% 0.24 251.2)",
        800: "oklch(50.0% 0.27 251.2)",
        900: "oklch(20.0% 0.5 230.2)",
      },
      success: "oklch(0.571 0.181 145)",
      warning: "oklch(0.67 0.185 55)",
      error: "oklch(0.567 0.224 27)",
    },
    font: {
      sans: '"Inter", sans-serif',
      mono: '"Fira Code", monospace',
    },
  },
  shortcuts: [
    // Typography
    {
      h1: "text-3xl font-bold",
      h2: "text-2xl font-semibold",
      h3: "text-xl font-medium",
      h4: "text-lg font-medium",
    },
    // Layout
    {
      container: "max-w-4xl lg:mx-auto md:mx-8 sm:mx-6 mx-4",
      stack: "flex flex-col",
      row: "flex flex-row",
      grid: "grid",
      section: "mx-4 my-6",
      start: "flex gap-2 items-start justify-center text-start",
      center: "flex gap-2 items-center justify-center text-center",
      end: "flex gap-2 items-end justify-center text-end",
    },
    // Color
    {
      // palette
      /// background colors
      "bg-accent": "bg-brand-600 dark:bg-brand-500",
      "bg-base": "bg-zinc-50 dark:bg-zinc-900",
      "bg-muted": "bg-zinc-300 dark:bg-zinc-700",
      "bg-ghost": "bg-zinc-100/60 dark:bg-zinc-800/60",
      "bg-invert": "bg-zinc-900 dark:bg-zinc-50",
      /// foreground colors
      "fg-accent": "text-brand-600 dark:text-brand-500",
      "fg-base": "text-zinc-900 dark:text-zinc-50",
      "fg-muted": "text-zinc-600 dark:text-zinc-400",
      "fg-ghost": "text-zinc-400 dark:text-zinc-500",
      "fg-invert": "text-zinc-50 dark:text-zinc-900",
      /// borders
      "bordered-accent": "border-brand-600 dark:border-brand-500",
      "bordered-base": "border-zinc-300 dark:border-zinc-700",
      "bordered-muted": "border-zinc-400 dark:border-zinc-600",
      "bordered-ghost": "border-zinc-100/60 dark:border-zinc-800/60",
      "bordered-invert": "border-zinc-600 dark:border-zinc-400",
      // combine
      accent: "bg-accent fg-invert",
      base: "bg-base fg-base",
      muted: "bg-muted fg-muted",
      ghost: "bg-ghost fg-ghost",

      // Status
      "status-error": "text-error font-medium",
      "status-icon-error": "text-error bg-error/10 p-1 rounded-full",
    },
    // Components
    {
      mark: "bg-accent fg-invert px-1 rounded-xs",
      card: "rounded-lg bg-ghost border bordered-muted p-4 shadow-sm",
      link: "text-brand-700 dark:text-brand-400 no-underline hover:underline underline-offset-4",
      button:
        "rounded-sm hover:(cursor-pointer shadow-sm opacity-90) active:(transform translate-y-1px) focus-visible:(ring-1 ring-brand-600 dark:ring-brand-500) disabled:(cursor-not-allowed translate-y-0 opacity-60 hover:shadow-none hover:cursor-not-allowed)",
    },
    // Events
    {
      "event-nakamozu": "text-sky-700 dark:text-sky-300",
      "event-sugimoto": "text-emerald-700 dark:text-emerald-300",
      "event-morinomiya": "text-orange-700 dark:text-orange-300",
      "event-event": "text-rose-700 dark:text-rose-300",
      "event-default": "text-zinc-700 dark:text-zinc-300",
    },
  ],
});
