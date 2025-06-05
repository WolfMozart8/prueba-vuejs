<template>
  <div class="summary-component" v-if="details">
    <div class="tabs">
      <button :class="{ active: activeView === 'resumen' }" @click="activeView = 'resumen'">Resumen</button>
      <button :class="{ active: activeView === 'detalles' }" @click="activeView = 'detalles'">Detalles</button>
    </div>

    <div v-if="activeView === 'resumen' || activeView === 'detalles'"> <!-- Simplified, show all for now -->
      <p class="cotizacion-time">Cotización: {{ formatDateTime(details.price?.datetimeLastPrice) }}</p>
      
      <div class="summary-grid">
        <div><span>MERCADO</span><span>{{ details.info?.marketName }}</span></div>
        <div><span>APERTURA</span><span>{{ formatNumber(details.price?.openPrice) }}</span></div>
        <div><span>CIERRE ANTERIOR</span><span>{{ formatNumber(details.price?.closePrice) }}</span></div>
        <div><span>MÁXIMO DIARIO</span><span>{{ formatNumber(details.price?.maxDay) }}</span></div>
        <div><span>MÍNIMO DIARIO</span><span>{{ formatNumber(details.price?.minDay) }}</span></div>
        <div><span>MÁXIMO 52 SEMANAS</span><span>{{ formatNumber(details.price?.max52W) }}</span></div>
        <div><span>MÍNIMO 52 SEMANAS</span><span>{{ formatNumber(details.price?.min52W) }}</span></div>
      </div>

      <div class="variation-header">
        <h4>Variación**</h4>
        <span>%</span>
      </div>
      <div class="summary-grid variation-grid">
        <div><span>1 MES</span><span :class="getPerformanceClass(details.price?.pct30D)">{{ formatPercentage(details.price?.pct30D) }}</span></div>
        <div><span>1 AÑO</span><span :class="getPerformanceClass(details.price?.pctRelW52)">{{ formatPercentage(details.price?.pctRelW52) }}</span></div>
        <div><span>AÑO A LA FECHA</span><span :class="getPerformanceClass(details.price?.pctRelCY)">{{ formatPercentage(details.price?.pctRelCY) }}</span></div>
      </div>
      <!-- <p class="footnote">** Último precio, Monto Transado y Variación diaria con desfase de 15 minutos. Haz click en cada instrumento para ver información actualizada en el gráfico.</p>
      <p class="footnote">** Variaciones a 30d, Año Actual y 12 meses calculadas con el precio de cierre al último día habil.</p> -->
    </div>

  </div>
  <div v-else class="summary-component">
    <p>Loading summary data...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStockStore } from '@/stores/stockStore';

const store = useStockStore();
const activeView = ref('resumen'); // 'resumen' or 'detalles'

const details = computed(() => store.selectedInstrumentDetails);

const formatNumber = (value: number | undefined, decimalPlaces = 2) => {
  if (typeof value !== 'number') return '-';
  return value.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
};

const formatPercentage = (value: number | undefined) => {
  if (typeof value !== 'number') return '-';
  // Assuming value is already a percentage that needs formatting, e.g., 0.539 for +0.54%
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`; 
};

const formatDateTime = (dateTimeString: string | undefined) => {
  if (!dateTimeString) return '-';
  // Expected format: "06-11-2024 12:52:07"
  // Needs to be parsed and formatted if a different display is required.
  // For now, return as is, or a simple split:
  const parts = dateTimeString.split(' ');
  if (parts.length === 2) {
    const dateParts = parts[0].split('-');
    if (dateParts.length === 3) {
      // Reorder to DD/MM/YYYY if desired, or keep as is
      return `${dateParts[1]}/${dateParts[0]}/${dateParts[2]} - ${parts[1]}`;
    }
  }
  return dateTimeString; // Fallback
};

const getPerformanceClass = (value: number | undefined) => {
  if (typeof value !== 'number') return '';
  return value < 0 ? 'negative' : 'positive';
};

</script>

<style scoped>
.summary-component {
  padding: 15px;
  border: 1px solid #34495e;
  border-radius: 4px;
  font-size: 0.9em;
}

.tabs {
  margin-bottom: 15px;
  border-bottom: 1px solid #34495e;
}

.tabs button {
  padding: 8px 15px;
  background-color: transparent;
  color: #bdc3c7;
  border: none;
  cursor: pointer;
  font-size: 1em;
}

.tabs button.active {
  border-bottom: 2px solid #2ecc71;
  color: #ecf0f1;
  font-weight: bold;
}

.cotizacion-time {
  font-size: 0.85em;
  color: #7f8c8d;
  margin-bottom: 15px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 15px;
  margin-bottom: 15px;
}

.summary-grid div {
  display: contents; /* Allows direct children to be grid items */
}

.summary-grid span:nth-child(odd) {
  color: #bdc3c7; /* Label color */
}

.summary-grid span:nth-child(even) {
  text-align: right;
  font-weight: bold;
  color: #ecf0f1; /* Value color */
}

.summary-component h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #ecf0f1;
  border-bottom: 1px solid #34495e;
  padding-bottom: 5px;
}

.negative {
  color: #e74c3c !important;
}

.positive {
  color: #2ecc71 !important;
}

.variation-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #34495e;
  padding-bottom: 5px;
}

.variation-header h4 {
  margin: 0;
  color: #ecf0f1;
  border: none;
  padding: 0;
}

.variation-header span {
  text-align: right;
  font-weight: bold;
  color: #ecf0f1;
}

.footnote {
  font-size: 0.75em;
  color: #7f8c8d;
  margin-top: 5px;
}
</style>
