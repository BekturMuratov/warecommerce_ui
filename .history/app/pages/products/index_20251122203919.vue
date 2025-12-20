<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ProductService from '@/services/ProductServices.js'

// Получаем сегодняшнюю дату в формате YYYY-MM-DD
function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = formatDate(new Date())

const dvhList = ref([])
const pagination = ref({ currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 })
const loading = ref(false)

// Фильтры с сегодняшней датой по умолчанию
const startDate = ref(today)
const endDate = ref(today)

async function loadDvhList() {
  loading.value = true
  try {
    const data = await ProductService.getDvhList({
      pageNumber: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      startDate: startDate.value,
      endDate: endDate.value
    })
    console.log('curPage:', pagination.value.currentPage);
    console.log('pageSize:', pagination.value.pageSize);

    dvhList.value = data.data
    pagination.value = data.pagination
  } catch (err) {
    console.error('Ошибка загрузки DVH:', err)
  } finally {
    loading.value = false
  }
}

// Перезагрузка данных при смене страницы
watch([() => pagination.value.currentPage, () => pagination.value.pageSize], loadDvhList)

onMounted(loadDvhList)
</script>


<template>
  <v-container>
    <v-card>
      <v-card-title>Список DVH</v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="startDate" label="Начало периода" type="date" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="endDate" label="Конец периода" type="date" />
          </v-col>
          <v-col cols="12">
            <v-btn @click="loadDvhList">Применить фильтр</v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :items="dvhList"
        :loading="loading"
        :items-per-page="paginationpageSize"
        :page.sync="pagination.currentPage"
        :server-items-length="pagination.totalItems"
        class="elevation-1"
      >
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>DVH List</v-toolbar-title>
          </v-toolbar>
        </template>

        <template #item.arrival_date="{ item }">
          {{ new Date(item.arrival_date).toLocaleDateString() }}
        </template>

        <template #headers>
          <tr>
            <th>DVH Number</th>
            <th>Product Owner</th>
            <th>Operator</th>
            <th>Arrival Date</th>
          </tr>
        </template>

        <template #item="{ item }">
          <tr>
            <td>{{ item.dvh_number }}</td>
            <td>{{ item.product_owner }}</td>
            <td>{{ item.operator_who_registered }}</td>
            <td>{{ new Date(item.arrival_date).toLocaleDateString() }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
