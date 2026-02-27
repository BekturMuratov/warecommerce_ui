<template>
  <v-container fluid class="pa-2 pa-md-4">
    <!-- SNACKBAR -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <v-card>
      <v-card-title class="text-h6 text-md-h5">
        Список зарегистрированных АТС
      </v-card-title>

      <!-- FILTERS -->
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="startDate"
              type="date"
              label="Начало периода"
              density="comfortable"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="endDate"
              type="date"
              label="Конец периода"
              density="comfortable"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-btn block @click="loadDvhList">
              Применить
            </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <v-btn block color="primary" @click="isDialogOpen = true">
              Открыть PDF
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- DESKTOP TABLE -->
      <v-data-table
        v-if="!smAndDown"
        :items="dvhList"
        :loading="loading"
        :items-per-page="pagination.pageSize"
        :headers="dvhHeaders"
        class="elevation-1"
      >
        <template #item.dvh_number="{ item }">
          <NuxtLink :to="`/cars/${item.dvh_number}`">
            {{ item.dvh_number }}
          </NuxtLink>
        </template>

        <template #item.arrival_date="{ item }">
          {{ formatDateTime(item.arrival_date) }}
        </template>
      </v-data-table>

      <!-- MOBILE LIST -->
      <div v-else class="pa-2">
        <v-card
          v-for="(item, i) in dvhList"
          :key="i"
          class="mb-3"
          variant="outlined"
        >
          <v-card-text>
            <div class="mobile-row">
              <span class="label">Номер ДВХ</span>
              <NuxtLink :to="`/cars/${item.dvh_number}`">
                {{ item.dvh_number }}
              </NuxtLink>

              <span class="label">Дата</span>
              <span>{{ formatDateTime(item.arrival_date) }}</span>

              <span class="label">Оператор</span>
              <span>{{ item.operator_who_registered }}</span>

              <span class="label">Владелец</span>
              <span>{{ item.product_owner }}</span>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- PDF DIALOG -->
      <v-dialog v-model="isDialogOpen" fullscreen>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Обработка PDF</v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="isDialogOpen = false">✕</v-btn>
          </v-toolbar>

          <v-card-text>
            <v-row>
              <!-- PDF -->
              <v-col cols="12" md="6">
                <v-file-input
                  accept=".pdf"
                  label="Загрузить PDF"
                  @change="handleFileUpload"
                />

                <ClientOnly>
                  <VuePdfEmbed
                    v-if="pdfUrl"
                    :source="pdfUrl"
                    class="pdf-viewer"
                  />
                </ClientOnly>
              </v-col>

              <!-- RESULT -->
              <v-col cols="12" md="6">
                <v-progress-circular
                  v-if="isPdfLoading"
                  indeterminate
                  color="primary"
                  class="mb-3"
                />

                <v-alert v-if="pdfError" type="error">
                  {{ pdfError }}
                </v-alert>

                <h3 class="mb-3">Результат</h3>

                <!-- MOBILE PRODUCTS -->
                <div v-if="tableData.length && smAndDown">
                  <v-card
                    v-for="(item, i) in tableData"
                    :key="i"
                    class="mb-3"
                    variant="outlined"
                  >
                    <v-card-text>
                      <div class="mobile-row">
                        <span class="label">Код ТНВЭД</span>
                        <span>{{ item.hsCode }}</span>

                        <span class="label">Наименование</span>
                        <span>{{ item.name }}</span>

                        <span class="label">Вес</span>
                        <span>{{ item.weight }}</span>

                        <span class="label">Кол-во</span>
                        <span>{{ item.qty }}</span>

                        <span class="label">Цена</span>
                        <span>{{ item.price }}</span>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- DESKTOP PRODUCTS -->
                <v-table v-else-if="tableData.length">
                  <thead>
                    <tr>
                      <th>Код ТНВЭД</th>
                      <th>Наименование</th>
                      <th>Вес</th>
                      <th>Кол-во</th>
                      <th>Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in tableData" :key="i">
                      <td>{{ item.hsCode }}</td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.weight }}</td>
                      <td>{{ item.qty }}</td>
                      <td>{{ item.price }}</td>
                    </tr>
                  </tbody>
                </v-table>

                <v-btn
                  color="primary"
                  class="mt-4"
                  block
                  @click="sendProductsToServer"
                >
                  Отправить на сервер
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import { ref, defineAsyncComponent, onMounted, watch, onBeforeUnmount } from 'vue'
import type { DvhListItem } from '~/types/products'
import Cookies from 'js-cookie'
import CarsService from '~/services/CarsService'
import PDFService from '~/services/PDFService'
import { v4 as uuidv4 } from 'uuid'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()
const VuePdfEmbed = defineAsyncComponent(() =>
  import('vue-pdf-embed')
)

/* ==================== TABLE HEADERS ==================== */

const dvhHeaders = [
  { title: 'Номер ДВХ', value: 'dvh_number' },
  { title: 'Дата создания', value: 'arrival_date' },
  { title: 'Оператор', value: 'operator_who_registered' },
  { title: 'Владелец', value: 'product_owner' }
]

/* ==================== UTILS ==================== */

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toISOString().replace('T', ' ').split('.')[0]
}

/* ==================== STATE ==================== */

