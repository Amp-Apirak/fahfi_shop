// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: [
    "bootstrap/dist/css/bootstrap.min.css"
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
        },
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        }
      ],
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js",
          async: true
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