<template>
  <v-container fluid>
    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top right>
      {{ snackbarMessage }}
    </v-snackbar>

    <v-card>
      <v-card-title>Список зарегистрированных товаров</v-card-title>

      <!-- Filters -->
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="startDate" type="date" label="Начало периода" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="endDate" type="date" label="Конец периода" />
          </v-col>
          <v-col cols="6">
            <v-btn block @click="loadDvhList">Применить</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block color="primary" @click="isDialogOpen = true">
              Открыть PDF
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Table -->
      <v-data-table
        :items="dvhList"
        :loading="loading"
        :items-per-page="pagination.pageSize"
        :server-items-length="pagination.totalItems"
        :headers="dvhHeaders"
      >
        <template #item.dvh_number="{ item }">
          <NuxtLink :to="`/products/${item.dvh_number}`">
            {{ item.dvh_number }}
          </NuxtLink>
        </template>

        <template #item.arrival_date="{ item }">
          {{ formatDateTime(item.arrival_date) }}
        </template>
      </v-data-table>

      <!-- PDF DIALOG -->
      <v-dialog v-model="isDialogOpen" fullscreen>
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Обработка PDF</v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="isDialogOpen = false">✕</v-btn>
          </v-toolbar>

          <v-card-text class="pa-0">
            <v-row no-gutters>
              <!-- PDF -->
              <v-col cols="6" class="pa-4">
                <v-file-input
                  accept=".pdf"
                  label="Загрузить PDF"
                  @change="handleFileUpload"
                />
                <ClientOnly>
                  <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" />
                </ClientOnly>
              </v-col>

              <!-- Result -->
              <v-col cols="6" class="pa-4">
                <div v-if="isPdfLoading" class="d-flex align-center">
                  <v-progress-circular indeterminate size="32" class="mr-2" />
                  <span>Обработка PDF…</span>
                </div>

                <h3>Результат</h3>

                <!-- OWNER -->
                <v-text-field
                  v-model="ownerInn"
                  label="ИНН владельца"
                  placeholder="118051994055221"
                />

                <v-btn
                  color="primary"
                  class="mb-2"
                  :loading="ownerLoading"
                  @click="findOwnerByInn"
                >
                  Найти владельца
                </v-btn>

                <v-alert v-if="ownerData" type="success">
                  Владелец найден: {{ ownerData.name }}
                </v-alert>

                <!-- PRODUCTS -->
                <v-alert v-if="!tableData.length" type="info" variant="tonal">
                  Данные появятся после обработки PDF
                </v-alert>

                <v-table v-else>
                  <thead>
                    <tr>
                      <th>ТНВЭД</th>
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

                <v-btn color="primary" class="mt-4" @click="sendProductsToServer">
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
definePageMeta({ middleware: 'auth' })

import { ref, onMounted, watch, onBeforeUnmount, defineAsyncComponent } from 'vue'
import ProductService from '@/services/ProductServices'
import Cookies from 'js-cookie'
import PDFService from '~/services/PDFService'
import OwnersService from '~/services/OwnersService'

const VuePdfEmbed = defineAsyncComponent(() => import('vue-pdf-embed'))

/* ================== TABLE ================== */
const dvhHeaders = [
  { title: 'Номер ДВХ', value: 'dvh_number' },
  { title: 'Дата создания', value: 'arrival_date' },
  { title: 'Оператор', value: 'operator_who_registered' },
  { title: 'Владелец', value: 'product_owner.name' }
]

/* ================== STATE ================== */
const dvhList = ref([])
const pagination = ref({ currentPage: 1, pageSize: 10, totalItems: 0 })
const loading = ref(false)

const today = new Date().toISOString().slice(0, 10)
const startDate = ref(today)
const endDate = ref(today)

/* ================== PDF ================== */
const isDialogOpen = ref(false)
const pdfUrl = ref<string | null>(null)
const isPdfLoading = ref(false)
const tableData = ref<any[]>([])
const headerData = ref<any>({})

/* ================== OWNER ================== */
const ownerInn = ref('')
const ownerData = ref<any>(null)
const productOwnerId = ref<number | null>(null)
const ownerLoading = ref(false)

/* ================== UI ================== */
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

/* ================== METHODS ================== */
async function loadDvhList() {
  loading.value = true
  try {
    const res: any = await ProductService.getDvhList({
      pageNumber: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      startDate: startDate.value + 'T00:00:00Z',
      endDate: endDate.value + 'T23:59:59Z'
    })
    dvhList.value = res.data
    pagination.value.totalItems = res.pagination.totalItems
  } finally {
    loading.value = false
  }
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  pdfUrl.value = URL.createObjectURL(file)
  isPdfLoading.value = true

  const formData = new FormData()
  formData.append('file', file)

  const res = await PDFService.uploadPdf(formData);

  tableData.value = res?.result?.products || []

  if (!Object.keys(headerData.value).length) {
    headerData.value = res?.result?.header || {}
  }

  isPdfLoading.value = false
}

async function findOwnerByInn() {
  ownerLoading.value = true;

  try {
    const response = await OwnersService.findOwnerByInn(ownerInn.value);
    const owner = response.data?.[0];

    if (!owner) return;

    ownerData.value = owner;
    productOwnerId.value = owner.id;
  } catch (error) {
    console.error("Ошибка поиска владельца по ИНН:", error);
  } finally {
    ownerLoading.value = false;
  }
}

async function sendProductsToServer() {
  if (!productOwnerId.value) {
    snackbarMessage.value = 'Сначала выберите владельца'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  const payload = tableData.value.map(item => ({
  name: item.name,
  tnved_code: item.hsCode,
  weight: Number(item.weight) || 0,
  quantity: Number(item.qty) || 0,
  price: Number(item.price) || 0,
  currency: 'USD',
  dvh_number: item.dvh_number,

  product_ownerId: productOwnerId.value,

  operator_who_registered: localStorage.getItem('user_name'),

  arrival_date: new Date().toISOString(),

  warehouseId: Number(Cookies.get('warehouseId')),

  carrier_name: 'Неизвестный перевозчик',
  sender: headerData.value?.sender || 'Неизвестный отправитель', // ✅ FIX
  recipient: headerData.value?.recipient || 'Неизвестный получатель', // ✅
}))

  await ProductService.batchProducts(payload)

  snackbarMessage.value = 'Товары успешно отправлены'
  snackbarColor.value = 'success'
  snackbar.value = true
  isDialogOpen.value = false
}

/* ================== HELPERS ================== */
function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}

onMounted(loadDvhList)
onBeforeUnmount(() => pdfUrl.value && URL.revokeObjectURL(pdfUrl.value))
</script>
