<template>
  <div class="instrument-list-component">
    <div class="tables-container">
      <div class="table-wrapper">
        <table v-if="instrumentsFirstHalf.length > 0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Último*</th>
              <th>Monto (MM)</th>
              <th>Var día</th>
              <th>Var 30d**</th>
              <th>Año Actual</th>
              <th>12 Meses</th>
            </tr>
          </thead>
          <tbody>
            <InstrumentItemComponent 
              v-for="instrument in instrumentsFirstHalf" 
              :key="instrument.id" 
              :instrument="instrument"
            />
          </tbody>
        </table>
        <p v-else-if="instruments.length === 0 && instrumentsFirstHalf.length === 0 && instrumentsSecondHalf.length === 0" class="no-instruments">No instruments to display or loading...</p>
      </div>

      <div class="table-wrapper" v-if="instrumentsSecondHalf.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Último*</th>
              <th>Monto (MM)</th>
              <th>Var día</th>
              <th>Var 30d**</th>
              <th>Año Actual</th>
              <th>12 Meses</th>
            </tr>
          </thead>
          <tbody>
            <InstrumentItemComponent 
              v-for="instrument in instrumentsSecondHalf" 
              :key="instrument.id" 
              :instrument="instrument"
            />
          </tbody>
        </table>
      </div>
    </div>
    <p class="footnote">* Último precio, Monto Transado y Variación diaria con desfase de 15 minutos. Haz click en cada instrumento para ver información actualizada en el gráfico.</p>
    <p class="footnote">** Variaciones a 30d, Año Actual y 12 meses calculadas con el precio de cierre al último día habil.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStockStore } from '@/stores/stockStore';
import InstrumentItemComponent from './InstrumentItemComponent.vue';
import type { Instrument } from '@/stores/stockStore';

const store = useStockStore();
const ITEMS_PER_TABLE = 16;

const instruments = computed<Instrument[]>(() => store.filteredInstruments);

const instrumentsFirstHalf = computed<Instrument[]>(() => {
  return instruments.value.slice(0, ITEMS_PER_TABLE);
});

const instrumentsSecondHalf = computed<Instrument[]>(() => {
  return instruments.value.slice(ITEMS_PER_TABLE, ITEMS_PER_TABLE * 2);
});

</script>

<style scoped>
.instrument-list-component {
  padding: 10px;
  background-color: #2c3e50; /* Dark background for the component area */
  color: #ecf0f1; /* Light text color */
  border-radius: 4px;
}

.tables-container {
  display: flex;
  gap: 20px; /* Space between tables */
  flex-wrap: wrap; /* Allow tables to wrap on smaller screens */
}

.table-wrapper {
  flex: 1; /* Allows tables to share space */
  min-width: 48%; /* Ensures they try to stay side-by-side but can wrap */
}

table {
  /* font-size: 0.7rem; */
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

th,
td {
  border: 1px solid #34495e; /* Slightly lighter border for cells */
  padding: 8px;
  text-align: left;
  font-size: 0.9em;
}

th {
  background-color: #34495e; /* Header background */
  color: #ecf0f1;
  font-weight: bold;
}

.no-instruments {
  text-align: center;
  padding: 20px;
  width: 100%; /* Span across the container if no instruments */
}

.footnote {
  font-size: 0.75em;
  color: #7f8c8d;
  margin-top: 15px; /* Increased margin for footnotes below tables */
  clear: both; /* Ensure footnotes are below floated/flexed tables */
}
</style>
