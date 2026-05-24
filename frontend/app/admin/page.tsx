'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface DashboardStats {
  total_products: number;
  total_orders: number;
  orders_today: number;
  revenue_today: number;
  total_users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-stone-500">Total Products</p>
          <p className="text-3xl font-bold text-stone-900 mt-2">{stats?.total_products || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-stone-500">Total Orders</p>
          <p className="text-3xl font-bold text-stone-900 mt-2">{stats?.total_orders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-stone-500">Total Users</p>
          <p className="text-3xl font-bold text-stone-900 mt-2">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-stone-500">Revenue Today</p>
          <p className="text-3xl font-bold text-stone-900 mt-2">
            LKR {stats?.revenue_today?.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
