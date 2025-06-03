<template>
  <div id="app-layout">
    <SearchBarComponent />
    <HeaderComponent />
    <main class="main-content">
      <div class="chart-section">
        <ChartComponent />
      </div>
      <aside class="summary-section">
        <SummaryComponent />
      </aside>
    </main>
    <TabComponent />
    <InstrumentListComponent />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import SearchBarComponent from './components/SearchBarComponent.vue';
import HeaderComponent from './components/HeaderComponent.vue';
import ChartComponent from './components/ChartComponent.vue';
import SummaryComponent from './components/SummaryComponent.vue';
import TabComponent from './components/TabComponent.vue';
import InstrumentListComponent from './components/InstrumentListComponent.vue';
import { useStockStore } from './stores/stockStore';

const store = useStockStore();

onMounted(async () => {
  await store.fetchConstituents();
  // Select IPSA by default to load its summary and history if constituents were fetched
  if (store.rawConstituents.length > 0 || store.activeTab === 'IPSA') {
    // The 'IPSA' instrument itself (the index) needs summary/history
    // It might not be in the 'constituents' list but as a separate entity.
    // The files IPSA.json and history-IPSA.json suggest it's treated as an instrument.
    store.selectInstrument('IPSA'); 
  }
});

</script>

<style>
/* Global styles or import main.css if not already done in main.ts */
/* @import './assets/main.css'; */

body {
  background-color: #1e272e; /* Dark background for the app */
  color: #ecf0f1;
  font-family: 'Arial', sans-serif;
  margin: 0;
}

#app-layout {
  display: flex;
  flex-direction: column;
  max-width: 1280px; /* Consistent with main.css */
  margin: 0 auto;
  padding: 1rem; /* Adjusted padding */
}

.main-content {
  display: flex;
  gap: 20px; /* Space between chart and summary */
  margin-top: 20px;
  margin-bottom: 20px;
}

.chart-section {
  flex: 3; /* Chart takes more space */
}

.summary-section {
  flex: 1; /* Summary takes less space */
}

/* Add more specific styles as needed */
</style>
