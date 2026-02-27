<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import type { Product } from '~/types/products'
import CarsService from '~/services/CarsService'

const { smAndDown } = useDisplay()

const route = useRoute()
const products = ref<Product[]>([])
const loading = ref(false)

const pdfDialog = ref(false)
const pdfUrl = ref('')

async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number as string
    products.value = await CarsService.getReleasedDvhDetail(dvh_number)
  } finally {
    loading.value = false
  }
}

async function generatePDF() {
  try {
    const dvh_number = route.params.dvh_number as string
    const response = await CarsService.generateReleasedPdf(dvh_number)

    const pdfBlob = new Blob([response.data], {
      type: 'application/pdf'
    })

    pdfUrl.value = URL.createObjectURL(pdfBlob)
    pdfDialog.value = true
  } catch (err) {
    console.error('Ошибка генерации PDF:', err)
  }
}

const totalStoragePrice = computed(() =>
  products.value.reduce(
    (sum, item) => sum + Number(item.price_for_storage || 0),
    0
  )
)

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(loadProducts)
</script>

<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Товары для DVH: {{ route.params.dvh_number }}
      </v-card-title>

      <v-card-text>

        <v-btn
          color="primary"
          class="mb-4"
          @click="generatePDF"
        >
          Сформировать PDF (Акт выпуска)
        </v-btn>

        <!-- ================= DESKTOP TABLE ================= -->
        <v-data-table
          v-if="!smAndDown"
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
              <th>Итого за хранение</th>
              <th>Кол-во дней</th>
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
              <td>{{ formatDate(item.arrival_date) }}</td>
              <td>{{ formatDate(item.departure_date) }}</td>
              <td>{{ item.warehouseId }}</td>
              <td>{{ item.price_for_storage }}</td>
              <td>{{ item.count_of_days_in_storage }}</td>
            </tr>
          </template>
        </v-data-table>

        <!-- ================= MOBILE CARDS ================= -->
        <div v-else>
          <v-card
            v-for="item in products"
            :key="item.id"
            class="mb-3"
            variant="outlined"
          >
            <v-card-text>
              <div class="mobile-row">

                <span class="label">ID</span>
                <span>{{ item.id }}</span>

                <span class="label">Наименование</span>
                <span>{{ item.name }}</span>

                <span class="label">TNVED</span>
                <span>{{ item.tnved_code }}</span>

                <span class="label">Вес</span>
                <span>{{ item.weight }}</span>

                <span class="label">Количество</span>
                <span>{{ item.quantity }}</span>

                <span class="label">Цена</span>
                <span>{{ item.price }} {{ item.currency }}</span>

                <span class="label">Владелец</span>
                <span>{{ item.product_owner }}</span>

                <span class="label">Дата прибытия</span>
                <span>{{ formatDate(item.arrival_date) }}</span>

                <span class="label">Дата убытия</span>
                <span>{{ formatDate(item.departure_date) }}</span>

                <span class="label">Склад</span>
                <span>{{ item.warehouseId }}</span>

                <span class="label">Хранение</span>
                <span>{{ item.price_for_storage }}</span>

                <span class="label">Дней на складе</span>
                <span>{{ item.count_of_days_in_storage }}</span>

              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- ================= TOTAL ================= -->
        <div class="mt-4 d-flex justify-end text-subtitle-1 font-weight-bold">
          Итого за хранение:
          <span class="ml-2">
            {{ totalStoragePrice }} сом
          </span>
        </div>

      </v-card-text>

      <!-- ================= PDF DIALOG ================= -->
      <v-dialog v-model="pdfDialog" width="90%" max-width="1000">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>PDF акт выпуска</span>
            <v-btn icon @click="pdfDialog = false">✕</v-btn>
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

<style scoped>
.mobile-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  font-size: 14px;
}

.label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}
</style>