<template>
  <v-app>
    <!-- AppBar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>АИС Склад</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Drawer -->
    <v-navigation-drawer app v-model="drawer" permanent>
      <v-list nav>

        <!-- Пункты меню -->
        <v-list-item
          v-for="item in menu"
          :key="item.title"
          :to="item.link"
          link
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <!-- Разделитель -->
        <v-divider class="my-2" />

        <!-- Выход -->
        <v-list-item
          @click="handleLogout"
          link
        >
          <v-icon start color="error">-></v-icon>
          <v-list-item-title class="text-error">
            Выход
          </v-list-item-title>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <!-- Основной контент -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>


<script setup >
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from "js-cookie";

const drawer = ref(true)
const router = useRouter()

const menu = [
 { title: 'Товары', link: '/products' },
 { title: 'Выпущенные товары', link: '/released_products' },
 // Добавь сюда другие страницы
]

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>
