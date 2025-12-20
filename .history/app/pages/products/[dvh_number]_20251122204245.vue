<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductService from '@/services/ProductServices.js'

const route = useRoute()
const dvhDetail = ref(null)
const loading = ref(false)

async function loadDvhDetail() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number
    const api = useRuntimeConfig().public.API_URL
    const response = await ProductService.getDvhDetail(dvh_number)
    dvhDetail.value = response
  } catch (err) {
    console.error('Ошибка загрузки DVH:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadDvhDetail)
</script>

<template>
  <v-container>
    <v-card v-if="dvhDetail">
      <v-card-title>DVH: {{ dvhDetail.dvh_number }}</v-card-title>
      <v-card-text>
        <p><strong>Product Owner:</strong> {{ dvhDetail.product_owner }}</p>
        <p><strong>Operator:</strong> {{ dvhDetail.operator_who_registered }}</p>
        <p><strong>Arrival Date:</strong> {{ new Date(dvhDetail.arrival_date).toLocaleDateString() }}</p>
        <!-- Добавляй другие поля из ответа API -->
      </v-card-text>
    </v-card>

    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
  </v-container>
</template>
