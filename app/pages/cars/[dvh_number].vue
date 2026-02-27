<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Товары для ДВХ: {{ route.params.dvh_number }}
      </v-card-title>

      <v-card-text>

        <!-- PDF -->
        <v-btn
          color="primary"
          class="mb-4"
          @click="generatePDF"
        >
          Сформировать PDF (Акт приема)
        </v-btn>

        <!-- RELEASE -->
        <v-btn
          color="success"
          class="mb-4 ml-2"
          @click="releaseDialog = true"
        >
          Выпуск
        </v-btn>

        <!-- ================= RELEASE DIALOG ================= -->
        <v-dialog v-model="releaseDialog" max-width="900px">
          <v-card>
            <v-card-title>
              Выпуск товаров
              <v-spacer />
              <v-btn icon @click="releaseDialog = false">✕</v-btn>
            </v-card-title>

            <v-card-text>

              <v-text-field
                v-model="declarationNumber"
                label="Номер декларации"
                class="mb-4"
                required
              />

              <!-- DESKTOP TABLE -->
              <v-table
                v-if="!smAndDown"
                class="elevation-1"
              >
                <thead>
                  <tr>
                    <th width="50">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        class="v-checkbox-native"
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
                  <tr
                    v-for="product in products"
                    :key="product.id"
                  >
                    <td>
                      <input
                        type="checkbox"
                        :value="product.id"
                        v-model="selectedProducts"
                        class="v-checkbox-native"
                      />
                    </td>
                    <td>{{ product.id }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.weight }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>{{ formatDate(product.arrival_date) }}</td>
                    <td>
                      {{ product.departure_date
                        ? formatDate(product.departure_date)
                        : '-' }}
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <!-- MOBILE CARDS -->
              <div v-else>
                <v-card
                  v-for="product in products"
                  :key="product.id"
                  class="mb-3"
                  variant="outlined"
                >
                  <v-card-text>

                    <v-checkbox
                      v-model="selectedProducts"
                      :value="product.id"
                      density="compact"
                      hide-details
                    />

                    <div class="mobile-row">
                      <span class="label">ID</span>
                      <span>{{ product.id }}</span>

                      <span class="label">Наименование</span>
                      <span>{{ product.name }}</span>

                      <span class="label">Вес</span>
                      <span>{{ product.weight }}</span>

                      <span class="label">Кол-во</span>
                      <span>{{ product.quantity }}</span>

                      <span class="label">Дата прибытия</span>
                      <span>{{ formatDate(product.arrival_date) }}</span>
                    </div>

                  </v-card-text>
                </v-card>
              </div>

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

        <!-- ================= PRODUCTS LIST ================= -->

        <!-- DESKTOP TABLE -->
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
              <td>{{ item.car_owner?.name }}</td>
              <td>{{ formatDate(item.arrival_date) }}</td>
              <td>
                {{ item.departure_date
                  ? formatDate(item.departure_date)
                  : '-' }}
              </td>
              <td>{{ item.warehouse?.name }}</td>
            </tr>
          </template>
        </v-data-table>

        <!-- MOBILE CARDS -->
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
                <span>{{ item.price }}</span>

                <span class="label">Валюта</span>
                <span>{{ item.currency }}</span>

                <span class="label">Владелец</span>
                <span>{{ item.car_owner?.name }}</span>

                <span class="label">Дата прибытия</span>
                <span>{{ formatDate(item.arrival_date) }}</span>

                <span class="label">Дата убытия</span>
                <span>
                  {{ item.departure_date
                    ? formatDate(item.departure_date)
                    : '-' }}
                </span>

                <span class="label">Склад</span>
                <span>{{ item.warehouse?.name }}</span>

              </div>
            </v-card-text>
          </v-card>
        </div>

      </v-card-text>
    </v-card>

    <!-- PDF DIALOG -->
    <v-dialog v-model="pdfDialog" width="80%">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>PDF акт приема</span>
          <v-btn icon @click="pdfDialog = false">✕</v-btn>
        </v-card-title>

        <v-card-text style="height: 80vh">
          <embed
            v-if="pdfUrl"
            :src="pdfUrl"
            type="application/pdf"
            style="width: 100%; height: 100%"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import CarsService from '../../services/CarsService.js'

const { smAndDown } = useDisplay()
const route = useRoute()

const products = ref([])
const loading = ref(false)

const pdfDialog = ref(false)
const pdfUrl = ref('')

const releaseDialog = ref(false)
const selectedProducts = ref([])
const declarationNumber = ref('')

async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number
    products.value = await CarsService.getDvhDetail(dvh_number)
  } finally {
    loading.value = false
  }
}

const isAllSelected = computed(() =>
  products.value.length > 0 &&
  selectedProducts.value.length === products.value.length
)

function toggleSelectAll(event) {
  const checked = event.target.checked
  selectedProducts.value = checked
    ? products.value.map(p => p.id)
    : []
}

async function submitRelease() {
  if (!declarationNumber.value || selectedProducts.value.length === 0) {
    alert('Укажите декларацию и выберите товары')
    return
  }

  await CarsService.releaseCars({
    ids: selectedProducts.value,
    declaration_number: declarationNumber.value,
  })

  releaseDialog.value = false
  await loadProducts()

  selectedProducts.value = []
  declarationNumber.value = ''
}

async function generatePDF() {
  const dvh_number = route.params.dvh_number
  const response = await CarsService.generatePdf(dvh_number)

  const blob = new Blob([response.data], { type: 'application/pdf' })
  pdfUrl.value = URL.createObjectURL(blob)
  pdfDialog.value = true
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(loadProducts)
</script>

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

.v-checkbox-native {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #9e9e9e;
  border-radius: 4px;
  cursor: pointer;
}
</style>