import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    ignorePatterns: [
      ".nuxt/**",
      ".output/**",
      "dist/**",
      "worker-configuration.d.ts",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: false, typeCheck: false },
  },
  fmt: {
    printWidth: 80,
    sortPackageJson: false,
    ignorePatterns: [
      ".nuxt/**",
      ".output/**",
      "dist/**",
      "worker-configuration.d.ts",
    ],
  },
  test: {
    exclude: [".worktrees", "node_modules"],
  },
});
