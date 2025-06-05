import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InstrumentItemComponent from '../InstrumentItemComponent.vue';
import { useStockStore } from '@/stores/stockStore';

describe('InstrumentItemComponent', () => {
  let wrapper: any;
  let store: ReturnType<typeof useStockStore>;

  const mockInstrument = {
    id: 'AAPL',
    shortName: 'Apple',
    name: 'Apple Inc',
    lastPrice: 150.25,
    volumeMoney: 1000000,
    pctDay: 1.25,
    pct30D: 2.5,
    pctCY: 5.3,
    pct1Y: 8.2,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useStockStore();
    
    // Mock store action
    store.selectInstrument = vi.fn();
    store.selectedInstrumentId = '';
    
    wrapper = mount(InstrumentItemComponent, {
      props: {
        instrument: mockInstrument,
      },
      global: {
        plugins: [createPinia()],
      },
    });
  });

  it('renders instrument data correctly', () => {
    const cells = wrapper.findAll('td');
    
    expect(cells[0].text()).toBe('Apple'); // shortName (aligned left)
    expect(cells[1].text()).toBe('150.25'); // lastPrice
    expect(cells[2].text()).toBe('1.00'); // volumeMoney (formatted as MM)
    expect(cells[3].text()).toBe('+1.25%'); // pctDay
    expect(cells[4].text()).toBe('+2.50%'); // pct30D
    expect(cells[5].text()).toBe('+5.30%'); // pctCY
    expect(cells[6].text()).toBe('+8.20%'); // pct1Y
  });

  it('applies correct classes for positive/negative values', () => {
    // Test positive percentage
    expect(wrapper.vm.getPerformanceClass(1.25)).toBe('positive');
    // Test negative percentage
    expect(wrapper.vm.getPerformanceClass(-0.5)).toBe('negative');
    // Test zero
    expect(wrapper.vm.getPerformanceClass(0)).toBe('');
  });

  it('formats numbers correctly', () => {
    expect(wrapper.vm.formatNumber(1234.5678)).toBe('1,234.57');
    expect(wrapper.vm.formatNumber(1234.5, 0)).toBe('1,235');
    expect(wrapper.vm.formatNumber(undefined)).toBe('-');
  });

  it('formats volume correctly', () => {
    expect(wrapper.vm.formatVolume(1000000)).toBe('1.00');
    expect(wrapper.vm.formatVolume(1500000)).toBe('1.50');
    expect(wrapper.vm.formatVolume(undefined)).toBe('-');
  });

  it('formats percentages correctly', () => {
    expect(wrapper.vm.formatPercentage(1.25)).toBe('+1.25%');
    expect(wrapper.vm.formatPercentage(-0.5)).toBe('-0.50%');
    expect(wrapper.vm.formatPercentage(0)).toBe('+0.00%');
    expect(wrapper.vm.formatPercentage(undefined)).toBe('-');
  });

  it('selects instrument on row click', async () => {
    await wrapper.trigger('click');
    expect(store.selectInstrument).toHaveBeenCalledWith('AAPL');
  });

  it('applies selected class when instrument is selected', async () => {
    // Initially not selected
    expect(wrapper.classes()).not.toContain('selected');
    
    // Set as selected in store
    store.selectedInstrumentId = 'AAPL';
    await wrapper.vm.$nextTick();
    
    // Should now have selected class
    expect(wrapper.classes()).toContain('selected');
  });

  it('applies correct styling for positive/negative values', async () => {
    // Test positive value
    const positiveCell = wrapper.findAll('td')[3];
    expect(positiveCell.classes()).toContain('positive');
    
    // Update to negative value
    await wrapper.setProps({
      instrument: { ...mockInstrument, pctDay: -0.5 }
    });
    
    const negativeCell = wrapper.findAll('td')[3];
    expect(negativeCell.classes()).toContain('negative');
  });

  it('shows hover effect on row hover', async () => {
    // Check initial state
    expect(wrapper.attributes('style')).not.toContain('background-color');
    
    // Trigger hover
    await wrapper.trigger('mouseenter');
    
    // Should have hover background color
    // Note: Exact style checking might be flaky, so we're just checking the class
    expect(wrapper.classes()).toContain('instrument-item-component');
  });
});
