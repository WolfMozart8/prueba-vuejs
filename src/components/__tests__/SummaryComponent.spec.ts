import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SummaryComponent from '../SummaryComponent.vue';
import { useStockStore } from '@/stores/stockStore';

describe('SummaryComponent', () => {
  let wrapper: any;
  let store: ReturnType<typeof useStockStore>;

  const mockDetails = {
    info: {
      name: 'Test Instrument',
      shortName: 'TEST',
      countryName: 'Chile',
      currencyName: 'Chilean Peso',
      currencySymbol: 'CLP',
      codeInstrument: 'TEST',
      marketName: 'Santiago Stock Exchange',
      hourOpen: '09:30:00',
      hourClose: '16:00:00',
      trading: true,
      exchangeRate: 1
    },
    price: {
      lastPrice: 125.5,
      datetimeLastPrice: '2024-06-04 15:30:00',
      openPrice: 125.5,
      closePrice: 124.75,
      datetimeClosePrice: '2024-06-04 16:00:00',
      performanceAbsolute: 3.05,
      performanceRelative: 2.5,
      bid: 125.4,
      bidVolume: 1000,
      bidDatetime: '2024-06-04 15:30:00',
      ask: 125.6,
      askVolume: 1500,
      askDatetime: '2024-06-04 15:30:00',
      volumeMoney: 1255000,
      accumulatedVolumeMoney: 12550000,
      volumeInstrument: 10000,
      accumulatedVolumeInstrument: 100000,
      tend: 'U',
      maxDay: 126.25,
      minDay: 124.0,
      min52W: 115.25,
      max52W: 135.5,
      pct30D: 2.5,
      pctRelW52: 8.2,
      pctRelCY: 5.3
    }
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useStockStore();
    
    // Mock store getters
    store.selectedInstrumentDetails = mockDetails;
    
    wrapper = mount(SummaryComponent, {
      global: {
        plugins: [createPinia()],
      },
    });
  });

  it('renders summary data correctly', () => {
    expect(wrapper.text()).toContain('Cotización:');
    expect(wrapper.text()).toContain('Santiago Stock Exchange');
    expect(wrapper.text()).toContain('125.50');
    expect(wrapper.text()).toContain('124.75');
  });

  it('formats numbers correctly', () => {
    expect(wrapper.vm.formatNumber(1234.5678)).toBe('1,234.57');
    expect(wrapper.vm.formatNumber(1234.5, 0)).toBe('1,235');
    expect(wrapper.vm.formatNumber(undefined)).toBe('-');
  });

  it('formats percentages correctly', () => {
    expect(wrapper.vm.formatPercentage(1.25)).toBe('+1.25%');
    expect(wrapper.vm.formatPercentage(-0.5)).toBe('-0.50%');
    expect(wrapper.vm.formatPercentage(undefined)).toBe('-');
  });

  it('formats date time correctly', () => {
    expect(wrapper.vm.formatDateTime('2024-06-04 15:30:00')).toContain('04/06/2024');
    expect(wrapper.vm.formatDateTime(undefined)).toBe('-');
  });

  it('applies correct performance classes', () => {
    expect(wrapper.vm.getPerformanceClass(1.25)).toBe('positive');
    expect(wrapper.vm.getPerformanceClass(-0.5)).toBe('negative');
    expect(wrapper.vm.getPerformanceClass(0)).toBe('');
    expect(wrapper.vm.getPerformanceClass(undefined)).toBe('');
  });

  it('shows loading state when no details', async () => {
    store.selectedInstrumentDetails = null;
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain('Loading summary data');
  });

  it('switches between tabs', async () => {
    const buttons = wrapper.findAll('.tabs button');
    expect(buttons.length).toBe(2);
    
    // Initial active tab
    expect(buttons[0].classes()).toContain('active');
    
    // Click on second tab
    await buttons[1].trigger('click');
    expect(wrapper.vm.activeView).toBe('detalles');
    expect(buttons[1].classes()).toContain('active');
  });
});
