// /stores/products.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductsStore = defineStore('products', {
 state: () => ({
  products: [] as any[],
  total: 0,
  loading: false
 }),

 actions: {
  async fetchProducts(params: {
   page?: number
   pageSize?: number
   startBegin?: string | null
   startEnd?: string | null
  }) {
   try {
    this.loading = true

    const api = axios.create({
     baseURL: useRuntimeConfig().public.API_URL
    })

    const { data } = await api.get('/products', {
     params
    })

    this.products = data.data.data
    this.total = data.total
   } catch (err) {
    console.error('Error loading products', err)
   } finally {
    this.loading = false
   }
  }
 }
})
