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
   </v-card>
 </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductService from '@/services/ProductServices.js'
import type { Product } from '~/types/products'
import font from '@/../public/fonts/Roboto-Regular.ttf';

const route = useRoute()
const products = ref<Product[]>([])
const loading = ref(false)

// Загружаем товары для выбранного DVH
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

async function loadFont(doc: any) {
  const fontUrl = font // путь из public
  const fontBuffer = await fetch(fontUrl).then(res => res.arrayBuffer())
  doc.addFileToVFS('Roboto-Regular.ttf', fontBuffer)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.setFont('Roboto') // ✅ обязательно перед текстом
}
async function generatePDF() {
  if (!process.client) return

  const jsPDFModule = await import('jspdf')
  const autoTableModule = await import('jspdf-autotable')
  const jsPDF = jsPDFModule.default
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()

  // 1️⃣ Загружаем и устанавливаем шрифт
  await loadFont(doc)

  // 2️⃣ Заголовок
  doc.setFontSize(16)
  const text = 'АКТ приема товара'
const textWidth = doc.getTextWidth(text)
doc.text(text, (pageWidth - textWidth) / 2, 15)  doc.setFontSize(12)
  doc.text(`DVH Number: ${route.params.dvh_number}`, 14, 25)
  doc.text(`Принят оператором СВХ: ${products.value[0]?.operator_who_registered || '-'}`, 14, 32)

  // 3️⃣ Таблица
  const tableColumn = [
    'ID', 'Наименование', 'TNVED', 'Вес', 'Количество',
    'Цена', 'Валюта', 'Владелец', 'Дата прибытия', 'Дата убытия', 'Склад'
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
    item.departure_date ? new Date(item.departure_date).toLocaleDateString() : '-',
    item.warehouseId
  ])

  autoTableModule.default(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10, font: 'Roboto' }, // обязательно font
    headStyles: { fillColor: [22, 160, 133] },
    theme: 'grid'
  })

  const finalY = (doc as any).lastAutoTable?.finalY || 60
  doc.text('Акт передан в двух экземплярах:', 14, finalY + 10)
  doc.text('1. Оператор СВХ', 14, finalY + 17)
  doc.text('2. Владелец товара', 14, finalY + 24)

  doc.save(`ACT_DVH_${route.params.dvh_number}.pdf`)
}



onMounted(loadProducts)
</script>
