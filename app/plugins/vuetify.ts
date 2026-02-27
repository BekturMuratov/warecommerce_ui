import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@fortawesome/fontawesome-free/css/all.css'
import { aliases, fa } from 'vuetify/iconsets/fa'
export default defineNuxtPlugin((app) => {
 const vuetify = createVuetify({
  components,
  directives,
  icons: {
      defaultSet: 'fa',
      aliases,
      sets: {
        fa,
      },
    },
 })
 app.vueApp.use(vuetify)
})
