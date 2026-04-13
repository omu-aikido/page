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
        50: "#eef6ff",
        100: "#dbeaff",
        500: "#99b9ff",
        600: "#1d4ed8",
        700: "#1e40af",
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
  shortcuts: [],
});
