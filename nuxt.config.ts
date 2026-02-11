// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['vuetify/styles'],

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@pinia/nuxt',   // ✅ ВАЖНО!
  ],

  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL,
      PDF_URL: process.env.PDF_GENERATION_URL
    },
    proxy: {
    '/api/': {
      target: 'http://46.8.24.33:5000',
      changeOrigin: true,
      pathRewrite: { '^/api/': '/api/' }
    },
      '/script': {
        target: 'http://127.0.0.1:9200',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/script/, ''),
      }
  },
  }
})
