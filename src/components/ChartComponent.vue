<template>
  <div class="chart-component">
    <div class="chart-header">
      <h3>Gráfico del Instrumento: {{ store.selectedInstrumentDetails?.info?.name || store.selectedInstrumentId || 'N/A' }}</h3>
      <div class="time-range-buttons">
        <!-- Time range buttons functionality to be implemented later -->
        <button @click="setTimeRange('1D')" :class="{ active: activeRange === '1D' }">1D</button>
        <button @click="setTimeRange('1S')" :class="{ active: activeRange === '1S' }">1S</button>
        <button @click="setTimeRange('1M')" :class="{ active: activeRange === '1M' }">1M</button>
        <button @click="setTimeRange('3M')" :class="{ active: activeRange === '3M' }">3M</button>
        <button @click="setTimeRange('6M')" :class="{ active: activeRange === '6M' }">6M</button>
        <button @click="setTimeRange('1A')" :class="{ active: activeRange === '1A' }">1A</button>
        <button @click="setTimeRange('5A')" :class="{ active: activeRange === '5A' }">5A</button>
      </div>
    </div>
    <div class="chart-container" v-if="chartDataReady">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="loading-placeholder">
      <p v-if="store.selectedInstrumentId">Cargando datos del gráfico...</p>
      <p v-else>Seleccione un instrumento para ver el gráfico.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStockStore } from '@/stores/stockStore';
import type { HistoryPoint } from '@/stores/stockStore';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale, // Import TimeScale
  Filler // For area below line
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the adapter

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale, // Register TimeScale
  Filler
);

const store = useStockStore();
const activeRange = ref('MAX'); // Default to 'MAX'

const chartDataReady = computed(() => store.selectedInstrumentHistory && store.selectedInstrumentHistory.length > 0);

const processedHistory = computed(() => {
  // For now, we'll use the full history. Filtering by activeRange will be added later.
  return store.selectedInstrumentHistory.slice().sort((a, b) => a.datetimeLastPriceTs - b.datetimeLastPriceTs);
});

const chartData = computed(() => {
  if (!processedHistory.value || processedHistory.value.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }
  return {
    labels: processedHistory.value.map(point => new Date(point.datetimeLastPriceTs * 1000)), // Use timestamp for Date object
    datasets: [
      {
        label: store.selectedInstrumentDetails?.info?.shortName || store.selectedInstrumentId || 'Precio',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(52, 152, 219, 0)'); // Transparent at the bottom
          gradient.addColorStop(1, 'rgba(52, 152, 219, 0.5)'); // Semi-transparent blue at the top
          return gradient;
        },
        borderColor: '#3498db',
        borderWidth: 2,
        pointRadius: 0, // No points for a cleaner line
        pointHoverRadius: 5,
        data: processedHistory.value.map(point => point.lastPrice),
        tension: 0.1, // Smooths the line a bit
        fill: true // Fill area under the line
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as 'index',
  },
  scales: {
    x: {
      type: 'time' as 'time',
      time: {
        unit: 'day' as 'day', // Adjust based on data density (e.g., 'month', 'year')
        tooltipFormat: 'dd MMM yyyy HH:mm', // Format for tooltips
        displayFormats: {
          day: 'dd MMM yy' // Format for x-axis labels
        }
      },
      ticks: {
        color: '#bdc3c7',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10 // Adjust for density
      },
      grid: {
        color: 'rgba(189, 195, 199, 0.2)'
      }
    },
    y: {
      ticks: {
        color: '#bdc3c7',
        callback: function(value: string | number) {
          if (typeof value === 'number') {
            return value.toLocaleString(); // Format y-axis numbers
          }
          return value;
        }
      },
      grid: {
        color: 'rgba(189, 195, 199, 0.2)'
      }
    }
  },
  plugins: {
    legend: {
      display: false // Hiding legend as it's usually clear from context or title
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 14 },
      bodyFont: { size: 12 },
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
          }
          return label;
        }
      }
    }
  }
});

// Placeholder for time range logic
const setTimeRange = (range: string) => {
  activeRange.value = range;
  // console.log(`Time range set to: ${range}`);
  // Here you would typically filter 'processedHistory' or re-fetch data based on the range.
  // For now, it just sets the active button style.
};

watch(() => store.selectedInstrumentId, (newId) => {
  if (newId) {
    activeRange.value = 'MAX'; // Reset to MAX when instrument changes
  }
});

</script>

<style scoped>
.chart-component {
  height: 100%;
  padding: 15px;
  border: 1px solid #34495e;
  border-radius: 4px;
  background-color: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.1em;
}

.time-range-buttons button {
  margin-left: 5px;
  padding: 5px 10px;
  background-color: #34495e;
  color: #ecf0f1;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8em;
}

.time-range-buttons button:hover {
  background-color: #4a6572;
}

.time-range-buttons button.active {
  background-color: #5dade2; /* A lighter blue for active button */
  font-weight: bold;
}

.chart-container {
  flex-grow: 1;
  margin-top: 10px;
  position: relative;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  color: #7f8c8d;
}
</style>
