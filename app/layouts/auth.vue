<template>
 <v-app>
   <v-main>
     <v-container
       class="d-flex align-center justify-center"
       style="height: 100vh"
     >
       <slot />
     </v-container>
   </v-main>
 </v-app>
</template>

<script setup lang="ts">
// Для login layout обычно логики нет, только оформление
</script>

<style scoped>
/* Можно добавить фон для login страницы */
.v-application {
 background: #f5f5f5;
}
</style>
