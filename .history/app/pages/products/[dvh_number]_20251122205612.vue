<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductService from '@/services/ProductServices.js'
import type { Product } from '~/types/products'

const route = useRoute()
const products = ref(Product)[]
const loading = ref(false)

async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number
    const data = await ProductService.getDvhDetail(dvh_number)
    products.value = data
  } catch (err) {
    console.error('Ошибка загрузки продуктов:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadProducts)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Товары для DVH: {{ route.params.dvh_number }}</v-card-title>

      <v-card-text>
        <v-data-table
          :items="products"
          :loading="loading"
          class="elevation-1"
          :items-per-page="10"
        >
          <template #headers>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>TNVED</th>
              <th>Weight</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Product Owner</th>
              <th>Released</th>
              <th>Operator Registered</th>
              <th>Operator Released</th>
              <th>Declaration #</th>
              <th>Transit Declaration #</th>
              <th>Arrival Date</th>
              <th>Departure Date</th>
              <th>Days in Storage</th>
              <th>Price for Storage</th>
              <th>Warehouse ID</th>
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
              <td>{{ item.released ? 'Yes' : 'No' }}</td>
              <td>{{ item.operator_who_registered }}</td>
              <td>{{ item.operator_who_released || '-' }}</td>
              <td>{{ item.declaration_number }}</td>
              <td>{{ item.transit_declaration_number }}</td>
              <td>{{ new Date(item.arrival_date).toLocaleDateString() }}</td>
              <td>{{ new Date(item.departure_date).toLocaleDateString() }}</td>
              <td>{{ item.count_of_days_in_storage }}</td>
              <td>{{ item.price_for_storage }}</td>
              <td>{{ item.warehouseId }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>
