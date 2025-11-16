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
  <v-container>
    <h1>Товары</h1>

    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field type="date" v-model="dates.from" label="Дата с"/>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field type="date" v-model="dates.to" label="Дата по"/>
      </v-col>
    </v-row>

    <v-data-table
      :items="products"
      :items-per-page="itemsPerPage"
      :page="page"
      :server-items-length="totalItems"
      @update:page="p => page = p"
    >
      <template #headers>
        <tr>
          <th>Наименование</th>
          <th>Артикул</th>
          <th>Дата регистрации</th>
        </tr>
      </template>

      <template #item="{ item }">
        <tr>
          <td>{{ item.title }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.createdAt }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>
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
  <v-container>
    <h1>Товары</h1>

    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-text-field type="date" v-model="dates.from" label="Дата с"/>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field type="date" v-model="dates.to" label="Дата по"/>
      </v-col>
    </v-row>

    <v-data-table
      :items="products"
      :items-per-page="itemsPerPage"
      :page="page"
      :server-items-length="totalItems"
      @update:page="p => page = p"
    >
      <template #headers>
        <tr>
          <th>Наименование</th>
          <th>Артикул</th>
          <th>Дата регистрации</th>
        </tr>
      </template>

      <template #item="{ item }">
        <tr>
          <td>{{ item.title }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.createdAt }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>
