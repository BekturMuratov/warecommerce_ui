<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

const auth = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

async function login() {
  loading.value = true
  errorMessage.value = ''

  try {
    await auth.login(form)
    await navigateTo('/cars')
  } catch (e) {
    errorMessage.value = 'Неверный email или пароль'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <v-container
    fluid
    class="d-flex align-center justify-center bg-grey-lighten-4"
    style="min-height: 100vh"
  >
    <v-card
      elevation="6"
      rounded="lg"
      width="400"
      class="pa-6"
    >
      <v-card-title class="text-h5 text-center mb-2">
        Вход в систему
      </v-card-title>

      <v-card-subtitle class="text-center mb-6">
        Введите данные своей учётной записи
      </v-card-subtitle>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <v-form @submit.prevent="login">
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          density="comfortable"
          required
        />

        <v-text-field
          v-model="form.password"
          label="Пароль"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          density="comfortable"
          required
        />

        <v-btn
          block
          size="large"
          color="primary"
          class="mt-4"
          :loading="loading"
          :disabled="loading"
          type="submit"
        >
          Войти
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
