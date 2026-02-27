<template>
  <v-app>
    <!-- ================= APP BAR ================= -->
    <v-app-bar app color="primary" dark>
      <!-- Бургер только на мобильных -->
      <v-app-bar-nav-icon
        v-if="!mdAndUp"
        @click="drawer = !drawer"
      />

      <v-app-bar-title>АИС Склад</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="handleLogout">
           <v-icon icon="fas fa-sign-out-alt" />
      </v-btn>
    </v-app-bar>

    <!-- ================= DRAWER ================= -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      app
    >
      <v-list nav>

        <!-- Пункты меню -->
        <v-list-item
          v-for="item in menu"
          :key="item.title"
          :to="item.link"
          link
          @click="!mdAndUp && (drawer = false)"
        >
          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <!-- Выход -->
        <v-list-item
          @click="handleLogout"
          link
        >
          <v-icon start color="error">
            mdi-logout
          </v-icon>

          <v-list-item-title class="text-error">
            Выход
          </v-list-item-title>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <!-- ================= MAIN ================= -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

/* ================= DISPLAY ================= */
const { mdAndUp } = useDisplay()

/* ================= DRAWER ================= */
const drawer = ref(false)

/* 
   Если экран md и выше → drawer всегда открыт
   Если меньше md → закрыт
*/
watch(
  mdAndUp,
  (val) => {
    drawer.value = val
  },
  { immediate: true }
)

/* ================= MENU ================= */
const menu = [
  { title: 'Дашборд', link: '/' },
  { title: 'Владельцы', link: '/owners' },
  { title: 'Регистрация АТС', link: '/cars' },
  { title: 'Выпущенные АТС', link: '/released_cars' },
  { title: 'Отчет помещенных АТС', link: '/report_stock_cars' },
  { title: 'Отчет выпущенных АТС', link: '/report_released_cars' },
]

/* ================= AUTH ================= */
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>