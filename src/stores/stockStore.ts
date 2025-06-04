import { defineStore } from 'pinia';

// Define interfaces for your data structures based on JSON files
export interface ConstituentInstrument {
  codeInstrument: string;
  name: string;
  shortName: string;
  pctDay: number;
  pct30D: number;
  pctCY: number;
  pct1Y: number;
  lastPrice: number;
  datetimeLastPrice: string;
  volumeMoney: number;
  accumulatedVolumeMoney: number;
  tend: string;
  performanceAbsolute: number;
  performanceRelative: number;
}

// This will be the primary instrument type used in the store's `instruments` array
export interface Instrument {
  id: string; // Will map from codeInstrument
  name: string; // Will map from name or shortName
  shortName: string;
  lastPrice: number;
  pctDay: number;
  // Add other fields from ConstituentInstrument as needed for display in InstrumentListComponent
  volumeMoney?: number; // Example: Monto (MM) might be this or accumulatedVolumeMoney
  pct30D?: number;
  pctCY?: number;
  pct1Y?: number;
}

export interface InstrumentInfoSummary {
  name: string;
  shortName: string;
  countryName: string;
  currencyName: string;
  currencySymbol: string;
  codeInstrument: string;
  marketName: string;
  hourOpen: string;
  hourClose: string;
  trading: boolean;
  exchangeRate: number;
}

export interface InstrumentPriceSummary {
  lastPrice: number;
  datetimeLastPrice: string;
  openPrice: number;
  closePrice: number;
  datetimeClosePrice: string;
  performanceAbsolute: number;
  performanceRelative: number;
  bid: number;
  bidVolume: number;
  bidDatetime: string;
  ask: number;
  askVolume: number;
  askDatetime: string;
  volumeMoney: number;
  accumulatedVolumeMoney: number;
  volumeInstrument: number;
  accumulatedVolumeInstrument: number;
  tend: string;
  maxDay: number;
  minDay: number;
  min52W: number;
  max52W: number;
  pct30D: number;      // Variation 1 Mes
  pctRelW52: number;   // Variation 1 Año
  pctRelCY: number;    // Variation Año a la Fecha
}

export interface InstrumentDetail {
  info: InstrumentInfoSummary;
  price: InstrumentPriceSummary;
}

export interface HistoryPoint {
  datetimeLastPrice: string;
  datetimeLastPriceTs: number;
  lastPrice: number;
  highPrice?: number;
  lowPrice?: number;
  openPrice?: number;
  closePrice?: number;
  volume?: number;
  volumeMoney?: number;
  performanceRelative?: number;
  performanceAbsolute?: number;
  tend?: string;
}

