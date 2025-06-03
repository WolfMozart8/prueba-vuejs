<template>
  <div class="instrument-list-component">
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Último*</th>
          <th>Monto (MM)</th> <!-- Assuming this refers to daily volume -->
          <th>Var día</th>
          <th>Var 30d**</th>
          <th>Año Actual</th>
          <th>12 Meses</th>
        </tr>
      </thead>
      <tbody>
        <InstrumentItemComponent 
          v-for="instrument in instruments" 
          :key="instrument.id" 
          :instrument="instrument"
        />
        <tr v-if="instruments.length === 0">
          <td colspan="7">No instruments to display or loading...</td>
        </tr>
      </tbody>
    </table>
    <p class="footnote">* Último precio, Monto Transado y Variación diaria con desfase de 15 minutos. Haz click en cada instrumento para ver información actualizada en el gráfico.</p>
    <p class="footnote">** Variaciones a 30d, Año Actual y 12 meses calculadas con el precio de cierre al último día habil.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStockStore } from '@/stores/stockStore';
import InstrumentItemComponent from './InstrumentItemComponent.vue';
import type { Instrument } from '@/stores/stockStore'; // Import the interface

const store = useStockStore();

// Use filteredInstruments getter which should incorporate search term later
const instruments = computed<Instrument[]>(() => store.filteredInstruments);

</script>

<style scoped>
.instrument-list-component table {
  width: 100%;
  border-collapse: collapse;
}
.instrument-list-component th,
.instrument-list-component td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #34495e;
}
.instrument-list-component th {
  font-size: 0.9em;
  color: #bdc3c7;
}
</style>
