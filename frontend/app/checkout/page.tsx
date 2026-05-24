"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ordersAPI } from "@/lib/api";
import { DeliveryCost } from "@/types";
import {
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const DELIVERY_ZONES = [
  { value: "colombo", label: "Colombo (LKR 300)" },
  { value: "suburbs", label: "Suburbs (LKR 500)" },
  { value: "outstation", label: "Outstation (LKR 800)" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_phone: "",
    delivery_zone: "colombo",
    notes: "",
  });

  const [deliveryCost, setDeliveryCost] = useState<DeliveryCost | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shipping_address: user.address || "",
        shipping_city: user.city || "",
        shipping_phone: user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart && formData.delivery_zone) {
      calculateDelivery();
    }
  }, [formData.delivery_zone, cart?.total_amount]);

  const calculateDelivery = async () => {
    if (!cart) return;
    try {
      const cost = await ordersAPI.getDeliveryCost(
        formData.delivery_zone,
        cart.total_amount,
      );
      setDeliveryCost(cost);
    } catch (error) {
      console.error("Error calculating delivery:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await ordersAPI.createOrder(formData);
      alert("Order placed successfully!");
      await fetchCart();
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to place order");
    } finally {
      setIsSubmitting(false);
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
            You need to be signed in to checkout
          </p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="container-custom py-20 text-center">
          <ShoppingBagIcon className="h-24 w-24 text-stone-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            Your Cart is Empty
          </h1>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Checkout
          </h1>
          <p className="text-stone-600 mt-1">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TruckIcon className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-stone-900">
                      Shipping Information
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        name="shipping_address"
                        required
                        value={formData.shipping_address}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="123 Spice Street, Colombo 01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shipping_city"
                        required
                        value={formData.shipping_city}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Colombo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="shipping_phone"
                        required
                        value={formData.shipping_phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+94 77 123 4567"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Delivery Zone *
                      </label>
                      <select
                        name="delivery_zone"
                        value={formData.delivery_zone}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        {DELIVERY_ZONES.map((zone) => (
                          <option key={zone.value} value={zone.value}>
                            {zone.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-field"
                        placeholder="Any special instructions for delivery..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCardIcon className="h-5 w-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-stone-900">
                      Payment Method
                    </h2>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked
                        readOnly
                        className="text-primary-600"
                      />
                      <div>
                        <p className="font-medium text-stone-900">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-stone-500">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-stone-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      LKR {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">
                    LKR {cart.total_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Delivery Fee</span>
                  <span
                    className={`font-medium ${deliveryCost?.is_free_delivery ? "text-green-600" : ""}`}
                  >
                    {deliveryCost?.is_free_delivery
                      ? "FREE"
                      : `LKR ${deliveryCost?.delivery_fee.toLocaleString() || "---"}`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    LKR{" "}
                    {deliveryCost?.total_with_delivery.toLocaleString() ||
                      cart.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {deliveryCost && !deliveryCost.is_free_delivery && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-700">
                    Add LKR {(5000 - cart.total_amount).toLocaleString()} more
                    for free delivery!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
