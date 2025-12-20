<script setup lang="ts">
  import { ref, reactive, onBeforeUnmount } from 'vue'
  import axios from 'axios'
  import VuePdfEmbed from 'vue-pdf-embed'
  
  // ===== PDF STATE =====
  const pdfUrl = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const tableData = ref<any[]>([])
  const headerData = ref<any>({})
  
  // ===== MODAL =====
  const showModal = ref(false)
  
  // ===== FORM =====
  const newProduct = reactive({
    hsCode: '',
    name: '',
    weight: '',
    qty: '',
    price: '',
    currency: ''
  })
  
  // ===== FILE UPLOAD =====
  const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || file.type !== 'application/pdf') {
      error.value = 'Пожалуйста, загрузите PDF файл'
      return
    }
  
    pdfUrl.value = URL.createObjectURL(file)
  
    const formData = new FormData()
    formData.append('file', file)
  
    isLoading.value = true
    error.value = null
  
    try {
      const response = await fetch('http://localhost:4200/upload', {
        method: 'POST',
        body: formData
      })
  
      const data = await response.json()
  
      tableData.value = data?.result?.products || []
      headerData.value = data?.result?.header || {}
    } catch (e) {
      error.value = 'Ошибка обработки PDF'
    } finally {
      isLoading.value = false
    }
  }
  
  // ===== TABLE EDIT =====
  const updateCell = (index: number, key: string, event: Event) => {
    tableData.value[index][key] = (event.target as HTMLElement).innerText.trim()
  }
  
  // ===== MODAL ACTIONS =====
  const openModal = () => {
    Object.assign(newProduct, {
      hsCode: '',
      name: '',
      weight: '',
      qty: '',
      price: '',
      currency: ''
    })
    showModal.value = true
  }
  
  // ===== SEND TO BACKEND =====
  const sendProductsToServer = async () => {
    if (!tableData.value.length) return
  
    try {
      const payload = tableData.value.map(item => ({
        name: item.name,
        tnved_code: item.hsCode,
        weight: Number(item.weight) || 0,
        quantity: Number(item.qty) || 0,
        price: Number(item.price) || 0,
        currency: item.currency || 'USD',
        dvh_number: headerData.value.registrationNumber || '',
        product_owner: headerData.value.sender || '',
        released: false,
        operator_who_registered: 'Operator1',
        operator_who_released: null,
        deleted: false,
        declaration_number: headerData.value.registrationNumber || '',
        transit_declaration_number: '',
        arrival_date: new Date().toISOString(),
        departure_date: null,
        count_of_days_in_storage: 0,
        price_for_storage: 0,
        warehouseId: 1
      }))
  
      await axios.post('http://localhost:5000/products/batch', payload)
  
      showModal.value = false
      alert('Товары успешно отправлены')
    } catch (e) {
      console.error(e)
      alert('Ошибка отправки')
    }
  }
  
  // ===== CLEANUP =====
  onBeforeUnmount(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  })
  </script>
  
  <template>
    <v-container fluid>
      <v-row>
        <!-- ===== PDF PANEL ===== -->
        <v-col cols="6">
          <v-card height="100%">
            <v-card-title>PDF</v-card-title>
  
            <v-card-text>
              <v-file-input
                accept=".pdf"
                label="Загрузить PDF"
                @change="handleFileUpload"
              />
  
              <v-alert v-if="isLoading" type="info">
                Обработка PDF...
              </v-alert>
  
              <v-alert v-if="error" type="error">
                {{ error }}
              </v-alert>
  
              <ClientOnly>
                <VuePdfEmbed
                  v-if="pdfUrl"
                  :source="pdfUrl"
                />
              </ClientOnly>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- ===== TABLE PANEL ===== -->
        <v-col cols="6">
          <v-card height="100%">
            <v-card-title>
              Результат обработки
            </v-card-title>
  
            <v-card-text>
              <v-btn
                color="primary"
                class="mb-4"
                @click="openModal"
              >
                ➕ Добавить товар
              </v-btn>
  
              <v-data-table
                :items="tableData"
                item-key="hsCode"
                density="compact"
              >
                <template #headers>
                  <tr>
                    <th>Код ТНВЭД</th>
                    <th>Наименование</th>
                    <th>Вес</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Валюта</th>
                  </tr>
                </template>
  
                <template #item="{ item, index }">
                  <tr>
                    <td contenteditable @input="updateCell(index, 'hsCode', $event)">
                      {{ item.hsCode }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'name', $event)">
                      {{ item.name }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'weight', $event)">
                      {{ item.weight }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'qty', $event)">
                      {{ item.qty }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'price', $event)">
                      {{ item.price }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'currency', $event)">
                      {{ item.currency }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- ===== MODAL ===== -->
      <v-dialog v-model="showModal" max-width="500">
        <v-card>
          <v-card-title>Добавить товар</v-card-title>
  
          <v-card-text>
            <v-text-field v-model="newProduct.hsCode" label="Код ТНВЭД" />
            <v-text-field v-model="newProduct.name" label="Наименование" />
            <v-text-field v-model="newProduct.weight" label="Вес" />
            <v-text-field v-model="newProduct.qty" label="Кол-во" />
            <v-text-field v-model="newProduct.price" label="Цена" />
            <v-text-field v-model="newProduct.currency" label="Валюта" />
          </v-card-text>
  
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showModal = false">Отмена</v-btn>
            <v-btn color="success" @click="sendProductsToServer">
              Отправить на сервер
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
<script setup lang="ts">
  import { ref, reactive, onBeforeUnmount } from 'vue'
  import axios from 'axios'
  import VuePdfEmbed from 'vue-pdf-embed'
  
  // ===== PDF STATE =====
  const pdfUrl = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const tableData = ref<any[]>([])
  const headerData = ref<any>({})
  
  // ===== MODAL =====
  const showModal = ref(false)
  
  // ===== FORM =====
  const newProduct = reactive({
    hsCode: '',
    name: '',
    weight: '',
    qty: '',
    price: '',
    currency: ''
  })
  
  // ===== FILE UPLOAD =====
  const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || file.type !== 'application/pdf') {
      error.value = 'Пожалуйста, загрузите PDF файл'
      return
    }
  
    pdfUrl.value = URL.createObjectURL(file)
  
    const formData = new FormData()
    formData.append('file', file)
  
    isLoading.value = true
    error.value = null
  
    try {
      const response = await fetch('http://localhost:4200/upload', {
        method: 'POST',
        body: formData
      })
  
      const data = await response.json()
  
      tableData.value = data?.result?.products || []
      headerData.value = data?.result?.header || {}
    } catch (e) {
      error.value = 'Ошибка обработки PDF'
    } finally {
      isLoading.value = false
    }
  }
  
  // ===== TABLE EDIT =====
  const updateCell = (index: number, key: string, event: Event) => {
    tableData.value[index][key] = (event.target as HTMLElement).innerText.trim()
  }
  
  // ===== MODAL ACTIONS =====
  const openModal = () => {
    Object.assign(newProduct, {
      hsCode: '',
      name: '',
      weight: '',
      qty: '',
      price: '',
      currency: ''
    })
    showModal.value = true
  }
  
  // ===== SEND TO BACKEND =====
  const sendProductsToServer = async () => {
    if (!tableData.value.length) return
  
    try {
      const payload = tableData.value.map(item => ({
        name: item.name,
        tnved_code: item.hsCode,
        weight: Number(item.weight) || 0,
        quantity: Number(item.qty) || 0,
        price: Number(item.price) || 0,
        currency: item.currency || 'USD',
        dvh_number: headerData.value.registrationNumber || '',
        product_owner: headerData.value.sender || '',
        released: false,
        operator_who_registered: 'Operator1',
        operator_who_released: null,
        deleted: false,
        declaration_number: headerData.value.registrationNumber || '',
        transit_declaration_number: '',
        arrival_date: new Date().toISOString(),
        departure_date: null,
        count_of_days_in_storage: 0,
        price_for_storage: 0,
        warehouseId: 1
      }))
  
      await axios.post('http://localhost:5000/products/batch', payload)
  
      showModal.value = false
      alert('Товары успешно отправлены')
    } catch (e) {
      console.error(e)
      alert('Ошибка отправки')
    }
  }
  
  // ===== CLEANUP =====
  onBeforeUnmount(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  })
  </script>
  
  <template>
    <v-container fluid>
      <v-row>
        <!-- ===== PDF PANEL ===== -->
        <v-col cols="6">
          <v-card height="100%">
            <v-card-title>PDF</v-card-title>
  
            <v-card-text>
              <v-file-input
                accept=".pdf"
                label="Загрузить PDF"
                @change="handleFileUpload"
              />
  
              <v-alert v-if="isLoading" type="info">
                Обработка PDF...
              </v-alert>
  
              <v-alert v-if="error" type="error">
                {{ error }}
              </v-alert>
  
              <ClientOnly>
                <VuePdfEmbed
                  v-if="pdfUrl"
                  :source="pdfUrl"
                />
              </ClientOnly>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- ===== TABLE PANEL ===== -->
        <v-col cols="6">
          <v-card height="100%">
            <v-card-title>
              Результат обработки
            </v-card-title>
  
            <v-card-text>
              <v-btn
                color="primary"
                class="mb-4"
                @click="openModal"
              >
                ➕ Добавить товар
              </v-btn>
  
              <v-data-table
                :items="tableData"
                item-key="hsCode"
                density="compact"
              >
                <template #headers>
                  <tr>
                    <th>Код ТНВЭД</th>
                    <th>Наименование</th>
                    <th>Вес</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Валюта</th>
                  </tr>
                </template>
  
                <template #item="{ item, index }">
                  <tr>
                    <td contenteditable @input="updateCell(index, 'hsCode', $event)">
                      {{ item.hsCode }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'name', $event)">
                      {{ item.name }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'weight', $event)">
                      {{ item.weight }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'qty', $event)">
                      {{ item.qty }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'price', $event)">
                      {{ item.price }}
                    </td>
                    <td contenteditable @input="updateCell(index, 'currency', $event)">
                      {{ item.currency }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- ===== MODAL ===== -->
      <v-dialog v-model="showModal" max-width="500">
        <v-card>
          <v-card-title>Добавить товар</v-card-title>
  
          <v-card-text>
            <v-text-field v-model="newProduct.hsCode" label="Код ТНВЭД" />
            <v-text-field v-model="newProduct.name" label="Наименование" />
            <v-text-field v-model="newProduct.weight" label="Вес" />
            <v-text-field v-model="newProduct.qty" label="Кол-во" />
            <v-text-field v-model="newProduct.price" label="Цена" />
            <v-text-field v-model="newProduct.currency" label="Валюта" />
          </v-card-text>
  
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="showModal = false">Отмена</v-btn>
            <v-btn color="success" @click="sendProductsToServer">
              Отправить на сервер
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
    