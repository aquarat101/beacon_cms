import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      apiDomain: process.env.API_DOMAIN || '',
      liffId: process.env.LIFFID || ''
    },
  },

  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: "Piyo Piyo - Beacon app"
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],

    server: {
      allowedHosts: [
        '92593f6478fd.ngrok-free.app' // 👈 เพิ่ม host ที่จะใช้ (จาก ngrok หรืออื่น ๆ)
      ]
    }
  },

  modules: ["@nuxt/icon"],

  plugins: [
    '~/plugins/GoogleMaps.js',
  ]
});