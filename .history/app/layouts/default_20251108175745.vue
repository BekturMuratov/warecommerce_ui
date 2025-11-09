<template>
 <v-app>
   <!-- AppBar -->
   <v-app-bar app color="primary" dark>
     <v-app-bar-title>АИС Система</v-app-bar-title>
     <v-spacer></v-spacer>
     <v-btn icon @click="logout">
       <v-icon>mdi-logout</v-icon>
     </v-btn>
   </v-app-bar>

   <!-- Drawer (боковое меню) -->
   <v-navigation-drawer app v-model="drawer" permanent>
     <v-list nav>
       <v-list-item
         v-for="item in menu"
         :key="item.title"
         :to="item.link"
         link
       >
         <v-list-item-title>{{ item.title }}</v-list-item-title>
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

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const drawer = ref(true)
const router = useRouter()

const menu = [
 { title: 'Товары', link: '/products' },
 // Добавь сюда другие страницы
]

function logout() {
 localStorage.removeItem('token')
 router.push('/login')
}
</script>
