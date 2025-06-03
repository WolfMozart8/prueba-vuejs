<template>
  <div class="header-component" v-if="details && marketInfo">
    <h2>{{ marketInfo.name }}, {{ marketInfo.countryName?.toUpperCase() }}</h2>
    <p>{{ marketInfo.shortName }}</p> <!-- Or some other descriptor like 'Indice' if appropriate -->
    <div v-if="details.price">
      <span>Valor Actual: <strong>{{ formatNumber(details.price.lastPrice) }}</strong></span>
      <span :class="getPerformanceClass(details.price.performanceRelative)">
        Var.% Actual: {{ formatPercentage(details.price.performanceRelative) }}
      </span>
      <span :class="getPerformanceClass(details.price.performanceAbsolute)">
        Var. Puntos Actual: {{ formatNumber(details.price.performanceAbsolute, 2) }}
      </span>
    </div>
  </div>
  <div v-else class="header-component">
    <p>Loading header data...</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStockStore } from '@/stores/stockStore';

const store = useStockStore();

const details = computed(() => store.selectedInstrumentDetails);
const marketInfo = computed(() => {
  // For the main index (e.g. IPSA), currentMarketInfo from constituensList might be more suitable
  // For individual stocks, details.info would be from its specific summary file.
  if (store.selectedInstrumentId === store.currentMarketInfo?.codeInstrument) {
    return store.currentMarketInfo;
  }
  return details.value?.info; 
});

const formatNumber = (value: number | undefined, decimalPlaces = 2) => {
  if (typeof value !== 'number') return '-';
  return value.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
};

const formatPercentage = (value: number | undefined) => {
  if (typeof value !== 'number') return '-';
  // The value seems to be already in percent, e.g., -0.234469 for -0.23%
  // If it was a raw ratio like 0.0023, you'd multiply by 100.
  // Assuming it's already a percentage value that needs formatting:
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const getPerformanceClass = (value: number | undefined) => {
  if (typeof value !== 'number') return '';
  return value < 0 ? 'negative' : 'positive';
};

</script>

<style scoped>
.header-component {
  padding: 15px;
  color: #ecf0f1;
}
.header-component h2 {
  margin: 0 0 5px 0;
}
.header-component p {
  margin: 0 0 10px 0;
  font-size: 0.9em;
}
.header-component div span {
  margin-right: 15px;
}
.negative {
  color: #e74c3c;
}
.positive {
  color: #2ecc71;
}
</style>
