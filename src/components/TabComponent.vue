<template>
  <div class="tab-component">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="{ active: activeTab === tab.id }"
      @click="setActiveTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStockStore } from '@/stores/stockStore';

export default defineComponent({
  name: 'TabComponent',
  setup() {
    const store = useStockStore();
    
    const tabs = [
      { id: 'IPSA', label: 'IPSA' },
      { id: 'IGPA', label: 'IGPA' },
      { id: 'NASDAQ', label: 'NASDAQ' },
      { id: 'DOW JONES', label: 'DOW JONES' },
      { id: 'SP/BVL', label: 'SP/BVL' },
    ];

    const activeTab = computed(() => store.activeTab);

    const setActiveTab = (tabId: string) => {
      if (tabId === 'IPSA') {
        store.setActiveTab(tabId);
      } else {
        alert('No hay información para la opción seleccionada');
      }
    };

    return {
      tabs,
      activeTab,
      setActiveTab,
    };
  },
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
