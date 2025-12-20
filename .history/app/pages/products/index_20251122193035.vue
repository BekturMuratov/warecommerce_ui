<script setup lang="ts">
definePageMeta({ layout: 'default' })

import { useProductsStore } from '~/stores/products'

const store = useProductsStore()

const products = computed(() => store.products)
const totalItems = computed(() => store.total)
const totalPages = computed(() => store.totalPages)
const loading = computed(() => store.loading)
const dvhList = computed(() => store.dvh_list)

const page = ref(1)
const itemsPerPage = 10

const dates = reactive({
  from: null,
  to: null
})

const productFields = [
  { key: 'name', label: 'Наименование' },
  { key: 'tnved_code', label: 'ТН ВЭД' },
  { key: 'weight', label: 'Вес' },
  { key: 'quantity', label: 'Количество' },
  { key: 'price', label: 'Цена' },
  { key: 'currency', label: 'Валюта' },

  { key: 'arrival_date', label: 'Дата прибытия' },
  { key: 'departure_date', label: 'Дата отправки' },
  { key: 'count_of_days_in_storage', label: 'Дней хранения' },

  { key: 'declaration_number', label: 'Номер декларации' },
  { key: 'transit_declaration_number', label: 'Транзитная декларация' },
  { key: 'dvh_number', label: 'DVH номер' },

  { key: 'operator_who_registered', label: 'Кто зарегистрировал' },
  { key: 'operator_who_released', label: 'Кто выпустил' },

  { key: 'product_owner', label: 'Владелец товара' },
  { key: 'released', label: 'Выпущен' },
  { key: 'deleted', label: 'Удалён' },
  { key: 'warehouseId', label: 'Склад' },
  { key: 'id', label: 'ID' }
]

const headers = productFields.map(f => ({
  title: f.label,
  key: f.key
}))

// красивое форматирование значений
function formatValue(val: any) {
  if (val === null || val === undefined) return '—'

  // форматирование даты
  if (String(val).includes('T') && !isNaN(Date.parse(val))) {
    return new Date(val).toLocaleDateString('ru-RU')
  }

  // булевы значения
  if (typeof val === 'boolean') {
    return val ? 'Да' : 'Нет'
  }

  return val
}


onMounted(() => load())

watch(
  [page, () => dates.from, () => dates.to],
  () => load()
)

async function load() {
  await store.fetchProducts({
    page: page.value,
    pageSize: itemsPerPage,
    startBegin: dates.from || undefined,
    startEnd: dates.to || undefined
  })
}

function onPageChange(p: number) {
  page.value = p
}
</script>

<template>
<v-data-table
  :items="products"
  :headers="headers"
  :items-per-page="itemsPerPage"
  :server-items-length="totalItems"
  :loading="loading"
  class="mt-4"
>
  <template #item="{ item }">
    <tr>
      <td
        v-for="field in productFields"
        :key="field.key"
      >
        {{ formatValue(item[field.key]) }}
      </td>
    </tr>
  </template>
</v-data-table>

<v-pagination
  v-model="page"
  :length="totalPages"
  class="mt-4"
/>

</template>
