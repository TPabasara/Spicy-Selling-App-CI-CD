"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Order } from "@/types";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
  confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircleIcon },
  processing: { color: "bg-purple-100 text-purple-800", icon: ClockIcon },
  shipped: { color: "bg-orange-100 text-orange-800", icon: TruckIcon },
  delivered: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircleIcon },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.getMyOrders(currentPage, 10);
      const filteredOrders =
        selectedStatus !== "all"
          ? response.items.filter((order) => order.status === selectedStatus)
          : response.items;
      setOrders(filteredOrders);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
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
            Sign in to view your order history
          </p>
          <Link href="/login" className="btn-primary">
            Sign In
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
            className="text-3xl font-bold text-stone-900 mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            My Orders
          </h1>
          <p className="text-stone-600">Track and manage your orders</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All Orders" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedStatus === tab.value
                  ? "bg-primary-600 text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100 border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-stone-200 rounded-xl h-32" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-stone-500">
                          Order #{order.order_number}
                        </p>
                        <p className="text-sm text-stone-400">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        <ChevronRightIcon className="h-5 w-5 text-stone-400 group-hover:text-primary-600 transition" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="w-10 h-10 bg-stone-100 rounded-full border-2 border-white flex items-center justify-center text-lg"
                              title={item.product_name}
                            >
                              🌿
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 bg-stone-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-stone-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-stone-600">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900">
                        LKR {order.total.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-primary-600 text-white"
                          : "border hover:bg-stone-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBagIcon className="h-24 w-24 text-stone-300 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-stone-900 mb-2">
              No Orders Found
            </h2>
            <p className="text-stone-600 mb-8">
              {selectedStatus === "all"
                ? "You haven't placed any orders yet."
                : `No ${selectedStatus} orders found.`}
            </p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
