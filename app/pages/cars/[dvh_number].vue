<template>
  <v-container>
    <v-card>
      <v-card-title>
        Товары для DVH: {{ route.params.dvh_number }}
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
              <v-form>
                <!-- DECLARATION -->
                <v-text-field
                  v-model="declarationNumber"
                  label="Номер декларации"
                  class="mb-4"
                  required
                />

                <!-- PRODUCTS TABLE -->
                <v-table class="elevation-1 release-table">
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

        <!-- ================= PRODUCTS LIST ================= -->
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
      </v-card-text>

      <!-- ================= PDF MODAL ================= -->
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
    </v-card>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import CarsService from '../../services/CarsService.js'

const route = useRoute()

const products = ref([])
const loading = ref(false)

const pdfDialog = ref(false)
const pdfUrl = ref('')

const releaseDialog = ref(false)
const selectedProducts = ref([])
const declarationNumber = ref('')

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  loading.value = true
  try {
    const dvh_number = route.params.dvh_number
    products.value = await CarsService.getDvhDetail(dvh_number)
  } catch (err) {
    console.error('Ошибка загрузки:', err)
  } finally {
    loading.value = false
  }
}

// ================= CHECKBOX LOGIC =================
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

// ================= RELEASE =================
async function submitRelease() {
  if (!declarationNumber.value || selectedProducts.value.length === 0) {
    alert('Укажите декларацию и выберите товары')
    return
  }

  try {
    await CarsService.releaseCars({
      ids: selectedProducts.value,
      declaration_number: declarationNumber.value,
    })

    alert('Автомобили успешно выпущены')
    releaseDialog.value = false

    await loadProducts()

    selectedProducts.value = []
    declarationNumber.value = ''
  } catch (err) {
    console.error('Ошибка выпуска:', err)
    alert('Ошибка выпуска автомобилей')
  }
}

// ================= PDF =================
async function generatePDF() {
  try {
    const dvh_number = route.params.dvh_number
    const response = await CarsService.generatePdf(dvh_number)

    const blob = new Blob([response.data], { type: 'application/pdf' })
    pdfUrl.value = URL.createObjectURL(blob)
    pdfDialog.value = true
  } catch (err) {
    console.error('Ошибка PDF:', err)
  }
}

// ================= HELPERS =================
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(loadProducts)
</script>


<style scoped>
.v-checkbox-native {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #9e9e9e;
  border-radius: 4px;
  cursor: pointer;
}

.v-checkbox-native:checked {
  background: #1976d2;
  border-color: #1976d2;
}

.v-checkbox-native:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 0px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
