<template>
 <!-- === КНОПКА ДЛЯ ОТКРЫТИЯ МОДАЛКИ === -->
 <v-btn color="primary" @click="openModal">
   Загрузить товары через PDF
 </v-btn>

 <!-- === FULLSCREEN МОДАЛКА PDF === -->
 <v-dialog
   v-model="showPdfModal"
   fullscreen
   scrollable
   transition="dialog-bottom-transition"
 >
   <v-card>
     <v-toolbar density="compact">
       <v-toolbar-title>Загрузка товаров через PDF</v-toolbar-title>
       <v-spacer />
       <v-btn icon="mdi-close" variant="text" @click="showPdfModal = false" />
     </v-toolbar>

     <v-card-text class="pa-0" style="height: 90vh; overflow: hidden;">
       <div class="d-flex" style="height: 100%; width: 100%;">

         <!-- === LEFT: PDF VIEWER === -->
         <div
           style="
             flex: 1.6;
             border-right: 1px solid #e0e0e0;
             display: flex;
             flex-direction: column;
             min-width: 0;
           "
         >
           <div class="pa-3">
             <v-file-input
               accept="application/pdf"
               label="Выберите PDF"
               prepend-icon="mdi-file-pdf-box"
               @change="handleFileUpload"
               :loading="isLoading"
             />
             <div class="text-red" v-if="error">{{ error }}</div>
           </div>

           <div style="flex: 1; overflow-y: auto; padding: 10px;">
            <client-only>
             <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" />
        
             <div v-else class="text-grey text-center mt-10 text-h6">
               Загрузите PDF файл
             </div>
            </client-only>
           </div>
         </div>

         <!-- === RIGHT: V-DATA-TABLE === -->
         <div
           style="
             flex: 1;
             padding: 20px;
             display: flex;
             flex-direction: column;
             min-width: 0;
           "
         >
           <h3 class="mb-3">Результат обработки</h3>

           <div class="mb-4">
  <v-text-field
    v-model="headerData.registrationNumber"
    label="Регистрационный номер"
    dense
    variant="outlined"
    class="mb-2"
  />

  <v-text-field
    v-model="headerData.dvhDate"
    label="Дата"
    dense
    variant="outlined"
    class="mb-2"
  />

  <v-text-field
    v-model="headerData.sender"
    label="Отправитель"
    dense
    variant="outlined"
    class="mb-2"
  />

  <v-text-field
    v-model="headerData.receiver"
    label="Получатель"
    dense
    variant="outlined"
  />
</div>

           <v-btn color="success" class="mb-3" @click="openAddProductModal">
             ➕ Добавить товар вручную
           </v-btn>

           <v-data-table
             v-if="tableData.length"
             :items="tableData"
             :headers="headers"
             density="compact"
             style="flex: 1; overflow-y: auto;"
           >
             <template #item="props">
               <tr>
                 <td v-for="header in headers" :key="header.key" class="px-2 py-1">
                   <v-edit-dialog
                     :return-value.sync="props.item[header.key]"
                     @save="value => updateValue(props.index, header.key, value)"
                   >
                     {{ props.item[header.key] }}
                     <template #input>
                       <v-text-field
                         v-model="props.item[header.key]"
                         density="compact"
                         variant="outlined"
                         hide-details
                       />
                     </template>
                   </v-edit-dialog>
                 </td>
               </tr>
             </template>

             <template #no-data>
               <div class="text-grey text-center my-10">
                 Результаты появятся после обработки PDF
               </div>
             </template>
           </v-data-table>
           <v-card-actions>
       <v-spacer />
       <v-btn variant="tonal" @click="showPdfModal = false">Отменить действие</v-btn>
       <v-btn color="success" @click="addProductFromModal">Сохранить товары в системе</v-btn>
     </v-card-actions>
         </div>
       </div>
     </v-card-text>
   </v-card>
 </v-dialog>

 <!-- === МОДАЛКА ДОБАВЛЕНИЯ ТОВАРА === -->
 <v-dialog v-model="showAddModal" max-width="420px">
   <v-card>
     <v-card-title class="text-h6">Добавить товар вручную</v-card-title>
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
       <v-btn variant="tonal" @click="showAddModal = false">Отмена</v-btn>
       <v-btn color="success" @click="addProductFromModal">Добавить</v-btn>
     </v-card-actions>
   </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useProductsStore } from '~/stores/products'

