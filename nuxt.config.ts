export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Cabodbod & Setarios | Real Estate',
      meta: [
        { name: 'description', content: 'Browse properties for sale and rent with Cabodbod & Setarios.' }
      ]
    }
  }
})
