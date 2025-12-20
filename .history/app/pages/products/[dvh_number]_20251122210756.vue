<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductService from '@/services/ProductServices.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const route = useRoute()
const products = ref([])
const loading = ref(false)

async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number
    const data = await ProductService.getDvhDetail(dvh_number)
    products.value = data
  } catch (err) {
    console.error('Ошибка загрузки продуктов:', err)
  } finally {
    loading.value = false
  }
}

// Генерация PDF
function generatePDF() {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  const pageWidth = doc.internal.pageSize.getWidth()

  // Заголовок
  doc.setFontSize(16)
  doc.text('АКТ приема товара', pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.text(`DVH Number: ${route.params.dvh_number}`, 14, 25)
  doc.text(`Принят оператором СВХ: ${products.value[0]?.operator_who_registered || '-'}`, 14, 32)
  
  // Таблица товаров
  const tableColumn = [
    'ID', 'Наименование', 'TNVED', 'Вес', 'Количество', 'Цена', 'Валюта', 'Владелец',
    'Дата прибытия', 'Дата убытия', 'Склад'
  ]

  const tableRows = products.value.map(item => [
    item.id,
    item.name,
    item.tnved_code,
    item.weight,
    item.quantity,
    item.price,
    item.currency,
    item.product_owner,
    new Date(item.arrival_date).toLocaleDateString(),
    new Date(item.departure_date).toLocaleDateString(),
    item.warehouseId
  ])

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
    theme: 'grid'
  })

  // Подписи
  let finalY = (doc as any).lastAutoTable.finalY || 60
  doc.text('Акт передан в двух экземплярах:', 14, finalY + 10)
  doc.text('1. Оператор СВХ', 14, finalY + 17)
  doc.text('2. Владелец товара', 14, finalY + 24)

  doc.save(`ACT_DVH_${route.params.dvh_number}.pdf`)
}

onMounted(loadProducts)
</script>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductService from '@/services/ProductServices.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const route = useRoute()
const products = ref([])
const loading = ref(false)

async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number
    const data = await ProductService.getDvhDetail(dvh_number)
    products.value = data
  } catch (err) {
    console.error('Ошибка загрузки продуктов:', err)
  } finally {
    loading.value = false
  }
}

// Генерация PDF
function generatePDF() {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  const pageWidth = doc.internal.pageSize.getWidth()

  // Заголовок
  doc.setFontSize(16)
  doc.text('АКТ приема товара', pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.text(`DVH Number: ${route.params.dvh_number}`, 14, 25)
  doc.text(`Принят оператором СВХ: ${products.value[0]?.operator_who_registered || '-'}`, 14, 32)
  
  // Таблица товаров
  const tableColumn = [
    'ID', 'Наименование', 'TNVED', 'Вес', 'Количество', 'Цена', 'Валюта', 'Владелец',
    'Дата прибытия', 'Дата убытия', 'Склад'
  ]

  const tableRows = products.value.map(item => [
    item.id,
    item.name,
    item.tnved_code,
    item.weight,
    item.quantity,
    item.price,
    item.currency,
    item.product_owner,
    new Date(item.arrival_date).toLocaleDateString(),
    new Date(item.departure_date).toLocaleDateString(),
    item.warehouseId
  ])

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
    theme: 'grid'
  })

  // Подписи
  let finalY = (doc as any).lastAutoTable.finalY || 60
  doc.text('Акт передан в двух экземплярах:', 14, finalY + 10)
  doc.text('1. Оператор СВХ', 14, finalY + 17)
  doc.text('2. Владелец товара', 14, finalY + 24)

  doc.save(`ACT_DVH_${route.params.dvh_number}.pdf`)
}

onMounted(loadProducts)
</script>


<template>
  <v-container>
    <v-card>
      <v-card-title>Товары для DVH: {{ route.params.dvh_number }}</v-card-title>

      <v-card-text>
       <v-btn color="primary" @click="generatePDF" class="mb-4">
    Сформировать PDF (Акт приема)
  </v-btn>
        <v-data-table
          :items="products"
          :loading="loading"
          class="elevation-1"
          :items-per-page="10"
        >
          <template #headers>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>TNVED</th>
              <th>Weight</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Product Owner</th>
              <th>Released</th>
              <th>Operator Registered</th>
              <th>Operator Released</th>
              <th>Declaration #</th>
              <th>Transit Declaration #</th>
              <th>Arrival Date</th>
              <th>Departure Date</th>
              <th>Days in Storage</th>
              <th>Price for Storage</th>
              <th>Warehouse ID</th>
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
              <td>{{ item.released ? 'Yes' : 'No' }}</td>
              <td>{{ item.operator_who_registered }}</td>
              <td>{{ item.operator_who_released || '-' }}</td>
              <td>{{ item.declaration_number }}</td>
              <td>{{ item.transit_declaration_number }}</td>
              <td>{{ new Date(item.arrival_date).toLocaleDateString() }}</td>
              <td>{{ new Date(item.departure_date).toLocaleDateString() }}</td>
              <td>{{ item.count_of_days_in_storage }}</td>
              <td>{{ item.price_for_storage }}</td>
              <td>{{ item.warehouseId }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>
