<script setup lang="ts">
import AuthService from '~/services/AuthService'
import { reactive } from 'vue'

definePageMeta({
  layout: 'auth'
})

const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  password: ''
})

async function signup() {
  try {
    await AuthService.signup(form)
    navigateTo('/users')
  } catch (err) {
    console.error('Signup error:', err)
  }
}
</script>

<template>
  <v-container class="d-flex align-center justify-center" style="height:100vh">
    <v-card width="380">
      <v-card-title>Регистрация</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.firstname" label="Имя" />
        <v-text-field v-model="form.lastname" label="Фамилия" />
        <v-text-field v-model="form.email" label="Email" />
        <v-text-field v-model="form.password" type="password" label="Пароль"/>

        <v-btn block class="mt-4" @click="signup">Создать пользователя</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>