const today = formatDate(new Date())

const dvhList = ref<DvhListItem[]>([])
const pagination = ref({ currentPage: 1, pageSize: 10, totalItems: 0 })
const loading = ref(false)

const startDate = ref(today)
const endDate = ref(today)

const isDialogOpen = ref(false)

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

const pdfUrl = ref<string | null>(null)
const isPdfLoading = ref(false)
const pdfError = ref<string | null>(null)
const tableData = ref<any[]>([])
const headerData = ref<any>({})

const ownerInn = ref('')
const ownerLoading = ref(false)
const ownerError = ref<string | null>(null)
const carOwnerId = ref<number | null>(null)
const ownerData = ref<any>(null)

const carrier_name = ref('')

/* warehouse_id берём один раз */
const warehouseId = ref<number | null>(null)

/* ==================== LOAD DVH ==================== */

async function loadDvhList() {
  loading.value = true
  try {
    const data: any = await CarsService.getDvhList({
      pageNumber: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      startDate: startDate.value + "T00:00:00Z",
      endDate: endDate.value + "T23:59:59Z"
    })

    dvhList.value = data.data
    pagination.value.totalItems = data.pagination.totalItems
  } finally {
    loading.value = false
  }
}

/* ==================== PDF ==================== */

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }

  pdfUrl.value = URL.createObjectURL(file)
  isPdfLoading.value = true
  pdfError.value = null

  try {
    const res = await PDFService.uploadCarPdf(file)

    if (res?.status !== 'ok') {
      throw new Error(res?.message || 'Ошибка обработки PDF')
    }

    tableData.value = Array.isArray(res.result?.products)
      ? res.result.products
      : []

    headerData.value = res.result?.header || {}

    /* 🔹 Автозаполнение перевозчика из PDF */
    if (tableData.value.length && tableData.value[0]?.sender) {
      carrier_name.value = tableData.value[0].sender
    }

  } catch (error) {
    pdfError.value = 'Ошибка загрузки PDF'
  } finally {
    isPdfLoading.value = false
  }
}

/* ==================== OWNER ==================== */

const findOwnerByInn = async () => {
  if (!ownerInn.value) {
    ownerError.value = 'Введите ИНН'
    return
  }

  ownerLoading.value = true
  ownerError.value = null
  ownerData.value = null
  carOwnerId.value = null

  try {
    const res = await fetch(
      `http://46.8.24.33/api/owners/find-by-inn?inn=${ownerInn.value}`
    )

    if (!res.ok) throw new Error()

    const data = await res.json()
    const owner = data?.[0]

    if (!owner?.id) throw new Error()

    ownerData.value = owner
    carOwnerId.value = owner.id

  } catch {
    ownerError.value = 'Владелец не найден'
  } finally {
    ownerLoading.value = false
  }
}

/* ==================== SEND TO SERVER ==================== */

const sendProductsToServer = async () => {

  if (!warehouseId.value) {
    snackbarMessage.value = 'Склад не определён'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  if (!carOwnerId.value) {
    snackbarMessage.value = 'Сначала найдите владельца по ИНН'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  if (!tableData.value.length) {
    snackbarMessage.value = 'Нет данных для отправки'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  try {

    /* 🔥 Создаём массив payload */
const payload = tableData.value.flatMap((product) => {
  const count = Number(product.qty) || 1

  return Array.from({ length: count }).map(() => ({
    name: product.name,
    tnved_code: product.hsCode,
    guid: uuidv4(),
    weight: Number(product.weight),
    price: Number(product.price),
    currency: product.currency || 'USD',

    dvh_number: product.dvh_number,
    vin_code: product.vin_code,
    sender: product.sender,
    recipient: product.recipient,

    car_year: '',
    released: false,
    operator_who_registered: localStorage.getItem('user_name') || '',
    operator_who_released: null,
    deleted: false,
    declaration_number: '',
    transit_declaration_number: '',
    arrival_date: new Date(),
    departure_date: null,
    count_of_days_in_storage: 0,
    price_for_storage: 0,
    type: 'SUV',
    carrier_name: carrier_name.value || 'Неизвестный перевозчик',

    car_ownerId: carOwnerId.value,
    warehouseId: warehouseId.value
  }))
})

    /* 🔥 Отправляем массив */
    await CarsService.createCar(payload)

    snackbarMessage.value = `Успешно добавлено машин: ${payload.length}`
    snackbarColor.value = 'success'
    snackbar.value = true
    isDialogOpen.value = false

  } catch (e) {
    console.error(e)
    snackbarMessage.value = 'Ошибка отправки данных'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
/* ==================== WATCH ==================== */

watch(
  [() => pagination.value.currentPage, () => pagination.value.pageSize],
  loadDvhList
)

/* ==================== LIFECYCLE ==================== */

onMounted(() => {
  const cookieWarehouse = Cookies.get('warehouse_id')

  if (!cookieWarehouse) {
    snackbarMessage.value = 'Не найден warehouse_id в Cookies'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  warehouseId.value = Number(cookieWarehouse)

  loadDvhList()
})

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>
<style scoped>
.mobile-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}

.label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}

.pdf-viewer {
  max-height: 70vh;
  overflow: auto;
}
</style>