const VuePdfEmbed = defineAsyncComponent({
  loader: () => import('vue-pdf-embed'),
  ssr: false
})

const productsStore = useProductsStore()

const showPdfModal = ref(false)
const pdfUrl = ref(null)
const isLoading = ref(false)
const error = ref(null)

const tableData = ref([])
const headerData = ref({})

const showAddModal = ref(false)
const newProduct = reactive({
  hsCode: '',
  name: '',
  weight: '',
  qty: '',
  price: '',
  currency: ''
})

const headers = [
  { title: 'Код ТНВЭД', key: 'Код ТНВЭД' },
  { title: 'Наименование товара', key: 'Наименование товара' },
  { title: 'Вес брутто (кг)', key: 'Вес брутто (кг)' },
  { title: 'Кол-во ДЕИ', key: 'Кол-во ДЕИ' },
  { title: 'Цена товара', key: 'Цена товара' },
  { title: 'Валюта', key: 'Валюта' }
]

const emit = defineEmits(['loaded'])

const openModal = () => {
  showPdfModal.value = true
}

// Метод загрузки PDF
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

    if (!response.ok) throw new Error(`Ошибка ${response.status}`)
    const data = await response.json()

    if (data?.result?.products && Array.isArray(data.result.products)) {
      tableData.value = data.result.products.map(p => ({
        'Код ТНВЭД': p.hsCode || '',
        'Наименование товара': p.name || '',
        'Вес брутто (кг)': p.weight ?? '',
        'Кол-во ДЕИ': p.qty ?? '',
        'Цена товара': p.price ?? '',
        'Валюта': p.currency || ''
      }))

      headerData.value = {
        registrationNumber: data.result.header?.registrationNumber || '',
        dvhDate: data.result.header?.dvhDate || '',
        sender: data.result.header?.sender || '',
        receiver: data.result.header?.receiver || ''
      }

      emit('loaded', tableData.value)
    } else {
      tableData.value = []
      error.value = 'Не удалось получить список товаров'
    }
  } catch (err) {
    error.value = 'Не удалось обработать PDF файл'
  } finally {
    isLoading.value = false
  }
}

// Обновление значения в таблице
const updateValue = (rowIndex: number, key: string, value: any) => {
  tableData.value[rowIndex][key] = value
}

// Модалка добавления одного товара
const openAddProductModal = () => {
  Object.assign(newProduct, {
    hsCode: '',
    name: '',
    weight: '',
    qty: '',
    price: '',
    currency: ''
  })
  showAddModal.value = true
}

const addProductFromModal = () => {
  tableData.value.push({
    'Код ТНВЭД': newProduct.hsCode,
    'Наименование товара': newProduct.name,
    'Вес брутто (кг)': newProduct.weight,
    'Кол-во ДЕИ': newProduct.qty,
    'Цена товара': newProduct.price,
    'Валюта': newProduct.currency
  })
  showAddModal.value = false
}

