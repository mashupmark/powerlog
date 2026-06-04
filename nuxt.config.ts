export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@vite-pwa/nuxt", "@sit-onyx/nuxt", "@nuxtjs/i18n", "@pinia/nuxt", "@pinia/colada-nuxt"],
  css: ["@fontsource-variable/source-sans-3", "@fontsource-variable/source-code-pro"],
  runtimeConfig: {
    couchDbURL: "",
    couchDbUser: "",
    couchDbPassword: "",
  },

  i18n: {
    strategy: "no_prefix",
    defaultLocale: "en-US",
    locales: [
      { code: "en-US", name: "English", file: "en-US.json" },
      { code: "de-DE", name: "Deutsch", file: "de-DE.json" },
    ],
  },

  app: {
    head: {
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "icon", href: "/powerlog.svg", sizes: "any", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
      ],
    },
  },

  pwa: {
    devOptions: {
      enabled: false,
    },
    manifest: {
      name: "Powerlog",
      short_name: "Powerlog",
      description: "Easily track your working hours",
      theme_color: "#00c3cd",
      icons: [
        {
          src: "pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    registerType: "prompt",
    client: {
      // Check for updates every 5min
      periodicSyncForUpdates: 300,
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,json,svg,webp,woff2}"],
      globIgnores: ["/db/**"],
    },
  },

  nitro: {
    prerender: {
      // It's neccessary to prerender the index route so it can be cached for offline access
      routes: ["/"],
    },
    routeRules: {
      // Cache the ics endpoint for 1 minute to reduce backend load
      "/api/ics": { cache: { swr: false, maxAge: 60 } },
    },
  },
});
