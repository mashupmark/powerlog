export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@vite-pwa/nuxt", "@sit-onyx/nuxt"],
  css: ["@fontsource-variable/source-sans-3", "@fontsource-variable/source-code-pro"],
  runtimeConfig: {
    couchDbURL: "",
    couchDbUser: "",
    couchDbPassword: "",
  },
  vite: {
    optimizeDeps: {
      include: ["pouchdb"],
    },
  },

  pwa: {
    manifest: {
      name: "Powerlog",
      short_name: "Powerlog",
      description: "Easily track your working hours",
    },
    registerType: "autoUpdate",
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,json,svg,webp}"],
      globIgnores: ["/db/**"],
    },
  },

  nitro: {
    prerender: {
      // It's neccessary to prerender the index route so it can be cached for offline access
      routes: ["/"],
    },
  },
});
