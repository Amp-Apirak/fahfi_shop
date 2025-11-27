// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: [
    "bootstrap/dist/css/bootstrap.min.css"
  ],

  app: {
    // baseURL: '/fahfishop/', // ปิดการใช้งาน baseURL เพื่อให้รันที่ localhost:3000 ได้โดยตรง
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
        },
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
          integrity: "sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL",
          crossorigin: "anonymous"
        }
      ]
    }
  },

  vite: {
    define: {
      "process.env.DEBUG": false,
    },
  },

  // ตั้งค่า Proxy สำหรับ Dev Mode (เพื่อให้เรียก /api ไปที่ Port 3001 ได้)
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3001/api/**' },
    },
  },
});