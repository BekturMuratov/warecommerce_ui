<template>

<div class="sidebar">

  <!-- LOGO -->
  <div class="sidebar-logo">
    <v-icon size="28">mdi-database</v-icon>
    <span>АИС СВХ</span>
  </div>

  <!-- MENU -->
  <v-list density="compact" nav>

    <div class="menu-title">Основное</div>

    <v-list-item
      v-for="item in mainMenu"
      :key="item.title"
      :to="item.link"
      link
      @click="closeDrawer"
    >

      <template #prepend>
        <v-icon>{{ item.icon }}</v-icon>
      </template>

      <v-list-item-title>
        {{ item.title }}
      </v-list-item-title>

    </v-list-item>

    <div class="menu-title mt-4">Отчетность</div>

    <v-list-item
      v-for="item in reportsMenu"
      :key="item.title"
      :to="item.link"
      link
      @click="closeDrawer"
    >

      <template #prepend>
        <v-icon>{{ item.icon }}</v-icon>
      </template>

      <v-list-item-title>
        {{ item.title }}
      </v-list-item-title>

    </v-list-item>

  </v-list>

  <v-spacer />

  <!-- SUPPORT -->
  <div class="support">
    <div class="support-title">Тех. поддержка</div>

    <div>📞 +996 (312) 51-24-00</div>
    <div>support@ais-svh.kg</div>
  </div>

  <!-- LOGOUT -->
  <v-list>

    <v-list-item
      @click="logout"
      link
    >

      <template #prepend>
        <v-icon>mdi-logout</v-icon>
      </template>

      <v-list-item-title>
        Завершить сессию
      </v-list-item-title>

    </v-list-item>

  </v-list>

</div>

</template>

<script setup>

import { useDisplay } from 'vuetify'

const { mdAndDown } = useDisplay()

const emit = defineEmits(['close'])

const mainMenu = [

  { title:'Владельцы', link:'/owners', },
  { title:'Журнал АТС', link:'/cars', },
  { title:'Журнал выпущенных АТС', link:'/released_cars', }

]

const reportsMenu = [

  { title:'Форма ДО-1 (Приемка)', link:'/report_stock_cars',  },
  { title:'Форма ДО-2 (Выдача)', link:'/report_released_cars',  }

]

const closeDrawer = () => {

  // закрываем только на мобильных
  if (mdAndDown.value) {
    emit('close')
  }

}

const logout = () => {

  const cookies = ['token','refreshToken','user']

  cookies.forEach(name => {

    const cookie = useCookie(name)
    cookie.value = null

  })

  navigateTo('/login')

}

</script>

<style scoped>

.sidebar{
  height:100%;
  display:flex;
  flex-direction:column;
}

.sidebar-logo{
  display:flex;
  align-items:center;
  gap:10px;
  padding:20px;
  font-weight:600;
  border-bottom:1px solid rgba(255,255,255,0.05);
}

.menu-title{
  font-size:12px;
  opacity:0.6;
  padding:10px 16px;
  text-transform:uppercase;
}

.support{
  margin:16px;
  padding:12px;
  border-radius:8px;
  background:#1b2b45;
  font-size:13px;
}

.support-title{
  font-weight:600;
  margin-bottom:6px;
}

</style>