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
             <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" />
             <div v-else class="text-grey text-center mt-10 text-h6">
               Загрузите PDF файл
             </div>
           </div>
         </div>

         <!-- === RIGHT: TABLE === -->
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

           <div v-if="headerData.registrationNumber" class="mb-4">
             <p><strong>Регистрационный номер:</strong> {{ headerData.registrationNumber }}</p>
             <p><strong>Дата:</strong> {{ headerData.dvhDate }}</p>
             <p><strong>Отправитель:</strong> {{ headerData.sender }}</p>
             <p><strong>Получатель:</strong> {{ headerData.receiver }}</p>
           </div>

           <v-btn color="success" class="mb-3" @click="openAddProductModal">
             ➕ Добавить товар вручную
           </v-btn>

           <!-- === TABLE === -->
           <div style="flex: 1; overflow-y: auto;">
             <table v-if="tableData.length" class="v-table">
               <thead>
                 <tr>
                   <th>Код ТНВЭД</th>
                   <th>Наименование товара</th>
                   <th>Вес</th>
                   <th>Кол-во</th>
                   <th>Цена</th>
                   <th>Валюта</th>
                 </tr>
               </thead>

               <tbody>
                 <tr v-for="(item, i) in tableData" :key="i">
                   <td contenteditable @input="updateCell(i, 'Код ТНВЭД', $event)">{{ item['Код ТНВЭД'] }}</td>
                   <td contenteditable @input="updateCell(i, 'Наименование товара', $event)">{{ item['Наименование товара'] }}</td>
                   <td contenteditable @input="updateCell(i, 'Вес брутто (кг)', $event)">{{ item['Вес брутто (кг)'] }}</td>
                   <td contenteditable @input="updateCell(i, 'Кол-во ДЕИ', $event)">{{ item['Кол-во ДЕИ'] }}</td>
                   <td contenteditable @input="updateCell(i, 'Цена товара', $event)">{{ item['Цена товара'] }}</td>
                   <td contenteditable @input="updateCell(i, 'Валюта', $event)">{{ item['Валюта'] }}</td>
                 </tr>
               </tbody>
             </table>

             <div v-else class="text-grey text-center mt-10 text-h6">
               Результаты появятся после обработки PDF
             </div>
           </div>
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

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

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

const emit = defineEmits(['loaded'])

const openModal = () => {
 showPdfModal.value = true
}

const handleFileUpload = async (event) => {
 const file = event.target.files[0]
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

const updateCell = (rowIndex, key, event) => {
 tableData.value[rowIndex][key] = event.target.innerText.trim()
}

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

onBeforeUnmount(() => {
 if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>