// Новый метод: добавление всех товаров из PDF в систему через batch
const addAllProductsToSystem = async () => {
  if (!tableData.value.length) return

  isLoading.value = true
  error.value = null

  const mapped = tableData.value.map((p: any) => ({
    name: p['Наименование товара'],
    tnved_code: p['Код ТНВЭД'],
    weight: Number(p['Вес брутто (кг)'] ?? 0),
    quantity: Number(p['Кол-во ДЕИ'] ?? 0),
    price: Number(p['Цена товара'] ?? 0),
    currency: p['Валюта'] || 'USD',

    dvh_number: headerData.value.registrationNumber || '',
    product_owner: headerData.value.sender || '',
    released: false,
    operator_who_registered: 'Operator1',
    operator_who_released: 'Operator2',
    deleted: false,
    declaration_number: headerData.value.registrationNumber || '',
    transit_declaration_number: 'TRANSIT123',
    arrival_date: headerData.value.dvhDate
      ? new Date(headerData.value.dvhDate).toISOString()
      : null,
    departure_date: null,
    count_of_days_in_storage: 0,
    price_for_storage: 0,
    warehouseId: 1
  }))

  try {
    await productsStore.addProductsBatch(mapped)
    showPdfModal.value = false
  } catch (err) {
    console.error('Ошибка при добавлении товаров', err)
    error.value = 'Не удалось сохранить товары в системе'
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>
<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useProductsStore } from '~/stores/products'

const VuePdfEmbed = defineAsyncComponent({
  loader: () => import('vue-pdf-embed'),
  ssr: false
})

const productsStore = useProductsStore()

const showPdfModal = ref(false)
const pdfUrl = ref(null)
const isLoading = ref(false)
const error = ref(null)

const tableData = ref([])
const headerData = ref({})

const showAddModal = ref(false)
const newProduct = reactive({
  hsCode: '',
  name: '',
  weight: '',
  qty: '',
  price: '',
  currency: ''
})

const headers = [
  { title: 'Код ТНВЭД', key: 'Код ТНВЭД' },
  { title: 'Наименование товара', key: 'Наименование товара' },
  { title: 'Вес брутто (кг)', key: 'Вес брутто (кг)' },
  { title: 'Кол-во ДЕИ', key: 'Кол-во ДЕИ' },
  { title: 'Цена товара', key: 'Цена товара' },
  { title: 'Валюта', key: 'Валюта' }
]

const emit = defineEmits(['loaded'])

const openModal = () => {
  showPdfModal.value = true
}

// Метод загрузки PDF
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

    if (!response.ok) throw new Error(`Ошибка ${response.status}`)
    const data = await response.json()

    if (data?.result?.products && Array.isArray(data.result.products)) {
      tableData.value = data.result.products.map(p => ({
        'Код ТНВЭД': p.hsCode || '',
        'Наименование товара': p.name || '',
        'Вес брутто (кг)': p.weight ?? '',
        'Кол-во ДЕИ': p.qty ?? '',
        'Цена товара': p.price ?? '',
        'Валюта': p.currency || ''
      }))

      headerData.value = {
        registrationNumber: data.result.header?.registrationNumber || '',
        dvhDate: data.result.header?.dvhDate || '',
        sender: data.result.header?.sender || '',
        receiver: data.result.header?.receiver || ''
      }

      emit('loaded', tableData.value)
    } else {
      tableData.value = []
      error.value = 'Не удалось получить список товаров'
    }
  } catch (err) {
    error.value = 'Не удалось обработать PDF файл'
  } finally {
    isLoading.value = false
  }
}

// Обновление значения в таблице
const updateValue = (rowIndex: number, key: string, value: any) => {
  tableData.value[rowIndex][key] = value
}

// Модалка добавления одного товара
const openAddProductModal = () => {
  Object.assign(newProduct, {
    hsCode: '',
    name: '',
    weight: '',
    qty: '',
    price: '',
    currency: ''
  })
  showAddModal.value = true
}

const addProductFromModal = () => {
  tableData.value.push({
    'Код ТНВЭД': newProduct.hsCode,
    'Наименование товара': newProduct.name,
    'Вес брутто (кг)': newProduct.weight,
    'Кол-во ДЕИ': newProduct.qty,
    'Цена товара': newProduct.price,
    'Валюта': newProduct.currency
  })
  showAddModal.value = false
}

// Новый метод: добавление всех товаров из PDF в систему через batch
const addAllProductsToSystem = async () => {
  if (!tableData.value.length) return

  isLoading.value = true
  error.value = null

  const mapped = tableData.value.map((p: any) => ({
    name: p['Наименование товара'],
    tnved_code: p['Код ТНВЭД'],
    weight: Number(p['Вес брутто (кг)'] ?? 0),
    quantity: Number(p['Кол-во ДЕИ'] ?? 0),
    price: Number(p['Цена товара'] ?? 0),
    currency: p['Валюта'] || 'USD',

    dvh_number: headerData.value.registrationNumber || '',
    product_owner: headerData.value.sender || '',
    released: false,
    operator_who_registered: 'Operator1',
    operator_who_released: 'Operator2',
    deleted: false,
    declaration_number: headerData.value.registrationNumber || '',
    transit_declaration_number: 'TRANSIT123',
    arrival_date: headerData.value.dvhDate
      ? new Date(headerData.value.dvhDate).toISOString()
      : null,
    departure_date: null,
    count_of_days_in_storage: 0,
    price_for_storage: 0,
    warehouseId: 1
  }))

  try {
    await productsStore.addProductsBatch(mapped)
    showPdfModal.value = false
  } catch (err) {
    console.error('Ошибка при добавлении товаров', err)
    error.value = 'Не удалось сохранить товары в системе'
  } finally {
    isLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>

