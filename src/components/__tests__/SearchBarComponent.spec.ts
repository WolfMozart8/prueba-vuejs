import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBarComponent from '../SearchBarComponent.vue';
import { useStockStore } from '@/stores/stockStore';

// Mock the debounce function
vi.mock('lodash', () => ({
  debounce: (fn: any) => fn
}));

describe('SearchBarComponent', () => {
  let wrapper: any;
  let store: ReturnType<typeof useStockStore>;

  const mockInstruments = [
    { id: 'AAPL', name: 'Apple Inc', lastPrice: 150.25, pctDay: 1.25, shortName: 'Apple' },
    { id: 'MSFT', name: 'Microsoft Corporation', lastPrice: 250.50, pctDay: -0.5, shortName: 'Microsoft' },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useStockStore();
    
    // Mock store getters and actions
    // Instead of trying to set the value directly
    // store.filteredInstruments = mockInstruments;  // This causes the error
    
    // Do this instead:
    vi.spyOn(store, 'filteredInstruments', 'get').mockReturnValue(mockInstruments);
    store.setSearchTerm = vi.fn();
    store.selectInstrument = vi.fn();
    
    wrapper = mount(SearchBarComponent, {
      global: {
        plugins: [createPinia()],
      },
    });
  });

  it('renders search input', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input').attributes('placeholder')).toBe('Busca un instrumento');
  });

  it('updates search term on input', async () => {
    const input = wrapper.find('input');
    await input.setValue('apple');
    expect(store.setSearchTerm).toHaveBeenCalledWith('apple');
  });

  it('shows search results when typing', async () => {
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').setValue('a');
    
    const results = wrapper.findAll('.search-result-item');
    expect(results.length).toBe(2);
    expect(results[0].text()).toContain('Apple Inc (AAPL)');
    expect(results[1].text()).toContain('Microsoft Corporation (MSFT)');
  });

  it('selects instrument on click', async () => {
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').setValue('a');
    
    const firstResult = wrapper.find('.search-result-item');
    await firstResult.trigger('mousedown');
    
    expect(store.selectInstrument).toHaveBeenCalledWith('AAPL');
    expect(wrapper.vm.searchTerm).toBe('');
    expect(wrapper.vm.showResults).toBe(false);
  });

  it('selects first result on enter', async () => {
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').setValue('a');
    await wrapper.find('input').trigger('keyup.enter');
    
    expect(store.selectInstrument).toHaveBeenCalledWith('AAPL');
    expect(wrapper.vm.searchTerm).toBe('');
    expect(wrapper.vm.showResults).toBe(false);
  });

  it('formats percentage correctly', () => {
    expect(wrapper.vm.formatPercentage(1.25)).toBe('+1.25%');
    expect(wrapper.vm.formatPercentage(-0.5)).toBe('-0.50%');
    expect(wrapper.vm.formatPercentage(0)).toBe('+0.00%');
  });
});
