import axios from 'axios';
import { defineStore } from 'pinia';
import api from '~/plugins/api';


export const useProductStore = defineStore('products', {
 state: () => ({
  products: [] as any[],
  loading: false,
  error: null as string | null
 }),
 actions: {
  async addProducts(product: any) {
   this.loading = true,
    this.error = null,
   try {
    const response = await axios.post('/api.')
   } catch (error) {

   }
  }
 }
})