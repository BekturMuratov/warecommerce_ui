<template>
  <NuxtLayout name="auth">
    <template #form>
      <LoginForm />
    </template>

    <template #hero>
      <HeroSection />
    </template>
  </NuxtLayout>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeroSection from '~/components/Auth/HeroSection.vue'
import LoginForm from '~/components/Auth/LoginForm.vue'
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


