<template>
  <div class="tab-component">
    <button class="active">IPSA</button>
    <button>IGPA</button>
    <button>NASDAQ</button>
    <button>DOW JONES</button>
    <button>SP/BVL</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TabComponent',
});
</script>

<style scoped>
.tab-component {
  padding: 10px 0;
  border-bottom: 1px solid #34495e;
  margin-bottom: 10px;
}
.tab-component button {
  padding: 8px 15px;
  margin-right: 5px;
  background-color: transparent;
  color: #bdc3c7;
  border: none;
  cursor: pointer;
}
.tab-component button.active {
  border-bottom: 2px solid #2ecc71;
  color: #ecf0f1;
}
</style>
