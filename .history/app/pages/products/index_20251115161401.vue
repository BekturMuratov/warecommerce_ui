<script setup lang="ts">
definePageMeta({
 layout: 'default'
})
const products = ref<any[]>([])
const totalItems = ref(0)

const dates = reactive({
  from: null as string|null,
  to: null as string|null
})

const page = ref(1)
const itemsPerPage = 10

watch([page, ()=>dates.from, ()=>dates.to], load)

onMounted(load)

async function load() {
 
}

</script>

<template>
  <v-dialog v-model="showPdfModal" max-width="1200px">
  <v-card>
    <v-card-title class="text-h6">
      Загрузка товаров через PDF
    </v-card-title>

    <v-divider />

    <v-card-text style="padding: 0;">
      <!-- Твой компонент загрузки PDF и парсинга -->
      <div class="layout">
        <div class="pdf-panel">
          <div class="top-bar">
            <input type="file" accept=".pdf" @change="handleFileUpload" :disabled="isLoading" />
            <span v-if="isLoading" class="loading">Обработка PDF...</span>
            <span v-if="error" class="error">{{ error }}</span>
          </div>

          <div v-if="pdfUrl" class="pdf-viewer">
            <VuePdfEmbed :source="pdfUrl" />
          </div>
          <div v-else class="placeholder">
            <p>Загрузите PDF, чтобы увидеть предпросмотр</p>
          </div>
        </div>

        <div class="table-panel">
          <h3>Результат обработки</h3>

          <div v-if="headerData.registrationNumber" class="header-info">
            <p><strong>Регистрационный номер:</strong> {{ headerData.registrationNumber }}</p>
            <p><strong>Дата:</strong> {{ headerData.dvhDate }}</p>
            <p><strong>Отправитель:</strong> {{ headerData.sender }}</p>
            <p><strong>Получатель:</strong> {{ headerData.receiver }}</p>
          </div>

          <div class="actions">
            <button @click="openModal">➕ Добавить товар вручную</button>
          </div>

          <div v-if="tableData.length" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Код ТНВЭД</th>
                  <th>Наименование товара</th>
                  <th>Вес брутто (кг)</th>
                  <th>Кол-во ДЕИ</th>
                  <th>Цена товара</th>
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
          </div>

          <div v-else-if="!isLoading" class="placeholder-table">
            <p>Результаты появятся здесь после обработки</p>
          </div>
        </div>
      </div>

      <!-- Модалка добавления товара внутри PDF-окна -->
      <div v-if="showModal" class="modal-backdrop">
        <div class="modal">
          <h4>Добавить новый товар</h4>
          <form @submit.prevent="addProductFromModal">
            <input v-model="newProduct.hsCode" placeholder="Код ТНВЭД" required />
            <input v-model="newProduct.name" placeholder="Наименование товара" required />
            <input v-model="newProduct.weight" placeholder="Вес брутто (кг)" />
            <input v-model="newProduct.qty" placeholder="Кол-во ДЕИ" />
            <input v-model="newProduct.price" placeholder="Цена товара" />
            <input v-model="newProduct.currency" placeholder="Валюта" />

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
