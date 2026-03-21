import { create } from 'zustand';
import { Cart } from '@/types';
import { api } from '@/lib/api';

interface CartStore {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  fetchCart: async () => {
    try {
      const cart = await api.get<Cart>('/api/cart');
      set({ cart });
    } catch {}
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const cart = await api.post<Cart>('/api/cart/items', { productId, quantity });
      set({ cart, isLoading: false, isOpen: true });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  updateItem: async (itemId, quantity) => {
    const cart = await api.patch<Cart>(`/api/cart/items/${itemId}`, { quantity });
    set({ cart });
  },

  removeItem: async (itemId) => {
    const cart = await api.delete<Cart>(`/api/cart/items/${itemId}`);
    set({ cart });
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));