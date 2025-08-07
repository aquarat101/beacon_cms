import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      apiDomain: process.env.API_DOMAIN || ''
    },
  },

  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],

    server: {
      allowedHosts: [
        '56445663b9d2.ngrok-free.app' // 👈 เพิ่ม host ที่จะใช้ (จาก ngrok หรืออื่น ๆ)
      ]
    }
  },

  modules: ["@nuxt/icon"],

  plugins: [
    '~/plugins/GoogleMaps.js',
  ]
});