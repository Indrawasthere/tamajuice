import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (product, quantity = 1, notes = '') => {
    const existingItemIndex = get().items.findIndex(
      item => item.product.id === product.id && item.notes === notes
    );

    if (existingItemIndex > -1) {
      const newItems = [...get().items];
      newItems[existingItemIndex].quantity += quantity;
      set({ items: newItems });
    } else {
      set({
        items: [...get().items, { product, quantity, notes }]
      });
    }
  },

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }

    const newItems = [...get().items];
    newItems[index].quantity = quantity;
    set({ items: newItems });
  },

  updateNotes: (index, notes) => {
    const newItems = [...get().items];
    newItems[index].notes = notes;
    set({ items: newItems });
  },

  removeItem: (index) => {
    set({
      items: get().items.filter((_, i) => i !== index)
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
