"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ordersAPI } from "@/lib/api";
import { Order } from "@/types";
import {
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const ORDER_STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: ClockIcon },
  { key: "confirmed", label: "Confirmed", icon: CheckCircleIcon },
  { key: "processing", label: "Processing", icon: ClockIcon },
  { key: "shipped", label: "Shipped", icon: TruckIcon },
  { key: "delivered", label: "Delivered", icon: CheckCircleIcon },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await ordersAPI.getOrder(parseInt(orderId));
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/4" />
          <div className="h-64 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">
          Order Not Found
        </h1>
        <Link href="/orders" className="btn-primary">
          View All Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.key === order.status,
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container-custom py-8">
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-stone-900"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Order #{order.order_number}
              </h1>
              <p className="text-stone-600 mt-1">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-primary-100 text-primary-700"
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">
            Order Status
          </h2>
          <div className="flex items-center justify-between">
            {ORDER_STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted =
                index <= currentStatusIndex && order.status !== "cancelled";
              const isCurrent = index === currentStatusIndex;

              return (
                <div
                  key={step.key}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted
                        ? "bg-primary-600 text-white"
                        : "bg-stone-200 text-stone-400"
                    } ${isCurrent ? "ring-4 ring-primary-200" : ""}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-xs text-center font-medium ${
                      isCompleted ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < ORDER_STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-full mt-5 ${
                        index < currentStatusIndex
                          ? "bg-primary-600"
                          : "bg-stone-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center text-2xl">
                        🌿
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-stone-500">
                          Quantity: {item.quantity} × LKR{" "}
                          {item.unit_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-stone-900">
                      LKR {item.subtotal.toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">
                  Shipping Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-stone-600">{order.shipping_address}</p>
                  <p className="text-stone-600">{order.shipping_city}</p>
                  <p className="text-stone-600">{order.shipping_phone}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span>LKR {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Delivery</span>
                  <span>
                    {order.delivery_fee === 0
                      ? "FREE"
                      : `LKR ${order.delivery_fee.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    LKR {order.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Payment</span>
                  <span
                    className={`font-medium ${
                      order.payment_status === "completed"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
