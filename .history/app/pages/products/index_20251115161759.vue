<script setup lang="ts">
import { ref, reactive } from 'vue'

const showPdfModal = ref(true)

const showModal = ref(false)

const newProduct = reactive({
  hsCode: '',
  name: '',
  weight: '',
  qty: '',
  price: '',
  currency: ''
})

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

const addProductFromModal = () => {
  console.log('Добавили товар:', newProduct)
  showModal.value = false
}

// --- временные заглушки, чтобы компонент отображался ---
const products = ref([])
const tableData = ref([])
const headerData = reactive({
  registrationNumber: '',
  dvhDate: '',
  sender: '',
  receiver: ''
})

const handleFileUpload = () => {}
const updateCell = () => {}

const pdfUrl = ref(null)
const isLoading = ref(false)
const error = ref('')
</script>

<template>
  <v-dialog v-model="showPdfModal" max-width="1200px">
    <v-card>
      <v-card-title class="text-h6">
        Загрузка товаров через PDF
      </v-card-title>

      <v-divider />

      <v-card-text style="padding: 0;">
        <div class="layout">
          <div class="pdf-panel">
            <div class="top-bar">
              <input type="file" accept=".pdf" @change="handleFileUpload" :disabled="isLoading" />
              <span v-if="isLoading">Обработка PDF...</span>
            </div>

            <div v-if="pdfUrl">
              <p>PDF загружен</p>
            </div>
            <div v-else>
              <p>Загрузите PDF, чтобы увидеть предпросмотр</p>
            </div>
          </div>

          <div class="table-panel">
            <h3>Результат обработки</h3>

            <div class="actions">
              <button @click="openModal">➕ Добавить товар вручную</button>
            </div>

            <p v-if="!tableData.length">Результаты появятся здесь</p>
          </div>
        </div>

        <!-- модалка добавления товара -->
        <div v-if="showModal" class="modal-backdrop">
          <div class="modal">
            <h4>Добавить новый товар</h4>

            <form @submit.prevent="addProductFromModal">
              <input v-model="newProduct.hsCode" placeholder="Код ТНВЭД" />
              <input v-model="newProduct.name" placeholder="Наименование товара" />

              <div class="modal-actions">
                <button type="submit">Добавить</button>
                <button type="button" @click="showModal = false">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="tonal" @click="showPdfModal = false">
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
