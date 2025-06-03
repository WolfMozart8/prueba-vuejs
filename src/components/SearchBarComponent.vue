<template>
  <div class="search-bar-component">
    <input type="text" placeholder="Busca un instrumento" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchBarComponent',
});
</script>

<style scoped>
.search-bar-component {
  padding: 10px;
  background-color: #2c3e50; /* Example background */
}
input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
