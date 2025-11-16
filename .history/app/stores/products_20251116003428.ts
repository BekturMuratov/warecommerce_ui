import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
 state: () => ({
  products: [] as any[],
  loading: false,
  error: null as string | null,
 }),
 actions: {
  async addProduct(product: any) {
   this.loading = true
   this.error = null
   try {
    const response = await $fetch('/api/products', {
     method: 'POST',
     body: product
    })
    this.products.push(response)
   } catch (err: any) {
    this.error = err.message || 'Ошибка при добавлении продукта'
   } finally {
    this.loading = false
   }
  }
 }
})
