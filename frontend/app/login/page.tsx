'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const getErrorMessage = (error: any): string => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    return 'Invalid email or password';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const user = await login(formData.email, formData.password);
      
      // Role-based redirect - ALL admin types go to admin dashboard
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Welcome Back
            </h1>
            <p className="text-stone-600">Sign in to your SpiceShop account</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" placeholder="Enter your password" />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-stone-500">New to SpiceShop?</span></div>
          </div>

          <Link href="/register" className="block text-center btn-outline w-full">Create an Account</Link>

          <div className="mt-6 p-4 bg-stone-50 rounded-lg">
            <p className="text-xs font-medium text-stone-500 mb-2">Demo Credentials:</p>
            <p className="text-xs text-stone-600">Super Admin: super@spiceshop.lk / Super@123</p>
            <p className="text-xs text-stone-600">Admin: admin@spiceshop.lk / Admin@123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
