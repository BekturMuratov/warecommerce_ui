<template>
 <v-container>
   <v-card>
     <v-card-title>Товары для DVH: {{ route.params.dvh_number }}</v-card-title>

     <v-card-text>
      <v-btn
          color="primary"
          @click="generatePDF"
          class="mb-4"
        >
          Сформировать PDF (Акт выпуска)
        </v-btn>

       <v-data-table
         :items="products"
         :loading="loading"
         class="elevation-1"
         :items-per-page="10"
       >
         <template #headers>
           <tr>
             <th>ID</th>
             <th>Наименование</th>
             <th>TNVED</th>
             <th>Вес</th>
             <th>Количество</th>
             <th>Цена</th>
             <th>Валюта</th>
             <th>Владелец</th>
             <th>Дата прибытия</th>
             <th>Дата убытия</th>
             <th>Склад</th>
           </tr>
         </template>

         <template #item="{ item }">
           <tr>
             <td>{{ item.id }}</td>
             <td>{{ item.name }}</td>
             <td>{{ item.tnved_code }}</td>
             <td>{{ item.weight }}</td>
             <td>{{ item.quantity }}</td>
             <td>{{ item.price }}</td>
             <td>{{ item.currency }}</td>
             <td>{{ item.product_owner }}</td>
             <td>{{ new Date(item.arrival_date).toLocaleDateString() }}</td>
             <td>{{ item.departure_date ? new Date(item.departure_date).toLocaleDateString() : '-' }}</td>
             <td>{{ item.warehouseId }}</td>
           </tr>
         </template>
       </v-data-table>
     </v-card-text>
      <!-- МОДАЛКА PDF -->
    <v-dialog v-model="pdfDialog" width="80%">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>PDF акт приема</span>
          <v-btn icon="" @click="pdfDialog = false">
            ✕
          </v-btn>
        </v-card-title>

        <v-card-text style="height: 80vh">
          <embed
            v-if="pdfUrl"
            :src="pdfUrl"
            type="application/pdf"
            style="width: 100%; height: 100%;"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
   </v-card>
 </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductService from '@/services/ProductServices.js'
import type { Product } from '~/types/products'

const route = useRoute()
const products = ref<Product[]>([])
const loading = ref(false)

// PDF modal state
const pdfDialog = ref(false)
const pdfUrl = ref('')

// Загружаем товары для выбранного DVH
async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number as string
    const data: Product[] = await ProductService.getReleasedDvhDetail(dvh_number)
    products.value = data
  } catch (err) {
    console.error('Ошибка загрузки продуктов:', err)
  } finally {
    loading.value = false
  }
}

/* Генерация PDF */
async function generatePDF() {
  try {
    const dvh_number = route.params.dvh_number as string

    const response = await ProductService.generatePdf(dvh_number)

    console.log("PDF byteLength:", response.data.byteLength)

    const pdfBlob = new Blob([response.data], {
      type: "application/pdf"
    })

    pdfUrl.value = URL.createObjectURL(pdfBlob)
    pdfDialog.value = true
    console.log("PDF Size:", response.data.byteLength)

  } catch (err) {
    console.error("Ошибка генерации PDF:", err)
  }
}


onMounted(loadProducts)
</script>