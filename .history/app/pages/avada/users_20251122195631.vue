<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AuthService from '~/services/AuthService'

const users = ref([])

async function loadUsers() {
  try {
    const data = await AuthService.getUsers()
    users.value = data
  } catch (err) {
    console.error('Ошибка загрузки пользователей:', err)
  }
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
            <th>Фамилия</th>
            <th>Роль</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.firstname }}</td>
            <td>{{ u.lastname }}</td>
            <td>{{ u.role }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
