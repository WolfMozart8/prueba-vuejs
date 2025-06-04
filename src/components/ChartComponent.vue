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
      <Line 
        :key="'chart-' + activeRange"
        :data="chartData" 
        :options="chartOptions" 
      />
    </div>
    <div v-else class="loading-placeholder">
      <p v-if="store.selectedInstrumentId">Cargando datos del gráfico...</p>
      <p v-else>Seleccione un instrumento para ver el gráfico.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
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
type TimeRange = '1D' | '1S' | '1M' | '3M' | '6M' | '1A' | '5A';
const activeRange = ref<TimeRange>('1A');

const chartDataReady = computed(() => store.selectedInstrumentHistory && store.selectedInstrumentHistory.length > 0);

const processedHistory = computed(() => {
  if (!store.selectedInstrumentHistory || store.selectedInstrumentHistory.length === 0) {
    return [];
  }
  
  // Create a copy of the history and sort it by timestamp
  const sortedHistory = [...store.selectedInstrumentHistory].sort(
    (a, b) => a.datetimeLastPriceTs - b.datetimeLastPriceTs
  );
  
  const totalPoints = sortedHistory.length;
  if (totalPoints === 0) return [];
  
  const latestTimestamp = sortedHistory[sortedHistory.length - 1].datetimeLastPriceTs;
  
  // Handle 1D view specially - show last 24 hours of data
  if (activeRange.value === '1D') {
    const oneDayAgo = latestTimestamp - 86400; // 24 hours in seconds
    const lastDayData = sortedHistory.filter(point => point.datetimeLastPriceTs >= oneDayAgo);
    
    // If we have at least 2 points in the last 24 hours, return them
    // Otherwise, return the last 2 points to ensure we have a line
    return lastDayData.length >= 2 ? lastDayData : sortedHistory.slice(-2);
  }
  
  // For other ranges, use the point-based approach
  const pointsToShow = {
    '1S': 5,       // Last 5 points for 1 week
    '1M': 20,      // Last 20 points for 1 month
    '3M': 60,      // Last 60 points for 3 months
    '6M': 120,     // Last 120 points for 6 months
    '1A': 250,     // Last 250 points for 1 year
    '5A': Infinity // All points for 5 years
  };
  
  // Get the number of points to show for the active range
  const pointCount = pointsToShow[activeRange.value] || totalPoints;
  
  // Return the last N points
  return sortedHistory.slice(-pointCount);
  
  // Debug: Log the current range and points being shown
  const result = sortedHistory.slice(-pointCount);
  console.log('Time Range:', activeRange.value);
  console.log('Showing', result.length, 'of', totalPoints, 'points');
  if (result.length > 0) {
    console.log('First point shown:', {
      date: new Date(result[0].datetimeLastPriceTs * 1000).toISOString(),
      price: result[0].lastPrice
    });
    console.log('Last point shown:', {
      date: new Date(result[result.length - 1].datetimeLastPriceTs * 1000).toISOString(),
      price: result[result.length - 1].lastPrice
    });
  }
  
  return result;
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

const setTimeRange = async (range: TimeRange) => {
  if (activeRange.value === range) return; // Skip if already selected
  
  activeRange.value = range;
  
  // Force a small delay to ensure the chart updates properly
  await nextTick();
  
  // Force a re-fetch of the history data with the new range
  if (store.selectedInstrumentId) {
    // Clear the cache for this instrument to force a re-fetch
    delete store.historyCache[store.selectedInstrumentId];
    await store.fetchHistory(store.selectedInstrumentId);
  }
};

watch(() => store.selectedInstrumentId, (newId) => {
  if (newId) {
    activeRange.value = '1A'; // Reset to MAX when instrument changes
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
