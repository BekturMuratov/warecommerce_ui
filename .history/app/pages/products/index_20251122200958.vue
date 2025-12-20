<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductService from '~/services/ProductService'

const dvhList = ref([])

async function loadDvhList() {
  try {
    const data = await ProductService.getDvhList()
    dvhList.value = data
  } catch (err) {
    console.error('Ошибка загрузки DVH:', err)
  }
}

onMounted(loadDvhList)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Список DVH</v-card-title>

      <v-table>
        <thead>
          <tr>
            <th>DVH Number</th>
            <th>Product Owner</th>
            <th>Operator Who Registered</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in dvhList" :key="item.dvh_number">
            <td>{{ item.dvh_number }}</td>
            <td>{{ item.product_owner }}</td>
            <td>{{ item.operator_who_registered }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
