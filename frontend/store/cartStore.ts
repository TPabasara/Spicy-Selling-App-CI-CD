import { create } from "zustand";
import { Cart } from "@/types";
import { cartAPI } from "../lib/api";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartAPI.getCart();
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch cart",
        isLoading: false,
      });
    }
  },

  addToCart: async (productId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartAPI.addToCart(productId, quantity);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to add to cart",
        isLoading: false,
      });
      throw error;
    }
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartAPI.updateCartItem(itemId, quantity);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to update cart",
        isLoading: false,
      });
      throw error;
    }
  },

  removeFromCart: async (itemId: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartAPI.removeFromCart(itemId);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to remove item",
        isLoading: false,
      });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartAPI.clearCart();
      set({ cart: null, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to clear cart",
        isLoading: false,
      });
    }
  },

  getCartCount: () => {
    const cart = get().cart;
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
}));
