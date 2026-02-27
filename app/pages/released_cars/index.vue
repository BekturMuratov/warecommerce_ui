<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import { ref, watch, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import type { DvhListItem } from '~/types/products'
import CarsService from '@/services/CarsService'

const { smAndDown } = useDisplay()

const VuePdfEmbed = defineAsyncComponent(() =>
  import('vue-pdf-embed')
)

/* ================= TABLE HEADERS ================= */

const dvhHeaders = [
  { title: 'Номер ДВХ', value: 'dvh_number' },
  { title: 'Дата въезда', value: 'arrival_date' },
  { title: 'Дата выезда', value: 'departure_date' },
  { title: 'Оператор', value: 'operator_who_registered' },
  { title: 'Владелец', value: 'product_owner' },
]

/* ================= UTILS ================= */

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

/* ================= STATE ================= */

const today = formatDate(new Date())

const dvhList = ref<DvhListItem[]>([])
const pagination = ref({ currentPage: 1, pageSize: 10, totalItems: 0 })
const loading = ref(false)

const startDate = ref(today)
const endDate = ref(today)

const isDialogOpen = ref(false)

const pdfUrl = ref<string | null>(null)
const isPdfLoading = ref(false)
const pdfError = ref<string | null>(null)
const tableData = ref<any[]>([])
const headerData = ref<any>({})

/* ================= API ================= */

async function loadDvhList() {
  loading.value = true
  try {
    const data: any = await CarsService.getReleasedDvhList({
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

/* ================= PDF ================= */

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || file.type !== 'application/pdf') {
    pdfError.value = 'Загрузите PDF файл'
    return
  }

  pdfUrl.value = URL.createObjectURL(file)

  const formData = new FormData()
  formData.append('file', file)

  isPdfLoading.value = true
  pdfError.value = null

  try {
    const res = await fetch('http://localhost:4200/upload', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    tableData.value = data?.result?.products || []
    headerData.value = data?.result?.header || {}

  } catch {
    pdfError.value = 'Ошибка обработки PDF'
  } finally {
    isPdfLoading.value = false
  }
}

/* ================= SEND ================= */

const sendProductsToServer = async () => {
  if (!tableData.value.length) {
    alert('Нет данных для отправки')
    return
  }

  try {
    const payload = tableData.value.map(item => ({
      name: item.name,
      tnved_code: item.hsCode,
      weight: Number(item.weight) || 0,
      quantity: Number(item.qty) || 0,
      price: Number(item.price) || 0,
      currency: item.currency || 'USD',
      dvh_number: item.dvh_number,
      product_owner: headerData.value.receiver,
      released: false,
      operator_who_registered: 'Operator1',
      warehouseId: 1
    }))

    await fetch('http://localhost:5000/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    alert('Товары успешно отправлены!')
  } catch {
    alert('Ошибка отправки товаров')
  }
}

/* ================= EFFECTS ================= */

watch(
  [() => pagination.value.currentPage, () => pagination.value.pageSize],
  loadDvhList
)

onMounted(loadDvhList)

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>

<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Список Выпущенных Товаров
      </v-card-title>

      <!-- FILTERS -->
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="startDate"
              type="date"
              label="Начало периода"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="endDate"
              type="date"
              label="Конец периода"
            />
          </v-col>

          <v-col cols="12">
            <v-btn
              color="primary"
              block
              @click="loadDvhList"
            >
              Применить
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
      >
        <template #item.dvh_number="{ item }">
          <NuxtLink :to="`/released_cars/${item.dvh_number}`">
            {{ item.dvh_number }}
          </NuxtLink>
        </template>

        <template #item.arrival_date="{ item }">
          {{ formatDateTime(item.arrival_date) }}
        </template>

        <template #item.departure_date="{ item }">
          {{ formatDateTime(item.departure_date) }}
        </template>
      </v-data-table>

      <!-- MOBILE CARDS -->
      <div v-else class="pa-2">
        <v-card
          v-for="item in dvhList"
          :key="item.dvh_number"
          class="mb-3"
          variant="outlined"
        >
          <v-card-text>
            <div class="mobile-row">

              <span class="label">Номер ДВХ</span>
              <NuxtLink :to="`/released_cars/${item.dvh_number}`">
                {{ item.dvh_number }}
              </NuxtLink>

              <span class="label">Дата въезда</span>
              <span>{{ formatDateTime(item.arrival_date) }}</span>

              <span class="label">Дата выезда</span>
              <span>{{ formatDateTime(item.departure_date) }}</span>

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

                <v-alert v-if="isPdfLoading" type="info">
                  Обработка PDF…
                </v-alert>

                <v-alert v-if="pdfError" type="error">
                  {{ pdfError }}
                </v-alert>
              </v-col>

              <v-col cols="12" md="6">
                <h3 class="mb-3">Результат</h3>

                <!-- MOBILE -->
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

                <!-- DESKTOP -->
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
                  v-if="tableData.length"
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

.pdf-viewer {
  max-height: 70vh;
  overflow: auto;
}
</style>