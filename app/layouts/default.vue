<template>
  <v-app>

    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!mobile"
      :temporary="mobile"
      width="260"
      class="app-sidebar"
    >
      <sidebar @close="drawer = false" />
    </v-navigation-drawer>

    <!-- HEADER -->
    <v-app-bar
      flat
      height="60"
      class="app-header"
    >
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
      />

      <v-spacer />

      <slot name="header" />
    </v-app-bar>

    <!-- MAIN -->
    <v-main class="app-main">
      <v-container fluid class="main-container">

        <slot />

      </v-container>
    </v-main>

  </v-app>
</template>

<script setup>

import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import Sidebar from '~/components/Layout/Sidebar.vue'

const drawer = ref(true)

const { mobile } = useDisplay()

</script>

<style scoped>

.app-sidebar{
  background:#0f1e33;
  color:white;
}

.app-main{
  background:#f4f6f8;
  min-height:100vh;
}

.app-header{
  background:white;
  border-bottom:1px solid #e5e7eb;
}

.main-container{
  margin:auto;
}

</style>