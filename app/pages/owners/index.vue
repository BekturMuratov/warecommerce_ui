<template>
  <v-container>
    <v-card elevation="2">
      <!-- Заголовок -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Список зарегистрированных владельцев</span>
        <v-btn color="primary" @click="dialog = true">Добавить владельца</v-btn>
      </v-card-title>

      <!-- Поиск -->
      <v-card-title>
        <v-text-field
          v-model="search"
          label="Поиск по имени и ИНН владельца"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          clearable
        />
      </v-card-title>

      <!-- Таблица -->
      <v-data-table
        :items="owners"
        :headers="headers"
        :items-per-page="pageSize"
        :page.sync="page"
        :server-items-length="total"
        :search="search"
        :loading="loading"
        class="elevation-0"
        hide-default-footer
      >
        <template #item.index="{ index }">
          {{ (page - 1) * pageSize + index + 1 }}
        </template>

        <template #item.data_registration="{ item }">
          {{ new Date(item.data_registration).toLocaleDateString() }}
        </template>
      </v-data-table>

      <!-- Пагинация -->
      <v-card-actions class="d-flex justify-end">
        <v-pagination
          v-model="page"
          :length="pageCount"
          @update:model-value="fetchOwners"
        />
      </v-card-actions>
    </v-card>

    <!-- Модальное окно для добавления нового владельца -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>Добавить нового владельца</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="newOwner.name"
              label="Имя владельца"
              :rules="[v => !!v || 'Поле обязательно']"
              required
            />
            <v-text-field
              v-model="newOwner.inn"
              label="ИНН"
              :rules="[v => !!v || 'Поле обязательно']"
              required
            />
            <v-text-field
              v-model="newOwner.data_registration"
              label="Дата регистрации"
              type="date"
              :rules="[v => !!v || 'Поле обязательно']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="addOwner" :disabled="!valid">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { ref, onMounted, computed, watch } from 'vue'
import OwnersService from '@/services/OwnersService'

const owners = ref([])
const loading = ref(false)
const search = ref('')

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialog = ref(false)
const valid = ref(false)
const form = ref(null)




const newOwner = ref({
  name: '',
  inn: '',
  data_registration: ''
})

const headers = [
  { text: '#', value: 'index', width: 50 },
  { text: 'Имя владельца', value: 'name' },
  { text: 'ИНН', value: 'inn' },
  { text: 'Дата регистрации', value: 'data_registration' },
]

// количество страниц
const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

const fetchOwners = async () => {
  loading.value = true
  try {
    const response = await OwnersService.getAllOwnersList({
      page: page.value,
      pageSize: pageSize.value,
    })
    owners.value = response.data.data // если бек возвращает { data: { data: [...], total: ... } }
    total.value = response.data.total
  } finally {
    loading.value = false
  }
}

// Добавление нового владельца
const addOwner = async () => {
  if (!form.value.validate()) return
  try {
    await OwnersService.createOwner({
      ...newOwner.value,
      data_registration: new Date(newOwner.value.data_registration), // ✅
    })
    dialog.value = false
    newOwner.value = { name: '', inn: '', data_registration: '' }
    fetchOwners()
  } catch (error) {
    console.error(error)
    alert('Ошибка при добавлении владельца')
  }
}

// обновление при смене страницы
watch([page, pageSize], fetchOwners)

onMounted(fetchOwners)
</script>
