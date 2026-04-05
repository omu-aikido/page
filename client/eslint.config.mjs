import { defineConfig } from "eslint/config";

import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import eslintPluginAstro from "eslint-plugin-astro";

import globals from "globals";

export default defineConfig([
  ...pluginVue.configs["flat/recommended"],
  eslintConfigPrettier,
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      "vue/no-unused-vars": "warn",
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
]);
