// /stores/products.ts
import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductsStore = defineStore('products', {
 state: () => ({
  products: [] as any[],
  total: 0,
  totalPages: 1,
  loading: false,
  dvh_list: [] as any[],
 }),

 actions: {
  // Получение товаров с сервера
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

    const { data } = await api.get('/products', { params })

    this.products = data.data           // список товаров
    this.total = data.total             // общее количество товаров
    this.totalPages = data.totalPages   // количество страниц ← добавили
   } catch (err) {
    console.error('Error loading products', err)
   } finally {
    this.loading = false
   }
  },

  async fetchDvhList() {
   try {
    this.loading = true
    const api = axios.create({
     baseURL: useRuntimeConfig().public.API_URL
    })
    const { data } = await api.get('/products/dvh-list')
    this.dvh_list = data.data;

   } catch (error) {
    console.log('Error loading products', error)
   }
   finally {
    this.loading = false;
   }
  },

  // Добавление одного товара
  async addProduct(product: any) {
   try {
    const api = axios.create({
     baseURL: useRuntimeConfig().public.API_URL
    })

    const { data } = await api.post('/products', product)
    this.products.push(data)
    return data
   } catch (err) {
    console.error('Error adding product', err)
    throw err
   }
  },

  // Добавление массива товаров через batch
  async addProductsBatch(productsArray: any[]) {
   if (!productsArray.length) return

   try {
    this.loading = true

    const api = axios.create({
     baseURL: useRuntimeConfig().public.API_URL
    })

    // Отправляем массив сразу на /products/batch
    const { data } = await api.post('/products/batch', productsArray)

    // Обновляем локальный стейт: добавляем новые товары
    this.products.push(...data)

    return data
   } catch (err) {
    console.error('Error adding products batch', err)
    throw err
   } finally {
    this.loading = false
   }
  }
 }
})
