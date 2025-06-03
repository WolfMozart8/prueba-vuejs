<template>
  <tr class="instrument-item-component" @click="selectInstrument" :class="{ selected: isSelected }">
    <td>{{ instrument.shortName }}</td>
    <td>{{ formatNumber(instrument.lastPrice) }}</td>
    <td>{{ formatVolume(instrument.volumeMoney) }}</td>
    <td :class="getPerformanceClass(instrument.pctDay)">{{ formatPercentage(instrument.pctDay) }}</td>
    <td :class="getPerformanceClass(instrument.pct30D)">{{ formatPercentage(instrument.pct30D) }}</td>
    <td :class="getPerformanceClass(instrument.pctCY)">{{ formatPercentage(instrument.pctCY) }}</td>
    <td :class="getPerformanceClass(instrument.pct1Y)">{{ formatPercentage(instrument.pct1Y) }}</td>
  </tr>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import type { PropType } from 'vue';
import { useStockStore } from '@/stores/stockStore';
import type { Instrument } from '@/stores/stockStore';

const props = defineProps({
  instrument: {
    type: Object as PropType<Instrument>,
    required: true,
  },
});

const store = useStockStore();

const isSelected = computed(() => store.selectedInstrumentId === props.instrument.id);

const selectInstrument = () => {
  store.selectInstrument(props.instrument.id);
};

const formatNumber = (value: number | undefined, decimalPlaces = 2) => {
  if (typeof value !== 'number') return '-';
  return value.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
};

const formatVolume = (value: number | undefined) => {
  if (typeof value !== 'number') return '-';
  // Assuming value is in units, convert to millions (MM) for display
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatPercentage = (value: number | undefined) => {
  if (typeof value !== 'number') return '-';
  // Values like pctDay are direct percentages, e.g., 0 for 0.00%, -0.35 for -0.35%
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const getPerformanceClass = (value: number | undefined) => {
  if (typeof value !== 'number' || value === 0) return ''; // No class for 0
  return value < 0 ? 'negative' : 'positive';
};
</script>

<style scoped>
.instrument-item-component {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.instrument-item-component:hover {
  background-color: #3a506b; /* Slightly lighter than table for hover */
}

.instrument-item-component.selected {
  background-color: #4a6588; /* Highlight for selected row */
  font-weight: bold;
}

.negative {
  color: #e74c3c;
}

.positive {
  color: #2ecc71;
}
</style>
