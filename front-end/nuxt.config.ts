// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  app: {
    head: {
      htmlAttrs: { lang: "id" },
      title: "Food Truck Jajanan Bango POS",
    },
  },
  imports: {
    autoImport: false,
  },

  modules: [
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/test-utils",
  ],

  runtimeConfig: {
    public: {
      apiBase: "",
      enableMsw: "true",
    },
  },

  nitro: {
    preset: "bun",
  },

  vite: {
    optimizeDeps: {
      include: ["msw/browser", "msw"],
    },
  },
});
