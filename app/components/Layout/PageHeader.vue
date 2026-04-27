<script setup>

defineProps({
  breadcrumb: String,
  userName: String,
  userRole: String,
  avatar: String
})

</script>

<template>

<div class="page-header">

  <!-- LEFT -->
  <div class="breadcrumbs">
    {{ breadcrumb }}
  </div>

  <!-- RIGHT -->
  <div class="header-right">

    <div class="user-info">

      <div class="user-text">
        <div class="role">
          {{ userRole }}
        </div>

        <div class="name">
          {{ userName }}
        </div>
      </div>

      <v-avatar size="36">
        <v-img :src="avatar" alt="user" />
      </v-avatar>

    </div>

  </div>

</div>

</template>

<style scoped>

.page-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
  flex-wrap:wrap;
  gap:10px;
}

.breadcrumbs{
  font-size:18px;
  color:#8c98a5;
  text-transform:uppercase;
}

.header-right{
  display:flex;
  align-items:center;
}

.user-info{
  display:flex;
  align-items:center;
  gap:10px;
}

.user-text{
  text-align:right;
}

.role{
  font-size:12px;
  color:#6b7280;
}

.name{
  font-size:13px;
  font-weight:600;
}

/* MOBILE */

@media (max-width:600px){

  .breadcrumbs{
    font-size:14px;
  }

  .user-text{
    display:none;
  }

}

</style>