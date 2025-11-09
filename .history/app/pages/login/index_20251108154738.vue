<script setup lang="ts">
const form = reactive({
  email:'',
  password:''
})

async function login() {
  // тут запрос на backend Nest
  // await $fetch('/api/auth/login', { method:'post', body:form })
  navigateTo('/products')
}
</script>

<template>
  <v-container class="d-flex align-center justify-center" style="height:100vh">
    <v-card width="380">
      <v-card-title>Вход</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.email" label="Email" />
        <v-text-field v-model="form.password" type="password" label="Password"/>
        <v-btn block class="mt-4" @click="login">Войти</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>
