<script setup lang="ts">
  import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue'
  import ProductService from '@/services/ProductServices.js'
  import type { DvhListItem } from '~/types/products'
  
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
      const data: any = await ProductService.getDvhList({
        pageNumber: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        startDate: startDate.value,
        endDate: endDate.value
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
  onMounted(loadDvhList)
  onBeforeUnmount(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  })

  
onMounted(async () => {
  if (process.client) {
    const module = await import('vue-pdf-embed')
    VuePdfEmbed = module.default
  }
})
  </script>
  
  <template>
    <v-container fluid>
      <v-card>
        <v-card-title>Список DVH</v-card-title>
  
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
        />
  
        <!-- ===== PDF DIALOG ===== -->
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
        <v-col cols="6" class="pa-4">
          <v-file-input
            accept=".pdf"
            label="Загрузить PDF"
            @change="handleFileUpload"
          />

          <v-alert v-if="isPdfLoading" type="info">Обработка PDF…</v-alert>
          <v-alert v-if="pdfError" type="error">{{ pdfError }}</v-alert>

          <ClientOnly>
            <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" />
          </ClientOnly>
        </v-col>

        <!-- Таблица результатов -->
        <v-col cols="6" class="pa-4">
          <h3>Результат обработки</h3>

          <v-alert v-if="!tableData.length && !isPdfLoading" type="info" variant="tonal">
            Данные появятся после обработки
          </v-alert>

          <v-data-table
            v-else
            :items="tableData"
            :headers="[
              { text: 'Код ТНВЭД', value: 'hsCode' },
              { text: 'Наименование', value: 'name' },
              { text: 'Вес (кг)', value: 'weight' },
              { text: 'Кол-во', value: 'qty' },
              { text: 'Цена', value: 'price' }
            ]"
            class="elevation-1"
            dense
            hover
            :items-per-page="5"
          >
            <template #item.hsCode="{ item }">
              <span class="font-medium">{{ item.hsCode }}</span>
            </template>

            <template #item.name="{ item }">
              <span>{{ item.name }}</span>
            </template>

            <template #item.weight="{ item }">
              <span>{{ item.weight }}</span>
            </template>

            <template #item.qty="{ item }">
              <span>{{ item.qty }}</span>
            </template>

            <template #item.price="{ item }">
              <span>{{ item.price }}</span>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</v-dialog>
      </v-card>
    </v-container>
  </template>
  