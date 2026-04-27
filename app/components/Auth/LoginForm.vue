<template>
  <v-card width="500" elevation="0" class="pa-6 bg-transparent">

    <div class="d-flex align-center mb-6">
    <img src="../../assets/img/database-table.png" alt="АИС СВХ" width="32" height="32" />
      <span class="text-h6 font-weight-bold">АИС СВХ</span>
    </div>

    <h2 class="text-h5 font-weight mb-2">
      Авторизация
    </h2>

    <p class="text-body-2 text-grey mb-6">
      Введите ваши учетные данные для доступа к реестру
    </p>

    <label class="text-body-2 font-weight mb-1">
      Логин
      </label>  
    <v-text-field
      label="Логин"
      variant="outlined"
      density="comfortable"
      class="mb-4"
      v-model="form.email"
    />

    <label class="text-body-2 font-weight mb-1">
      Пароль
      </label>  
    <v-text-field
      label="Пароль"
      type="password"
      variant="outlined"
      density="comfortable"
      class="mb-2"
      v-model="form.password"
    />

    <v-alert
  v-if="errorMessage"
  type="error"
  class="mb-4"
>
  {{ errorMessage }}
</v-alert>

    <div class="d-flex justify-space-between align-center mb-6">
      <v-checkbox
        label="Запомнить меня"
        density="compact"
        hide-details
      />
      <a class="text-primary text-body-2">Забыли пароль?</a>
    </div>

    <v-btn
      block
      size="large"
      color="black"
      class="text-white"
      :loading="loading"
      @click="login"
    >
      ВОЙТИ В СИСТЕМУ
    </v-btn>

    <div class="mt-10 text-caption text-grey">
      © 2026 АИС СВХ. Все права защищены.
    </div>

  </v-card>
</template>


<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
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

<style scoped>
.font-weight {
  font-weight: 700;
}
.text-h5 {
    font-size: 1.25rem;
}


@media (max-width:600px){

  .login-card{
    padding:24px 16px;
  }

}
</style>