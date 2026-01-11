<template>
 <v-container>
   <v-card>
     <v-card-title>Товары для DVH: {{ route.params.dvh_number }}</v-card-title>

     <v-card-text>
      <v-btn
          color="primary"
          @click="generatePDF"
          class="mb-4"
        >
          Сформировать PDF (Акт приема)
        </v-btn>
        <v-btn
  color="success"
  class="mb-4 ml-2"
  @click="releaseDialog = true"
>
  Выпуск
</v-btn>

<v-dialog v-model="releaseDialog" max-width="900px">
  <v-card>
    <v-card-title>
      Выпуск товаров
      <v-spacer />
      <v-btn icon @click="releaseDialog = false">✕</v-btn>
    </v-card-title>

    <v-card-text>
      <v-form ref="releaseForm">
        <!-- Тариф -->
        <v-select
          v-model="selectedTariff"
          :items="tariffs"
          item-title="name"
          item-value="id"
          label="Тариф"
          class="mb-3"
          required
        />

        <!-- Декларация -->
        <v-text-field
          v-model="declarationNumber"
          label="Номер декларации"
          class="mb-4"
          required
        />

        <!-- Таблица товаров -->
        <v-table class="elevation-1">
          <thead>
            <tr>
              <th width="50">
                <v-checkbox
                  :model-value="isAllSelected"
                  @update:model-value="toggleSelectAll"
                />
              </th>
              <th>ID</th>
              <th>Наименование</th>
              <th>Вес</th>
              <th>Кол-во</th>
              <th>Дата прибытия</th>
              <th>Дата убытия</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <v-checkbox
                  :model-value="selectedProducts.includes(product.id)"
                  @update:model-value="toggleProduct(product.id)"
                />
              </td>
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.weight }}</td>
              <td>{{ product.quantity }}</td>
              <td>{{ formatDate(product.arrival_date) }}</td>
              <td>{{ product.departure_date ? formatDate(product.departure_date) : '-' }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="submitRelease">
        Выпустить
      </v-btn>
      <v-btn variant="text" @click="releaseDialog = false">
        Отмена
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

       <v-data-table
         :items="products"
         :loading="loading"
         class="elevation-1"
         :items-per-page="10"
       >
         <template #headers>
           <tr>
             <th>ID</th>
             <th>Наименование</th>
             <th>TNVED</th>
             <th>Вес</th>
             <th>Количество</th>
             <th>Цена</th>
             <th>Валюта</th>
             <th>Владелец</th>
             <th>Дата прибытия</th>
             <th>Дата убытия</th>
             <th>Склад</th>
           </tr>
         </template>

         <template #item="{ item }">
           <tr>
             <td>{{ item.id }}</td>
             <td>{{ item.name }}</td>
             <td>{{ item.tnved_code }}</td>
             <td>{{ item.weight }}</td>
             <td>{{ item.quantity }}</td>
             <td>{{ item.price }}</td>
             <td>{{ item.currency }}</td>
             <td>{{ item.product_owner }}</td>
             <td>{{ new Date(item.arrival_date).toLocaleDateString() }}</td>
             <td>{{ item.departure_date ? new Date(item.departure_date).toLocaleDateString() : '-' }}</td>
             <td>{{ item.warehouseId }}</td>
           </tr>
         </template>
       </v-data-table>
     </v-card-text>
      <!-- МОДАЛКА PDF -->
    <v-dialog v-model="pdfDialog" width="80%">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>PDF акт приема</span>
          <v-btn icon="" @click="pdfDialog = false">
            ✕
          </v-btn>
        </v-card-title>

        <v-card-text style="height: 80vh">
          <embed
            v-if="pdfUrl"
            :src="pdfUrl"
            type="application/pdf"
            style="width: 100%; height: 100%;"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
   </v-card>
 </v-container>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import ProductService from '../../services/ProductServices.js'
  import TariffsService from '../../services/TariffService.js'
  import type { Product } from '~/types/products'
  import type { Tariff } from '~/types/tariff'
  
  const route = useRoute()
  const products = ref<Product[]>([])
  const loading = ref(false)
  
  // PDF modal state
  const pdfDialog = ref(false)
  const pdfUrl = ref('')
  
  // Release modal state
  const releaseDialog = ref(false)
  const selectedProducts = ref<number[]>([])
  const selectedTariff = ref<number | null>(null)
  const declarationNumber = ref('')
  const releaseDialog = ref(false)
const selectedProducts = ref([])
const selectedTariff = ref(null)
const declarationNumber = ref('')

const isAllSelected = computed(() => {
  return products.value.length > 0 &&
    selectedProducts.value.length === products.value.length
})

function toggleProduct(id) {
  if (selectedProducts.value.includes(id)) {
    selectedProducts.value = selectedProducts.value.filter(p => p !== id)
  } else {
    selectedProducts.value.push(id)
  }
}

function toggleSelectAll(value) {
  if (value) {
    selectedProducts.value = products.value.map(p => p.id)
  } else {
    selectedProducts.value = []
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
  
  // Загружаем товары
  async function loadProducts() {
    loading.value = true
    try {
      const dvh_number = route.params.dvh_number as string
      const data: Product[] = await ProductService.getDvhDetail(dvh_number)
      products.value = data
    } catch (err) {
      console.error('Ошибка загрузки продуктов:', err)
    } finally {
      loading.value = false
    }
  }


  // Загружаем тарифы для выбора
  const tariffs = ref<Tariff[]>([])
  async function loadTariffs() {
    try {
      tariffs.value = await TariffsService.getAll(1) // или getTariffsForWarehouse(warehouseId)
    } catch (err) {
      console.error("Ошибка загрузки тарифов:", err)
    }
  }
  
  // Submit release
  async function submitRelease() {
    if (!selectedTariff.value || !declarationNumber.value || selectedProducts.value.length === 0) {
      alert("Заполните все поля и выберите товары")
      return
    }
  
    try {
      const payload = {
        tariffId: selectedTariff.value,
        declarationNumber: declarationNumber.value,
        productIds: selectedProducts.value,
      }
  
      await ProductService.releaseProducts(payload)
      alert("Товары успешно выпущены!")
      releaseDialog.value = false
  
      // Перезагружаем товары
      await loadProducts()
      selectedProducts.value = []
      selectedTariff.value = null
      declarationNumber.value = ''
    } catch (err) {
      console.error("Ошибка выпуска товаров:", err)
      alert("Ошибка выпуска товаров")
    }
  }
  
  // Data table headers для чекбоксов
  const releaseHeaders = [
    { title: 'ID', key: 'id' },
    { title: 'Наименование', key: 'name' },
    { title: 'Вес', key: 'weight' },
    { title: 'Кол-во', key: 'quantity' },
    { title: 'Дата прибытия', key: 'arrival_date' },
    { title: 'Дата убытия', key: 'departure_date' },
  ]
  async function generatePDF() {
    try {
        const dvh_number = route.params.dvh_number as string
        const response = await ProductService.generatePdf(dvh_number) 
        console.log("PDF byteLength:", response.data.byteLength) 
        const pdfBlob = new Blob([response.data], {
            type: "application/pdf"
        }) 
        pdfUrl.value = URL.createObjectURL(pdfBlob) 
        pdfDialog.value = true 
        console.log("PDF Size:", response.data.byteLength)
    } catch (err) {
        console.error("Ошибка генерации PDF:", err)
    }
}
  onMounted(() => {
    loadProducts()
    loadTariffs()
  })
  </script>
  