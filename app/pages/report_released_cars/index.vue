<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import CarsService from '~/services/CarsService.js'

const { smAndDown } = useDisplay()

/* ================= UTILS ================= */

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

/* ================= STATE ================= */

const filters = ref({
  date_from: formatToday(),
  date_to: formatToday()
})

const stocks = ref<any[]>([])
const loading = ref(false)

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Наименование', value: 'name' },
  { title: 'TNVED', value: 'tnved_code' },
  { title: 'Вес', value: 'weight' },
  { title: 'Цена', value: 'price' },
  { title: 'Валюта', value: 'currency' },
  { title: 'Владелец', value: 'car_owner.name' },
  { title: 'VIN', value: 'vin_code' },
  { title: 'Год', value: 'car_year' },
  { title: 'Тип', value: 'type' },
  { title: 'Дата прибытия', value: 'arrival_date' },
  { title: 'Дата выезда', value: 'departure_date' },
  { title: 'Склад', value: 'warehouse.name' }
]

/* ================= API ================= */

async function loadStocks() {
  loading.value = true
  try {
    stocks.value = await CarsService.getReleasedStocks({
      date_from: filters.value.date_from,
      date_to: filters.value.date_to
    })
  } catch {
    snackbarMessage.value = 'Ошибка загрузки выпущенных АТС'
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
    })

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `Выпущенные_АТС_${filters.value.date_from}_по_${filters.value.date_to}.xlsx`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  } catch {
    snackbarMessage.value = 'Ошибка скачивания Excel'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

onMounted(loadStocks)
</script>

<template>
  <v-container fluid>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <v-card>
      <v-card-title>
        Отчет по выпущенным АТС
      </v-card-title>

      <!-- ================= FILTERS ================= -->
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="filters.date_from"
              type="date"
              label="Начало периода"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="filters.date_to"
              type="date"
              label="Конец периода"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-btn
              block
              color="primary"
              @click="loadStocks"
            >
              Применить фильтр
            </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <v-btn
              block
              color="success"
              @click="downloadExcel"
            >
              Скачать Excel
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- ================= DESKTOP TABLE ================= -->
      <v-data-table
        v-if="!smAndDown"
        :headers="headers"
        :items="stocks"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <template #item.arrival_date="{ item }">
          {{ formatDate(item.arrival_date) }}
        </template>

        <template #item.departure_date="{ item }">
          {{ item.departure_date
              ? formatDate(item.departure_date)
              : '-' }}
        </template>
      </v-data-table>

      <!-- ================= MOBILE CARDS ================= -->
      <div v-else class="pa-2">
        <v-card
          v-for="item in stocks"
          :key="item.id"
          class="mb-3"
          variant="outlined"
        >
          <v-card-text>
            <div class="mobile-row">

              <span class="label">ID</span>
              <span>{{ item.id }}</span>

              <span class="label">Наименование</span>
              <span>{{ item.name }}</span>

              <span class="label">TNVED</span>
              <span>{{ item.tnved_code }}</span>

              <span class="label">Вес</span>
              <span>{{ item.weight }}</span>

              <span class="label">Цена</span>
              <span>{{ item.price }} {{ item.currency }}</span>

              <span class="label">Владелец</span>
              <span>{{ item.car_owner?.name }}</span>

              <span class="label">VIN</span>
              <span>{{ item.vin_code }}</span>

              <span class="label">Год</span>
              <span>{{ item.car_year }}</span>

              <span class="label">Тип</span>
              <span>{{ item.type }}</span>

              <span class="label">Дата прибытия</span>
              <span>{{ formatDate(item.arrival_date) }}</span>

              <span class="label">Дата выезда</span>
              <span>
                {{ item.departure_date
                    ? formatDate(item.departure_date)
                    : '-' }}
              </span>

              <span class="label">Склад</span>
              <span>{{ item.warehouse?.name }}</span>

            </div>
          </v-card-text>
        </v-card>
      </div>

    </v-card>
  </v-container>
</template>

<style scoped>
.mobile-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  font-size: 14px;
}

.label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}
</style>