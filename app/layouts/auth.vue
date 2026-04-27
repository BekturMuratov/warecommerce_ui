<template>
  <v-app>
    <v-container fluid class="pa-0 fill-height">
      <v-row no-gutters class="fill-height">
        
        <!-- LEFT -->
        <v-col cols="12" md="4" class="d-flex align-center justify-center left-panel">
          <slot name="form" />
        </v-col>

        <!-- RIGHT -->
        <v-col cols="12" md="8" class="hero-panel">
          <slot name="hero" />
        </v-col>

      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
.left-panel{
  background:#F6F7F9;
}

.hero-panel{
  position:relative;
  background-size:cover;
  background-position:center;
}
</style>