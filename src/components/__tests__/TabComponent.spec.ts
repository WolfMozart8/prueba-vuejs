import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TabComponent from '../TabComponent.vue';
import { useStockStore } from '@/stores/stockStore';

describe('TabComponent', () => {
  let wrapper: any;
  let store: ReturnType<typeof useStockStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useStockStore();
    
    // Mock store action
    store.setActiveTab = vi.fn();
    
    wrapper = mount(TabComponent, {
      global: {
        plugins: [createPinia()],
      },
    });
  });

  it('renders all tab buttons', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(5);
    
    const buttonTexts = buttons.map((button: any) => button.text());
    expect(buttonTexts).toEqual([
      'IPSA',
      'IGPA',
      'NASDAQ',
      'DOW JONES',
      'SP/BVL'
    ]);
  });

  it('has the first tab active by default', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons[0].classes()).toContain('active');
    
    // Other buttons should not have active class
    for (let i = 1; i < buttons.length; i++) {
      expect(buttons[i].classes()).not.toContain('active');
    }
  });

  // it('calls setActiveTab when a tab is clicked', async () => {
  //   const buttons = wrapper.findAll('button');
    
  //   // Click on the second tab
  //   await buttons[1].trigger('click');
    
  //   // Check if the store action was called with the correct tab name
  //   expect(store.setActiveTab).toHaveBeenCalledWith('IGPA');
    
  //   // The active class should be updated in the UI
  //   expect(buttons[1].classes()).toContain('active');
  //   expect(buttons[0].classes()).not.toContain('active');
  // });

  // it('updates active tab when store changes', async () => {
  //   // Simulate store update
  //   store.activeTab = 'NASDAQ';
  //   await wrapper.vm.$nextTick();
    
  //   const buttons = wrapper.findAll('button');
    
  //   // The third button (index 2) should be active now
  //   expect(buttons[2].classes()).toContain('active');
    
  //   // Other buttons should not be active
  //   for (let i = 0; i < buttons.length; i++) {
  //     if (i !== 2) {
  //       expect(buttons[i].classes()).not.toContain('active');
  //     }
  //   }
  // });

  // it('applies correct styling to active tab', () => {
  //   const activeButton = wrapper.find('button.active');
    
  //   // Check if the active button exists and has the active class
  //   expect(activeButton.exists()).toBe(true);
  //   expect(activeButton.classes()).toContain('active');
    
  //   // Check for inline styles if they are used, or check for classes if using CSS modules/scoped styles
  //   const style = activeButton.attributes('style') || '';
  //   expect(style).toContain('border-bottom: 2px solid #2ecc71');
  //   expect(style).toContain('color: #ecf0f1');
  // });
});
