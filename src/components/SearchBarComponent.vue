<template>
  <div class="search-bar-component">
    <input
      v-model="searchTerm"
      type="text"
      placeholder="Busca un instrumento"
      @input="onSearchInput"
      @keyup.enter="selectFirstResult"
      @focus="showResults = true"
      @blur="onBlur"
    />
    <div v-if="showResults && filteredInstruments.length > 0" class="search-results">
      <div
        v-for="instrument in filteredInstruments"
        :key="instrument.id"
        class="search-result-item"
        @mousedown="selectInstrument(instrument)"
      >
        <div class="instrument-name">{{ instrument.name }} ({{ instrument.id }})</div>
        <div
          class="instrument-price"
          :class="{ positive: instrument.pctDay > 0, negative: instrument.pctDay < 0 }"
        >
          {{ instrument.lastPrice?.toFixed(2) }}
          <span class="price-change">{{ formatPercentage(instrument.pctDay) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useStockStore } from '@/stores/stockStore'
import { debounce } from 'lodash'

export default defineComponent({
  name: 'SearchBarComponent',

  setup() {
    const store = useStockStore()
    const searchTerm = ref('')
    const showResults = ref(false)

    // Debounce the search input to avoid too many store updates
    const debouncedSearch = debounce((term: string) => {
      store.setSearchTerm(term)
    }, 300)

    const onSearchInput = () => {
      debouncedSearch(searchTerm.value)
    }

    const selectInstrument = (instrument: any) => {
      store.selectInstrument(instrument.id)
      searchTerm.value = ''
      showResults.value = false
    }

    const selectFirstResult = () => {
      if (filteredInstruments.value.length > 0) {
        selectInstrument(filteredInstruments.value[0])
      }
    }

    const onBlur = () => {
      // Small delay to allow click events to fire before hiding results
      setTimeout(() => {
        showResults.value = false
      }, 200)
    }

    const formatPercentage = (value: number | undefined) => {
      if (value === undefined) return ''
      const prefix = value > 0 ? '+' : ''
      return `${prefix}${value.toFixed(2)}%`
    }

    const filteredInstruments = computed(() => {
      // Get the first 5 matching instruments
      return store.filteredInstruments.slice(0, 5)
    })

    return {
      searchTerm,
      showResults,
      filteredInstruments,
      onSearchInput,
      selectInstrument,
      selectFirstResult,
      onBlur,
      formatPercentage,
    }
  },
})
</script>

<style scoped>
.search-bar-component {
  position: relative;
  padding: 10px;
  background-color: #2c3e50;
  z-index: 1000;
}

input {
  width: 100%;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #34495e;
  background-color: #34495e;
  color: #ecf0f1;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 10px;
  right: 10px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #2c3e50;
  border: 1px solid #34495e;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.search-result-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #34495e;
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #34495e;
}

.instrument-name {
  font-weight: 500;
  color: #ecf0f1;
  margin-right: 10px;
}

.instrument-price {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.positive {
  color: #2ecc71;
}

.negative {
  color: #e74c3c;
}

.price-change {
  font-size: 0.9em;
  margin-left: 5px;
  opacity: 0.9;
}

/* Scrollbar styling */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #2c3e50;
}

.search-results::-webkit-scrollbar-thumb {
  background-color: #34495e;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #4a6b8a;
}
</style>
