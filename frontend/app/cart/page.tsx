"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function CartPage() {
  const {
    cart,
    isLoading,
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      alert("Item removed from cart");
    } catch (error: any) {
      alert("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    try {
      await clearCart();
      alert("Cart cleared");
    } catch (error: any) {
      alert("Failed to clear cart");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="h-24 w-24 text-stone-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-stone-600 mb-8">
            You need to be signed in to view your cart
          </p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-200 rounded-xl h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="container-custom py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ShoppingBagIcon className="h-24 w-24 text-stone-300 mx-auto mb-6" />
            <h1
              className="text-3xl font-bold text-stone-900 mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Your Cart is Empty
            </h1>
            <p className="text-stone-600 mb-8">
              Looks like you haven't added any spices to your cart yet.
            </p>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-stone-900"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Shopping Cart
            </h1>
            <p className="text-stone-600 mt-1">
              {cart.total_items} {cart.total_items === 1 ? "item" : "items"} in
              your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
                      🌿
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-medium text-stone-900 hover:text-primary-600 transition line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-stone-500 mt-1">{item.unit}</p>
                      <p className="text-lg font-bold text-stone-900 mt-1">
                        LKR {item.unit_price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-stone-100 transition disabled:opacity-50"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 font-medium min-w-[2.5rem] text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-stone-100 transition"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-stone-400 hover:text-red-600 transition"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-stone-500">Subtotal</p>
                      <p className="font-bold text-stone-900">
                        LKR {item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-primary-600 transition mt-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-24"
            >
              <h2 className="text-xl font-bold text-stone-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">
                    LKR {cart.total_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Delivery</span>
                  <span className="text-stone-500">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="font-bold text-lg text-stone-900">
                    LKR {cart.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full text-center block"
              >
                Proceed to Checkout
              </Link>

              {cart.total_amount < 5000 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-700">
                    Add LKR {(5000 - cart.total_amount).toLocaleString()} more
                    for free delivery in Colombo!
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
