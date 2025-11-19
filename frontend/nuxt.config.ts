// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "@fortawesome/fontawesome-free/css/all.min.css"  // Font Awesome Icons
  ],

  app: {
    head: {
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com"
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous"
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Sarabun:wght@100;300;400;500;600;700;800&display=swap"
        }
      ]
    }
  },

  vite: {
    define: {
      "process.env.DEBUG": false,
    },
  },

  // (สำคัญ!) เพิ่มส่วนนี้กลับเข้ามา
  // นี่คือส่วนที่บอก Nuxt ให้โหลด JS ของ Bootstrap (ผ่าน Plugin)
  plugins: [
    { src: '~/plugins/bootstrap.client.js', mode: 'client' }
  ]
});