<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import ProductService from '@/services/ProductServices.js'
  import type { DvhListItem } from '~/types/products'
  
  // ===== Utils =====
  function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // ===== State =====
  const isDialogOpen = ref(false)
  
  const today = formatDate(new Date())
  
  const dvhList = ref<DvhListItem[]>([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  })
  const loading = ref(false)
  
  // Фильтры
  const startDate = ref(today)
  const endDate = ref(today)
  
  // ===== API =====
  async function loadDvhList() {
    loading.value = true
    try {
      const data: any = await ProductService.getDvhList({
        pageNumber: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        startDate: startDate.value,
        endDate: endDate.value
      })
  
      dvhList.value = data.data
      pagination.value = data.pagination
    } catch (err) {
      console.error('Ошибка загрузки DVH:', err)
    } finally {
      loading.value = false
    }
  }
  
  // ===== Effects =====
  watch(
    [() => pagination.value.currentPage, () => pagination.value.pageSize],
    loadDvhList
  )
  
  onMounted(loadDvhList)
  </script>
  
  <template>
    <v-container fluid>
      <v-card>
        <v-card-title class="text-h6">
          Список DVH
        </v-card-title>
  
        <!-- ===== Фильтры ===== -->
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="startDate"
                label="Начало периода"
                type="date"
              />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="endDate"
                label="Конец периода"
                type="date"
              />
            </v-col>
  
            <v-col cols="6">
              <v-btn block @click="loadDvhList">
                Применить фильтр
              </v-btn>
            </v-col>
  
            <v-col cols="6">
              <v-btn
                block
                color="primary"
                @click="isDialogOpen = true"
              >
                Открыть модальное окно
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
  
        <!-- ===== МОДАЛЬНОЕ ОКНО ===== -->
        <v-dialog
          v-model="isDialogOpen"
          max-width="800"
          persistent
        >
          <v-card>
            <v-card-title class="text-h6">
              Модальное окно
            </v-card-title>
  
            <v-card-text>
              <!-- 🔽 ЗДЕСЬ ТЫ ПОТОМ ВСТАВИШЬ СВОЙ PDF-КОМПОНЕНТ 🔽 -->
              <v-alert type="info" variant="tonal">
                Здесь будет компонент обработки PDF
              </v-alert>
            </v-card-text>
  
            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="text"
                @click="isDialogOpen = false"
              >
                Закрыть
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
  
        <!-- ===== ТАБЛИЦА ===== -->
        <v-data-table
          :items="dvhList"
          :loading="loading"
          :items-per-page="pagination.pageSize"
          :page.sync="pagination.currentPage"
          :server-items-length="pagination.totalItems"
          class="elevation-1"
        >
          <template #top>
            <v-toolbar flat>
              <v-toolbar-title>DVH List</v-toolbar-title>
            </v-toolbar>
          </template>
  
          <template #headers>
            <tr>
              <th>Номер ДВХ</th>
              <th>Владелец</th>
              <th>Оператор СВХ</th>
              <th>Дата въезда</th>
              <th>Действие</th>
            </tr>
          </template>
  
          <template #item="{ item }">
            <tr>
              <td>{{ item.dvh_number }}</td>
              <td>{{ item.product_owner }}</td>
              <td>{{ item.operator_who_registered }}</td>
              <td>{{ new Date(item.arrival_date).toLocaleDateString() }}</td>
              <td>
                <v-btn
                  size="small"
                  color="primary"
                  @click="$router.push(`/products/${item.dvh_number}`)"
                >
                  Посмотреть
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </template>
  