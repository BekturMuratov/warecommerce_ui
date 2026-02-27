<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import OwnersService from '@/services/OwnersService'

const { smAndDown } = useDisplay()

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
  { title: '#', value: 'index', width: 50 },
  { title: 'Имя владельца', value: 'name' },
  { title: 'ИНН', value: 'inn' },
  { title: 'Дата регистрации', value: 'data_registration' },
]

const pageCount = computed(() =>
  Math.ceil(total.value / pageSize.value)
)

const fetchOwners = async () => {
  loading.value = true
  try {
    const response = await OwnersService.getAllOwnersList({
      page: page.value,
      pageSize: pageSize.value,
    })
    owners.value = response.data.data
    total.value = response.data.total
  } finally {
    loading.value = false
  }
}

const addOwner = async () => {
  if (!form.value.validate()) return

  try {
    await OwnersService.createOwner({
      ...newOwner.value,
      data_registration: new Date(newOwner.value.data_registration),
    })

    dialog.value = false
    newOwner.value = { name: '', inn: '', data_registration: '' }

    fetchOwners()
  } catch (error) {
    console.error(error)
    alert('Ошибка при добавлении владельца')
  }
}

watch([page, pageSize], fetchOwners)

onMounted(fetchOwners)
</script>

<template>
  <v-container fluid>
    <v-card elevation="2">

      <!-- ================= HEADER ================= -->
      <v-card-title
        class="d-flex flex-column flex-md-row justify-space-between align-md-center"
      >
        <span class="mb-2 mb-md-0">
          Список зарегистрированных владельцев
        </span>

        <v-btn
          color="primary"
          block
          class="w-100 w-md-auto"
          @click="dialog = true"
        >
          Добавить владельца
        </v-btn>
      </v-card-title>

      <!-- ================= SEARCH ================= -->
      <v-card-text>
        <v-text-field
          v-model="search"
          label="Поиск по имени и ИНН владельца"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          clearable
        />
      </v-card-text>

      <!-- ================= DESKTOP TABLE ================= -->
      <v-data-table
        v-if="!smAndDown"
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

      <!-- ================= MOBILE CARDS ================= -->
      <div v-else class="pa-2">
        <v-card
          v-for="(owner, index) in owners"
          :key="owner.id"
          class="mb-3"
          variant="outlined"
        >
          <v-card-text>
            <div class="mobile-row">

              <span class="label">№</span>
              <span>
                {{ (page - 1) * pageSize + index + 1 }}
              </span>

              <span class="label">Имя</span>
              <span>{{ owner.name }}</span>

              <span class="label">ИНН</span>
              <span>{{ owner.inn }}</span>

              <span class="label">Дата регистрации</span>
              <span>
                {{ new Date(owner.data_registration).toLocaleDateString() }}
              </span>

            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- ================= PAGINATION ================= -->
      <v-card-actions class="d-flex justify-end">
        <v-pagination
          v-model="page"
          :length="pageCount"
          @update:model-value="fetchOwners"
        />
      </v-card-actions>

    </v-card>

    <!-- ================= DIALOG ================= -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          Добавить нового владельца
        </v-card-title>

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
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="addOwner"
            :disabled="!valid"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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