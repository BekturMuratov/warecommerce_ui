<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top right>
      {{ snackbarMessage }}
    </v-snackbar>

    <v-card>
      <v-card-title>Отчет по выпущенным АТС</v-card-title>

      <!-- Filters -->
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="filters.date_from" type="date" label="Начало периода" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="filters.date_to" type="date" label="Конец периода" />
          </v-col>
          <v-col cols="6">
            <v-btn block color="primary" @click="loadStocks">Применить фильтр</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block color="success" @click="downloadExcel">Скачать Excel</v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Table -->
      <v-data-table
        :headers="headers"
        :items="stocks"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template v-slot:item.arrival_date="{ item }">
          {{ formatDate(item.arrival_date) }}
        </template>
        <template v-slot:item.departure_date="{ item }">
          {{ item.departure_date ? formatDate(item.departure_date) : '-' }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CarsService from '~/services/CarsService.js'

// ====== Utils ======
function formatToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ====== State ======
const filters = ref({
  date_from: formatToday(),
  date_to: formatToday()
})

const stocks = ref<any[]>([])
const loading = ref(false)

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Таблица
const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Наименование', value: 'name' },
  { text: 'TNVED', value: 'tnved_code' },
  { text: 'Вес', value: 'weight' },
  { text: 'Цена', value: 'price' },
  { text: 'Валюта', value: 'currency' },
  { text: 'Владелец', value: 'car_owner.name' },
  { text: 'VIN', value: 'vin_code' },
  { text: 'Год', value: 'car_year' },
  { text: 'Тип', value: 'type' },
  { text: 'Дата прибытия', value: 'arrival_date' },
  { text: 'Дата выезда', value: 'departure_date' },
  { text: 'Склад', value: 'warehouse.name' }
]

// ====== API ======
async function loadStocks() {
  loading.value = true
  try {
    const data = await CarsService.getReleasedStocks({
      date_from: filters.value.date_from,
      date_to: filters.value.date_to
    })
    stocks.value = data
  } catch (err) {
    console.error(err)
    snackbarMessage.value = 'Ошибка загрузки остатков АТС'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}

async function downloadExcel() {
  try {
    const buffer = await CarsService.exportAllReleasedStock({
      date_from: filters.value.date_from + 'T00:00:00Z',
      date_to: filters.value.date_to + 'T23:59:59Z',
    });

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `Выпущенные_АТС_${filters.value.date_from}_по_${filters.value.date_to}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    snackbarMessage.value = 'Ошибка скачивания Excel';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

// ====== Init ======
onMounted(loadStocks)
</script>
