  <template>
    <v-container fluid>
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top right>
  {{ snackbarMessage }}
</v-snackbar>
      <v-card>
        <v-card-title>Список зарегистрированных АТС</v-card-title>
  
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
  <!-- DVH как ссылка -->
  <template v-slot:item.dvh_number="{ item }">
    <NuxtLink :to="`/cars/${item.dvh_number}`">
      {{ item.dvh_number }}
    </NuxtLink>
  </template>

  <!-- Форматируем arrival_date -->
  <template v-slot:item.arrival_date="{ item }">
    {{ formatDateTime(item.arrival_date) }}
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
                  <!-- Спиннер при обработке -->
                </v-col>
                <!-- Result -->
                <v-col cols="6" class="pa-4">
                   <div v-if="isPdfLoading" class="d-flex align-center">
    <v-progress-circular
      indeterminate
      color="primary"
      size="36"
      class="mr-2"
    ></v-progress-circular>
      <v-alert v-if="pdfError" type="error">{{ pdfError }}</v-alert>

    <span>Обработка PDF…</span>
  </div>
                  <h3>Результат</h3>
  
                  <v-alert
                    v-if="!tableData.length"
                    type="info"
                    variant="tonal"
                  >
                    Данные появятся после обработки
                  </v-alert>
  <v-text-field
  v-model="ownerInn"
  label="ИНН владельца"
  placeholder="118051994055221"
/>


<v-btn
  color="primary"
  :loading="ownerLoading"
  @click="findOwnerByInn"
>
  Найти владельца
</v-btn>

<v-alert
  v-if="ownerData"
  type="success"
  class="mt-2 my-2"
>
  Владелец найден: {{ ownerData.name }}
</v-alert>

<v-text-field
v-model="carrier_name"
class="my-2"
label="Введите имя или компанию перевозчика"
placeholder="Введите имя или компанию перевозчика"
/>

<v-text-field
v-model="vin_code"
label="Введите VIN авто"
placeholder="Введите VIN авто"
/>

<v-alert
  v-if="ownerError"
  type="error"
  class="mt-2"
>
  {{ ownerError }}
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
  <script setup lang="ts">
  definePageMeta({
  middleware: 'auth'
})
import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue'
import ProductService from '@/services/ProductServices.js'
import type { DvhListItem } from '~/types/products'
import Cookies from 'js-cookie';
import CarsService from '~/services/CarsService';
import PDFService from '~/services/PDFService';

  const VuePdfEmbed = defineAsyncComponent(() =>
  import('vue-pdf-embed')
)
const dvhHeaders = [
  { title: 'Номер ДВХ', value: 'dvh_number' },
  { title: 'Дата создания', value: 'arrival_date' },
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
  const dvhList = ref<DvhListItem[]>([])
  const pagination = ref({ currentPage: 1, pageSize: 10, totalItems: 0 })
  const loading = ref(false)
  
  const startDate = ref(today)
  const endDate = ref(today)
  
  // ===== MODAL =====
  const isDialogOpen = ref(false)
  const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')
  
  // ===== PDF STATE =====
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
const vin_code = ref('')
  // ===== API =====
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
      console.log('dvhList: ', dvhList.value)
      pagination.value.totalItems = data.pagination.totalItems
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  
  // ===== PDF HANDLERS =====
  async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // 🔹 освобождаем старый PDF URL
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }

  pdfUrl.value = URL.createObjectURL(file);
  isPdfLoading.value = true;

  try {
    const res = await PDFService.uploadCarPdf(file);

    if (res?.status !== 'ok') {
      throw new Error(res?.message || 'Ошибка обработки PDF');
    }

    tableData.value = Array.isArray(res.result?.products)
      ? res.result.products
      : [];

    headerData.value = res.result?.header || {};
  } catch (error) {
    console.error('Ошибка загрузки PDF:', error);
  } finally {
    isPdfLoading.value = false;
  }
}
  
  // ===== EFFECTS =====
  watch(
    [() => pagination.value.currentPage, () => pagination.value.pageSize],
    loadDvhList
  )
const sendProductsToServer = async () => {
  if (!carOwnerId.value) {
    snackbarMessage.value = 'Сначала найдите владельца по ИНН'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }


  try {
    const payload = {
      name: tableData.value?.[0]?.name,
      tnved_code: tableData.value?.[0]?.hsCode || '',
      guid: generateUUID(),
      weight: Number(tableData.value?.[0]?.weight) || 0,
      price: Number(tableData.value?.[0]?.price) || 0,
      currency: headerData.value?.currency || 'USD',
      dvh_number: headerData.value?.dvh_number,
      car_ownerId: carOwnerId.value,
      car_year: headerData.value?.car_year || '2024',
      released: false,
      operator_who_registered: localStorage.getItem("user_name"),
      operator_who_released: null,
      deleted: false,
      declaration_number: 'DEC123',
      transit_declaration_number: 'TRANSIT123',
      arrival_date: new Date().toISOString(),
      departure_date: null,
      count_of_days_in_storage: 0,
      price_for_storage: 0,
      warehouseId: Number(Cookies.get('warehouse_id')),
      vin_code: vin_code.value,
      type: headerData.value?.type || 'SUV',
      carrier_name: carrier_name.value || 'Неизвестный перевозчик',
      sender: headerData.value?.sender,
      recipient: headerData.value?.receiver
    }

    await CarsService.createCar(payload)

    snackbarMessage.value = 'Автомобиль успешно отправлен'
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
      `http://localhost:5000/owners/find-by-inn?inn=${ownerInn.value}`
    )

    if (!res.ok) throw new Error()

    const data = await res.json()

    // ✅ сервер возвращает массив
    const owner = data?.[0]

    if (!owner?.id) {
      throw new Error('Owner not found')
    }

    ownerData.value = owner
    carOwnerId.value = owner.id
  } catch {
    ownerError.value = 'Владелец не найден'
  } finally {
    ownerLoading.value = false
  }
}
const generateUUID = () =>
  crypto.randomUUID()


  
onMounted(loadDvhList)

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
  </script>