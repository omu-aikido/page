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
      preflights: {
        theme: {
          mode: "on-demand",
        },
      },
    }),
    presetAttributify({
      prefix: "un-",
      prefixedOnly: true,
    }),
    presetIcons(),
    presetTypography({
      cssExtend: {
        h2: {
          "--at-apply": "text-2xl pt-4 pb-2 font-bold",
        },
        h3: {
          "--at-apply": "text-lg pt-3 pb-1 font-semibold",
        },
        h4: {
          "--at-apply": "text-base pt-2 pb-1",
        },
        a: {},
      },
    }),
  ],
  theme: {
    colors: {
      brand: {
        primary: "#0891b2", // cyan-600
        primaryHover: "#0e7490", // cyan-700
        primaryLight: "#22d3ee", // cyan-400
        primaryLightBg: "#ecfeff", // cyan-100
      },
      surface: {
        primary: "#ffffff",
        secondary: "#f5f5f5", // neutral-100
        tertiary: "#e5e5e5", // neutral-200
        inverse: "#171717", // neutral-800
      },
      text: {
        primary: "#171717", // neutral-900
        secondary: "#525252", // neutral-600
        muted: "#a3a3a3", // neutral-400
        inverse: "#fafafa", // neutral-100
        inverseSecondary: "#d4d4d4", // neutral-300
      },
      border: {
        primary: "#e5e5e5", // neutral-300
        secondary: "#d4d4d4", // neutral-400
        inverse: "#404040", // neutral-600
      },
      status: {
        success: "#15803d", // green-700
        successBg: "#dcfce7", // green-100
        error: "#dc2626", // red-600
        errorBg: "#fee2e2", // red-100
        warning: "#d97706", // amber-600
        warningBg: "#fef3c7", // amber-100
      },
      event: {
        nakamo: "#0891b2", // cyan-600
        nakamoBg: "#ecfeff", // cyan-100
        sugimoto: "#15803d", // green-700
        sugimotoBg: "#dcfce7", // green-100
        kai: "#c2410c", // orange-700
        kaiBg: "#ffedd5", // orange-100
      },
    },
  },
  shortcuts: {
    // ============ Layout ============
    "container-main": "mx-auto min-h-[75dvh] sm:max-w-3xl lg:max-w-6xl max-w-2xl px-4 md:px-12",
    "container-content": "max-w-content mx-auto",
    "container-article": "mx-auto items-start max-w-5xl min-w-64",
    "container-page": "mx-auto px-6 py-8",
    "page-bg": "bg-surface-secondary dark:bg-surface-inverse",
    "page-bg-light": "bg-neutral-50 dark:bg-neutral-900/50",
    "page-bg-inverse":
      "bg-linear-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800",

    // ============ Hero Section ============
    "hero-section": "my-8 px-6 py-16",
    "hero-title": "mb-6 text-4xl font-bold text-text-primary md:text-6xl dark:text-text-inverse",
    "hero-subtitle":
      "mx-auto mb-8 max-w-3xl text-lg text-text-secondary md:text-xl dark:text-text-inverseSecondary",
    "hero-bg": "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
    "hero-bg-gradient":
      "absolute inset-0 rounded-lg bg-linear-to-b from-brand-primaryLight/60 to-transparent dark:from-brand-primary/30",

    // ============ Card ============
    "card-base":
      "rounded-lg border border-border-primary bg-surface-primary dark:border-border-inverse dark:bg-neutral-700",
    "card-hover": "card-base transition-shadow duration-200 hover:shadow-md",
    "card-event": "card-base p-6",
    "card-nav": "card-base p-6 text-center shadow-md hover:shadow-lg",
    "card-feature": "rounded-lg bg-white/20 p-8 shadow-md dark:bg-neutral-700/20",
    "card-cta":
      "rounded-lg bg-linear-to-r from-brand-primaryLight/50 to-brand-primaryLightBg p-8 text-center",
    "card-cta-dark":
      "rounded-lg bg-linear-to-b from-surface-secondary to-surface-secondary px-6 py-16 text-center dark:from-surface-inverse dark:to-surface-inverse",
    "card-cta-subtle":
      "rounded-lg bg-linear-to-r from-brand-primaryLightBg to-brand-primaryLight p-8 text-center dark:from-brand-primary/20 dark:to-brand-primary/20",
    "card-glass":
      "bg-surface-secondary/80 p-5 backdrop-blur-lg sm:ring-1 dark:bg-surface-inverse/80 dark:sm:ring-white/10",

    // ============ Button ============
    "btn-primary":
      "w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-brand-primaryHover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-neutral-900",
    "btn-primary-inline":
      "inline-block rounded-lg bg-brand-primary px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-brand-primaryHover",
    "btn-secondary":
      "inline-block rounded-lg border-2 border-brand-primary px-6 py-2 font-semibold text-brand-primary transition-colors duration-200 hover:bg-brand-primary hover:text-white dark:border-brand-primaryLight dark:text-brand-primaryLight dark:hover:bg-brand-primaryLight dark:hover:text-neutral-900",

    // ============ Form Input ============
    "input-base":
      "w-full rounded-lg border bg-surface-primary px-3 py-2 text-text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed dark:border-border-inverse dark:bg-neutral-800 dark:text-text-inverse",
    "input-error": "border-status-error",
    "input-valid": "border-border-primary",
    "label-base": "mt-4 mb-1 block text-sm font-medium text-text-primary dark:text-text-inverse",
    "error-text": "mt-1 text-sm text-status-error dark:text-red-400",
    "required-mark": "text-status-error",

    // ============ Alert ============
    "alert-success":
      "my-3 rounded-lg border border-status-successBg bg-status-successBg p-4 text-status-success dark:border-green-800 dark:bg-green-900/20 dark:text-green-200",
    "alert-error":
      "my-3 rounded-lg border border-status-errorBg bg-status-errorBg p-4 text-sm text-status-error dark:border-red-800 dark:bg-red-900/20 dark:text-red-200",
    "alert-amber": "text-status-warning dark:text-amber-200",
    "alert-icon": "h-5 w-5 text-status-error",

    // ============ View Toggle ============
    "view-toggle-container":
      "flex items-center justify-end gap-2 rounded-lg bg-surface-secondary p-1 dark:bg-neutral-800",
    "view-toggle-btn-inactive":
      "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 text-text-secondary hover:bg-white/50 dark:text-text-muted dark:hover:bg-neutral-700/50",
    "view-toggle-btn-active":
      "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 bg-surface-primary text-text-primary shadow-sm ring-1 ring-border-primary dark:bg-neutral-700 dark:text-text-inverse dark:ring-border-inverse",

    // ============ Loading ============
    spinner:
      "inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-text-primary dark:border-text-inverse",
    "loading-overlay":
      "pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-500/10",
    "loading-spin": "animate-spin",
    "loading-icon": "text-text-secondary/30 dark:text-text-inverseSecondary/30",

    // ============ Text ============
    "text-muted": "text-text-muted dark:text-text-muted",
    "text-body": "text-text-secondary dark:text-text-inverseSecondary",
    "text-heading": "text-text-primary dark:text-text-inverse",
    "text-title": "text-xl font-bold text-text-primary dark:text-text-inverse",
    "text-page-title":
      "text-3xl font-semibold px-5 text-text-secondary dark:text-text-inverseSecondary",
    "text-section-title":
      "mb-8 text-center text-3xl font-bold text-text-primary dark:text-text-inverse",
    "text-inverse": "text-neutral-800 dark:text-neutral-200",
    "text-lg": "text-lg text-text-secondary dark:text-text-inverseSecondary",
    "text-lg-inverse": "text-text-secondary dark:text-text-inverseSecondary",

    // ============ Event Colors - Title ============
    "event-title-base": "mb-2 text-lg font-semibold",
    "event-title-default": "event-title-base text-text-primary dark:text-text-inverse",
    "event-title-nakamo": "event-title-base text-event-nakamo dark:text-cyan-300",
    "event-title-sugimoto": "event-title-base text-event-sugimoto dark:text-green-300",
    "event-title-kai": "event-title-base text-event-kai dark:text-orange-300",

    // ============ Event Colors - Badge ============
    "event-badge-default":
      "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600",
    "event-badge-nakamo":
      "bg-event-nakamoBg text-event-nakamo border-event-nakamo dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700",
    "event-badge-sugimoto":
      "bg-event-sugimotoBg text-event-sugimoto border-event-sugimoto dark:bg-green-900 dark:text-green-200 dark:border-green-700",
    "event-badge-kai":
      "bg-event-kaiBg text-event-kai border-event-kai dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",

    // ============ Calendar ============
    "calendar-header": "px-6 py-4 dark:border-border-inverse dark:bg-surface-inverse",
    "weekday-sunday": "text-red-600 dark:text-red-400",
    "weekday-saturday": "text-blue-600 dark:text-blue-400",
    "weekday-weekday": "text-text-secondary dark:text-text-inverseSecondary",
    "calendar-today": "border-2 border-brand-primary",
    "calendar-day-default": "border-border-primary dark:border-border-inverse",
    "calendar-cell-today": "border-2 border-brand-primary",
    "calendar-cell-empty": "bg-neutral-50 dark:bg-neutral-900/50",
    "calendar-cell-filled": "bg-surface-primary dark:bg-surface-inverse",
    "calendar-cell":
      "relative min-h-[14cqw] rounded-sm border p-[min(0.5rem,1.5cqw)] transition-shadow dark:bg-surface-inverse",

    // ============ Link ============
    "link-brand": "text-brand-primary hover:underline dark:text-brand-primaryLight",
    "link-nav":
      "text-base/7 font-semibold text-text-primary hover:bg-neutral-500/20 dark:text-text-inverse",
    "link-card":
      "font-semibold text-brand-primary hover:text-brand-primaryHover dark:text-brand-primaryLight dark:hover:text-cyan-300",
    "link-section":
      "font-semibold text-cyan-800 hover:text-brand-primaryHover dark:text-brand-primaryLight dark:hover:text-cyan-300",
    "link-social": "text-neutral-800 hover:text-brand-primary dark:text-neutral-200",
    "link-retry":
      "text-sm font-medium text-status-error hover:text-status-error dark:text-red-400 dark:hover:text-red-300",

    // ============ Nav ============
    "nav-link":
      "rounded-md px-3 py-2 font-semibold text-text-primary hover:bg-neutral-500/20 dark:text-text-inverse",
    "nav-link-cta":
      "rounded-md p-3 font-semibold text-text-primary hover:bg-neutral-500/20 dark:text-text-inverse",
    "mobile-menu-btn":
      "-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-text-secondary hover:cursor-pointer dark:text-text-muted",

    // ============ Frame (iframe) ============
    "iframe-base": "h-100 w-full rounded-lg border-0 dark:contrast-90 dark:invert",
    "iframe-wrapper": "relative",

    // ============ Markdown ============
    "prose-base":
      "px-6 sm:px-8 mx-auto pb-6 bg-surface-secondary dark:bg-neutral-900/80 rounded-lg md:min-w-0 mt-4 max-w-3xl md:max-w-2xl lg:max-w-none mx-auto w-full text-text-secondary dark:text-text-inverseSecondary",

    // ============ Status Icons ============
    "status-success": "text-status-success dark:text-green-200",
    "status-error": "text-status-error dark:text-red-200",
    "status-pending": "text-status-warning dark:text-amber-200",

    // ============ 404 Page ============
    "error-icon":
      "mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-brand-primaryLightBg dark:bg-brand-primary/30",
    "error-code":
      "mt-8 mb-4 text-6xl font-bold text-text-primary md:text-8xl dark:text-text-inverse",
    "error-title": "mb-4 text-2xl font-semibold text-neutral-800 md:text-3xl dark:text-neutral-200",
    "error-icon-small": "text-brand-primary dark:text-brand-primaryLight",

    // ============ Footer ============
    "footer-bg": "my-12 bg-surface-secondary sm:mx-18 lg:mx-24 dark:bg-surface-inverse",
    "footer-text": "text-neutral-800 dark:text-neutral-200",

    // ============ Misc ============
    "section-spacing": "my-16 px-6",
    "feature-icon": "text-brand-primary dark:text-brand-primaryLight",
    "nav-card-icon": "text-brand-primary dark:text-brand-primaryLight",
  },
  transformers: [
    transformerDirectives(), // @apply, @screen
    transformerVariantGroup(), // hover:(text-red bg-blue) 記法
  ],
});
