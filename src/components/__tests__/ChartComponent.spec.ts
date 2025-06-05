import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import ChartComponent from '../ChartComponent.vue';
import { useStockStore } from '@/stores/stockStore';
import { nextTick } from 'vue';

// Mock the vue-chartjs components
vi.mock('vue-chartjs', () => ({
  Line: {
    template: '<div class="mocked-line-chart"></div>',
  },
}));

// Mock ChartJS
vi.mock('chart.js', () => {
  const mockRegister = vi.fn();
  return {
    Chart: {
      register: mockRegister,
    },
    registerables: [],
    _adapters: {
      _date: {
        parse: vi.fn(),
        format: vi.fn(),
        add: vi.fn(),
      },
    },
    CategoryScale: class {},
    LinearScale: class {},
    PointElement: class {},
    LineElement: class {},
    Title: class {},
    Tooltip: class {},
    Legend: class {},
    TimeScale: class {},
    Filler: class {},
  };
});

describe('ChartComponent', () => {
  let wrapper: any;
  let store: ReturnType<typeof useStockStore>;

  const mockHistory = [
    {
      datetimeLastPrice: '2024-01-01 10:00:00',
      datetimeLastPriceTs: 1704103200,
      lastPrice: 100.5,
      highPrice: 101.2,
      lowPrice: 100.2,
      openPrice: 100.8,
      closePrice: 100.5,
      volume: 1000,
      volumeMoney: 100500,
      performanceRelative: 0.5,
      performanceAbsolute: 0.5,
      tend: 'up',
    },
    {
      datetimeLastPrice: '2024-01-02 10:00:00',
      datetimeLastPriceTs: 1704189600,
      lastPrice: 101.2,
      highPrice: 101.5,
      lowPrice: 100.5,
      openPrice: 100.5,
      closePrice: 101.2,
      volume: 1200,
      volumeMoney: 121440,
      performanceRelative: 0.7,
      performanceAbsolute: 0.7,
      tend: 'up',
    },
  ];

  const createMockInstrumentDetails = () => ({
    info: {
      name: 'Apple Inc',
      shortName: 'Apple',
      countryName: 'United States',
      currencyName: 'US Dollar',
      currencySymbol: '$',
      codeInstrument: 'AAPL',
      marketName: 'NASDAQ',
      hourOpen: '09:30:00',
      hourClose: '16:00:00',
      trading: true,
      exchangeRate: 1.0
    },
    price: {
      lastPrice: 101.2,
      datetimeLastPrice: '2024-06-04 15:30:00',
      openPrice: 100.5,
      closePrice: 101.0,
      datetimeClosePrice: '2024-06-04 16:00:00',
      performanceAbsolute: 0.7,
      performanceRelative: 0.7,
      bid: 101.1,
      bidVolume: 1000,
      bidDatetime: '2024-06-04 15:30:00',
      ask: 101.3,
      askVolume: 1500,
      askDatetime: '2024-06-04 15:30:00',
      volumeMoney: 1000000,
      accumulatedVolumeMoney: 5000000,
      volumeInstrument: 10000,
      accumulatedVolumeInstrument: 50000,
      tend: 'up',
      maxDay: 101.5,
      minDay: 100.2,
      min52W: 85.3,
      max52W: 102.1,
      pct30D: 2.5,
      pctRelW52: 15.2,
      pctRelCY: 10.5
    },
  });

  beforeEach(async () => {
    setActivePinia(createPinia());
    store = useStockStore();
    
    // Mock store properties
    store.selectedInstrumentId = 'AAPL';
    store.selectedInstrumentDetails = createMockInstrumentDetails();
    store.selectedInstrumentHistory = [];
    
    wrapper = mount(ChartComponent, {
      global: {
        plugins: [createPinia()],
        stubs: {
          Line: true,
        },
      },
    });
    
    await nextTick();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when no history data', () => {
    expect(wrapper.text()).toContain('Cargando datos del gráfico');
  });

  it('renders chart when history data is available', async () => {
    store.selectedInstrumentHistory = mockHistory;
    await nextTick();
    expect(wrapper.find('.mocked-line-chart').exists()).toBe(true);
  });

  it('shows instrument name in the header', async () => {
    store.selectedInstrumentDetails = createMockInstrumentDetails();
    await nextTick();
    expect(wrapper.find('h3').text()).toContain('Apple Inc');
  });

  it('shows "Seleccione un instrumento" when no instrument is selected', async () => {
    store.selectedInstrumentId = null;
    store.selectedInstrumentDetails = null;
    await nextTick();
    expect(wrapper.text()).toContain('Seleccione un instrumento');
  });

  it('renders time range buttons', () => {
    const buttons = wrapper.findAll('.time-range-buttons button');
    expect(buttons.length).toBe(7);
    const buttonTexts = buttons.map((btn: any) => btn.text());
    expect(buttonTexts).toEqual(['1D', '1S', '1M', '3M', '6M', '1A', '5A']);
  });

  it('changes active time range when a button is clicked', async () => {
    const buttons = wrapper.findAll('.time-range-buttons button');
    expect(buttons[5].classes()).toContain('active');
    await buttons[2].trigger('click');
    expect(buttons[2].classes()).toContain('active');
    expect(buttons[5].classes()).not.toContain('active');
  });

  it('processes history data correctly for different time ranges', async () => {
    store.selectedInstrumentHistory = mockHistory;
    await nextTick();
    
    await wrapper.vm.setTimeRange('1D');
    expect(wrapper.vm.activeRange).toBe('1D');
    
    await wrapper.vm.setTimeRange('1S');
    expect(wrapper.vm.activeRange).toBe('1S');
    
    await wrapper.vm.setTimeRange('1M');
    expect(wrapper.vm.activeRange).toBe('1M');
  });

  it('resets to 1A range when instrument changes', async () => {
    await wrapper.vm.setTimeRange('1M');
    expect(wrapper.vm.activeRange).toBe('1M');
    
    store.selectedInstrumentId = 'MSFT';
    await nextTick();
    
    expect(wrapper.vm.activeRange).toBe('1A');
  });

  it('handles empty history data gracefully', async () => {
    store.selectedInstrumentHistory = [];
    await nextTick();
    expect(wrapper.vm.chartDataReady).toBe(false);
    expect(wrapper.text()).toContain('Cargando datos del gráfico');
  });
});
