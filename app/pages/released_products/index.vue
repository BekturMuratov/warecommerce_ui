<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
  import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue'
  import ProductService from '@/services/ProductServices.js'
  import type { DvhListItem } from '~/types/products'

  const VuePdfEmbed = defineAsyncComponent(() =>
  import('vue-pdf-embed')
)
  
const dvhHeaders = [
  { title: 'Номер ДВХ', value: 'dvh_number' },
  { title: 'Дата вьезда', value: 'arrival_date' },
  { title: 'Дата выезда', value: 'departure_date' },
  { title: 'Оператор', value: 'operator_who_registered' },
  { title: 'Владелец', value: 'product_owner' },
]
  // ===== Utils =====
  function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // ===== DVH LIST STATE =====
  const today = formatDate(new Date())
  const dvhList = ref<any[]>([])
  const pagination = ref({ currentPage: 1, pageSize: 10, totalItems: 0 })
  const loading = ref(false)
  
  const startDate = ref(today)
  const endDate = ref(today)
  
  // ===== MODAL =====
  const isDialogOpen = ref(false)
  
  // ===== PDF STATE =====
  const pdfUrl = ref<string | null>(null)
  const isPdfLoading = ref(false)
  const pdfError = ref<string | null>(null)
  const tableData = ref<any[]>([])
  const headerData = ref<any>({})
  
  // ===== API =====
  async function loadDvhList() {
    loading.value = true
    try {
      const data: any = await ProductService.getReleasedDvhList({
        pageNumber: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        startDate: startDate.value  + "T00:00:00Z",
        endDate: endDate.value  + "T23:59:59Z"
      })
      dvhList.value = data.data
      pagination.value.totalItems = data.pagination.totalItems
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  
  // ===== PDF HANDLERS =====
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
      console.log('headerdata: ', headerData.value)
    } catch {
      pdfError.value = 'Ошибка обработки PDF'
    } finally {
      isPdfLoading.value = false
    }
  }
  
  // ===== EFFECTS =====
  watch(
    [() => pagination.value.currentPage, () => pagination.value.pageSize],
    loadDvhList
  )
const sendProductsToServer = async () => {
  if (!tableData.value.length) {
    alert('Нет данных для отправки')
    return
  }

  try {
    // Преобразуем каждый объект PDF в формат API
    const payload = tableData.value.map(item => ({
      name: item.name,
      tnved_code: item.hsCode,
      weight: Number(item.weight) || 0,
      quantity: Number(item.qty) || 0,
      price: Number(item.price) || 0,
      currency: item.currency || 'USD',
      dvh_number: item.dvh_number, // можно динамически взять, если есть
      product_owner: headerData.value.receiver, // можно динамически
      released: false,
      operator_who_registered: 'Operator1',
      operator_who_released: null,
      deleted: false,
      declaration_number: 'DEC123',
      transit_declaration_number: 'TRANSIT123',
      arrival_date: new Date().toISOString(),
      departure_date: null,
      count_of_days_in_storage: 0,
      price_for_storage: 0,
      warehouseId: 1
    }))

    const response = await fetch('http://localhost:5000/products/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error(`Ошибка ${response.status}`)
    const data = await response.json()
    console.log('Сервер вернул:', data)
    alert('Товары успешно отправлены!')
  } catch (err) {
    console.error('Ошибка отправки на сервер:', err)
    alert('Ошибка отправки товаров на сервер')
  }
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
  onMounted(loadDvhList)
  
  onBeforeUnmount(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  })
  </script>
  
  <template>
    <v-container fluid>
      <v-card>
        <v-card-title>Список Выпущенных Товаров</v-card-title>
  
        <!-- Filters -->
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="startDate" type="date" label="Начало периода" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="endDate" type="date" label="Конец периода" />
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" block @click="loadDvhList">Применить</v-btn>
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
    <!-- Колонка dvh_number как ссылка -->
    <template v-slot:item.dvh_number="{ item }">
      <NuxtLink :to="`/released_products/${item.dvh_number}`">
        {{ item.dvh_number }}
      </NuxtLink>
    </template>

      <!-- Форматируем дату въезда -->
  <template v-slot:item.arrival_date="{ item }">
    {{ formatDateTime(item.arrival_date) }}
  </template>

  <!-- Форматируем дату выезда -->
  <template v-slot:item.departure_date="{ item }">
    {{ formatDateTime(item.departure_date) }}
  </template>
  </v-data-table>
        <!-- ===== PDF DIALOG ===== -->
        <v-dialog v-model="isDialogOpen" fullscreen>
          <v-card>
            <v-toolbar color="primary" dark>
              <v-toolbar-title>Обработка PDF</v-toolbar-title>
              <v-spacer />
              <v-btn icon @click="isDialogOpen = false">
                ✕
              </v-btn>
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
                  <v-alert v-if="isPdfLoading" type="info">Обработка PDF…</v-alert>
                  <v-alert v-if="pdfError" type="error">{{ pdfError }}</v-alert>
  
                </v-col>
  
                <!-- Result -->
                <v-col cols="6" class="pa-4">
                  <h3>Результат</h3>
  
                  <v-alert
                    v-if="!tableData.length"
                    type="info"
                    variant="tonal"
                  >
                    Данные появятся после обработки
                  </v-alert>
  
                  <v-table v-else>
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
                  <v-btn color="primary" @click="sendProductsToServer">
  Отправить на сервер
</v-btn>                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card>
    </v-container>
  </template>
  