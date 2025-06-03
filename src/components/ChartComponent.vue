<template>
  <div class="chart-component">
    <p>Chart placeholder</p>
    <div class="time-ranges">
      <button>1D</button>
      <button>1S</button>
      <button>1M</button>
      <button>3M</button>
      <button>6M</button>
      <button>1A</button>
      <button>5A</button>
      <button>📅</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChartComponent',
});
</script>

<style scoped>
.chart-component {
  height: 100%;
  padding: 15px;
  border: 1px solid #34495e;
  border-radius: 4px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.time-ranges button {
  margin-right: 5px;
  padding: 5px 10px;
}
</style>
