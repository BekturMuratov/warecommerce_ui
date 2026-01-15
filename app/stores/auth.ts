import { defineStore } from 'pinia'
import AuthService from '~/services/AuthService'

export const useAuthStore = defineStore('auth', () => {
  // access token — клиентский, нужен middleware
  const accessToken = useCookie<string | null>('access_token', {
    path: '/',
    sameSite: 'lax'
  })

  // optional: refresh token, если нужен
  const refreshToken = useCookie<string | null>('refresh_token', {
    path: '/',
    sameSite: 'lax'
  })

  const userId = useCookie<string | null>('user_id')
  const userName = useCookie<string | null>('user_name')
  const role = useCookie<string | null>('role')

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(payload: { email: string; password: string }) {
    const data = await AuthService.login(payload)

    // 👇 ЕДИНСТВЕННОЕ место, где пишутся cookies
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    userId.value = data.user_id
    userName.value = data.user_name
    role.value = data.role
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    userId.value = null
    userName.value = null
    role.value = null

    navigateTo('/login')
  }

  return {
    accessToken,
    refreshToken,
    userId,
    userName,
    role,
    isAuthenticated,
    login,
    logout
  }
})
