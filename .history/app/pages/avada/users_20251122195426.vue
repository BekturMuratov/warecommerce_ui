<script setup lang="ts">
import { ref, onMounted } from 'vue'

const users = ref([])

async function loadUsers() {
  const config = useRuntimeConfig()
  const api = config.public.NUXT_PUBLIC_API_URL

  const data = await $fetch(api + '/users')
  users.value = data as any
}

onMounted(loadUsers)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Пользователи</v-card-title>

      <v-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Имя</th>
            <th>Роль</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.user_name }}</td>
            <td>{{ u.role }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
