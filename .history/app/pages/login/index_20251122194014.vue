<script setup lang="ts">
import AuthService from '~/services/AuthService'
import { reactive } from 'vue'

definePageMeta({
  layout: 'auth'
})

const form = reactive({
  email: '',
  password: ''
})

async function login() {
  try {
    const data = await AuthService.login({
      email: form.email,
      password: form.password
    })

    // успешный вход → переход на products
    navigateTo('/products')

  } catch (err: any) {
    console.error('Login error:', err)
    // здесь можешь добавить UI нотификации (например, vuetify v-alert)
  }
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
