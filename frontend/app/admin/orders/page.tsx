'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Order } from '@/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await api.get('/admin/orders');
      setOrders(response.data.items);
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    await api.put(`/admin/orders/${orderId}/status`, { status });
    const response = await api.get('/admin/orders');
    setOrders(response.data.items);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Orders</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-stone-50">
              <th className="text-left p-4 text-sm font-medium">Order #</th>
              <th className="text-left p-4 text-sm font-medium">Customer</th>
              <th className="text-left p-4 text-sm font-medium">Total</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-stone-50">
                <td className="p-4 font-medium">#{order.order_number}</td>
                <td className="p-4 text-sm">{order.shipping_address.split(',')[0]}</td>
                <td className="p-4">LKR {order.total.toLocaleString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1"
                  >
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
