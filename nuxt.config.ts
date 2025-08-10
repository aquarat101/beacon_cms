import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      apiDomain: process.env.API_DOMAIN || '',
      liffId: process.env.LIFF_ID || ''
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

    // server: {
    //   allowedHosts: [
    //     'c1a2c7e6b44b.ngrok-free.app' // 👈 เพิ่ม host ที่จะใช้ (จาก ngrok หรืออื่น ๆ)
    //   ]
    // }
  },

  modules: ["@nuxt/icon"],

  plugins: [
    '~/plugins/GoogleMaps.js',
  ]
});