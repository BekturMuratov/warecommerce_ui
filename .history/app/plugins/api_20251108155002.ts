import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {

 const api = axios.create({
  baseURL: 'http://localhost:3000', // <-- сюда твой backend url
 })

 // если у тебя auth — токен можно брать из storage
 api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
   config.headers.Authorization = `Bearer ${token}`
  }
  return config
 })

 return {
  provide: {
   api
  }
 }
})