export const useStockStore = defineStore('stock', {
  state: () => ({
    searchTerm: '',
    instruments: [] as Instrument[], // This will hold the list for the active tab, mapped to Instrument interface
    selectedInstrumentId: null as string | null,
    selectedInstrumentDetails: null as InstrumentDetail | null,
    selectedInstrumentHistory: [] as HistoryPoint[],
    rawConstituents: [] as ConstituentInstrument[], // Holds raw data from constituensList.json's data.constituents array
    allSummaries: {} as Record<string, InstrumentDetail>, // Cache for summaries
    historyCache: {} as Record<string, HistoryPoint[]>, // Cache for histories
    activeTab: 'IPSA', // Default active tab, matches info.name in constituensList.json
    currentMarketInfo: null as any, // To store data.info from constituensList.json
  }),
  getters: {
    filteredInstruments: (state) => {
      if (!state.searchTerm) {
        return state.instruments;
      }
      const searchTerm = state.searchTerm.toLowerCase();
      return state.instruments.filter(instrument => 
        instrument.name.toLowerCase().includes(searchTerm) || 
        (instrument.shortName && instrument.shortName.toLowerCase().includes(searchTerm))
      );
    },
    currentInstrumentDetails: (state) => state.selectedInstrumentDetails,
    currentInstrumentHistory: (state) => state.selectedInstrumentHistory,
  },
  actions: {
    async fetchConstituents() {
      try {
        const module = await import('@/assets/data/json-VueJS/constituyentes/constituensList.json');
        const jsonData = module.default || module;
        if (jsonData && jsonData.success && jsonData.data && jsonData.data.constituents) {
          this.rawConstituents = jsonData.data.constituents;
          this.currentMarketInfo = jsonData.data.info; // Store market info (IPSA, Chile etc.)
          // Initially, populate instruments with IPSA constituents
          this.filterInstrumentsByTab(this.activeTab);
        } else {
          console.error('Constituents data is not in the expected format:', jsonData);
          this.rawConstituents = [];
        }
      } catch (error) {
        console.error('Error fetching constituents:', error);
        this.rawConstituents = [];
      }
    },

    async fetchSummary(instrumentId: string) {
      if (this.allSummaries[instrumentId]) {
        this.selectedInstrumentDetails = this.allSummaries[instrumentId];
        return;
      }
      try {
        const module = await import(`@/assets/data/json-VueJS/resumen/${instrumentId}.json`);
        const jsonData = module.default || module;
        if (jsonData && jsonData.success && jsonData.data) {
          const summaryData: InstrumentDetail = jsonData.data;
          this.allSummaries[instrumentId] = summaryData;
          this.selectedInstrumentDetails = summaryData;
        } else {
          console.error(`Summary data for ${instrumentId} is not in the expected format:`, jsonData);
          this.selectedInstrumentDetails = null;
        }
      } catch (error) {
        console.error(`Error fetching summary for ${instrumentId}:`, error);
        this.selectedInstrumentDetails = null;
      }
    },

    async fetchHistory(instrumentId: string) {
      if (this.selectedInstrumentHistory.length > 0 && this.selectedInstrumentId === instrumentId && this.historyCache[instrumentId]) {
        // console.log('Using cached history for:', instrumentId);
        this.selectedInstrumentHistory = this.historyCache[instrumentId];
        return;
      }
      try {
        // console.log(`Fetching history for ${instrumentId}...`);
        const module = await import(`@/assets/data/json-VueJS/history/history-${instrumentId.toUpperCase()}.json`);
        const jsonData = module.default || module;
        if (jsonData && jsonData.success && jsonData.data && jsonData.data.chart) {
          this.selectedInstrumentHistory = jsonData.data.chart.map((point: any) => ({
            datetimeLastPrice: point.datetimeLastPrice,
            datetimeLastPriceTs: point.datetimeLastPriceTs,
            lastPrice: point.lastPrice,
            highPrice: point.highPrice,
            lowPrice: point.lowPrice,
            openPrice: point.openPrice,
            closePrice: point.closePrice,
            volume: point.volume,
            volumeMoney: point.volumeMoney,
            performanceRelative: point.performanceRelative,
            performanceAbsolute: point.performanceAbsolute,
            tend: point.tend
          }));
          this.historyCache[instrumentId] = this.selectedInstrumentHistory;
          // console.log(`History fetched for ${instrumentId}:`, this.selectedInstrumentHistory.length, "points");
        } else {
          this.selectedInstrumentHistory = [];
          // console.warn(`No history data found or incorrect structure for ${instrumentId}`);
        }
      } catch (error) {
        // console.error(`Failed to fetch history for ${instrumentId}:`, error);
        this.selectedInstrumentHistory = [];
      }
    },

    selectInstrument(instrumentId: string | null) {
      if (instrumentId && this.selectedInstrumentId !== instrumentId) {
        this.selectedInstrumentId = instrumentId;
        this.fetchSummary(instrumentId);
        this.fetchHistory(instrumentId); // Ensure history is fetched
      } else if (instrumentId === null) {
        this.selectedInstrumentId = null;
        this.selectedInstrumentDetails = null;
        this.selectedInstrumentHistory = [];
      }
    },

    setSearchTerm(term: string) {
      this.searchTerm = term;
    },
    
    setActiveTab(tabName: string) {
      this.activeTab = tabName;
      // Logic to filter/fetch instruments based on the new tab
      this.filterInstrumentsByTab(tabName);
      // Optionally, select the first instrument of the new tab or a default one
      if (this.instruments.length > 0) {
        this.selectInstrument(this.instruments[0].id || tabName); // Assuming tabName can be an instrument ID like 'IPSA'
      } else {
        this.selectInstrument(tabName); // Fallback to tabName itself if it's an instrument (e.g. IPSA)
      }
    },

    // Populates this.instruments based on the active tab and rawConstituents
    filterInstrumentsByTab(tabName: string) {
      // Currently, constituensList.json seems specific to IPSA (based on data.info.name)
      // If other tabs require different lists, this logic will need to expand
      // (e.g., load different files or filter a larger dataset if available)
      if (tabName === 'IPSA' && this.rawConstituents.length > 0) {
        this.instruments = this.rawConstituents.map((item: ConstituentInstrument) => ({
          id: item.codeInstrument,
          name: item.name,
          shortName: item.shortName,
          lastPrice: item.lastPrice,
          pctDay: item.pctDay,
          // Map other fields needed for InstrumentListComponent
          // accumulatedVolumeMoney is large, volumeMoney might be daily. Assuming 'Monto (MM)' refers to daily volume in millions.
          // The JSON gives volumeMoney, let's use that for now. Display formatting (like 'MM') will be in the component.
          volumeMoney: item.volumeMoney, 
          pct30D: item.pct30D,
          pctCY: item.pctCY, // Año Actual
          pct1Y: item.pct1Y, // 12 Meses
        }));
      } else {
        // Placeholder for other tabs like IGPA, NASDAQ, etc.
        // You would need to fetch their respective constituent lists here.
        console.warn(`Constituent data for tab ${tabName} is not yet implemented.`);
        this.instruments = [];
      }
    }
  }
});
