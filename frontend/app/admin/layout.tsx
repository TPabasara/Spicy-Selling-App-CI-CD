'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    
    if (!storedToken) {
      router.replace('/login');
      return;
    }

    if (!user) {
      checkAuth().finally(() => setIsReady(true));
    } else if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/');
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-stone-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">You don't have admin access.</p>
          <button onClick={() => router.push('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-stone-900 text-white">
        <div className="container-custom flex items-center justify-between h-16">
          <Link href="/admin" className="font-bold text-xl">SpiceShop Admin</Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-stone-300 hover:text-white">View Store</Link>
            <button 
              onClick={() => { useAuthStore.getState().logout(); router.push('/login'); }} 
              className="text-sm text-stone-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] hidden lg:block p-4">
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
              { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
              { name: 'Categories', href: '/admin/categories', icon: TagIcon },
              { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
              { name: 'Users', href: '/admin/users', icon: UsersIcon },
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  pathname === item.href ? 'bg-primary-50 text-primary-700' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
