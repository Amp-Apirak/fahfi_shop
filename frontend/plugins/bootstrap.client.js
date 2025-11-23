import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    window.bootstrap = bootstrap
  }
})
