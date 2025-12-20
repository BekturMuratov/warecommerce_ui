<script setup lang="ts">
 import VuePdfEmbed from 'vue-pdf-embed'
 
 defineProps<{
   src: string
 }>()
 </script>
 
 <template>
   <VuePdfEmbed :source="src" />
 </template>
 