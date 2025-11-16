// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    'vuetify/styles'
  ],
  build: {
    transpile: ['vuetify'],
  },
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL
    }
  }
})
