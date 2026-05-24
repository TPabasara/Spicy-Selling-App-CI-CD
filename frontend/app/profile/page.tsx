"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });
    }
  }, [user, isAuthenticated]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-stone-900 mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              My Profile
            </h1>
            <p className="text-stone-600">Manage your account settings</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-stone-50 transition text-sm font-medium text-stone-700"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm text-center"
            >
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">
                {user.full_name}
              </h2>
              <p className="text-stone-500 mb-4">@{user.username}</p>
              <div className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>

              <div className="border-t mt-6 pt-6">
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <EnvelopeIcon className="h-5 w-5 text-stone-400" />
                    <span className="text-stone-600">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <PhoneIcon className="h-5 w-5 text-stone-400" />
                      <span className="text-stone-600">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <MapPinIcon className="h-5 w-5 text-stone-400" />
                    <span className="text-stone-600">
                      {user.city || "No location set"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-stone-900 mb-6">
                Account Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="input-field disabled:bg-stone-50 disabled:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-field bg-stone-50 text-stone-500"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="input-field disabled:bg-stone-50 disabled:text-stone-500"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    className="input-field disabled:bg-stone-50 disabled:text-stone-500"
                    placeholder="123 Spice Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!isEditing}
                    className="input-field disabled:bg-stone-50 disabled:text-stone-500"
                    placeholder="Colombo"
                  />
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
                    >
                      <CheckIcon className="h-5 w-5" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-2 border rounded-lg hover:bg-stone-50 transition font-medium text-stone-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t mt-8 pt-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">
                  Account Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/orders"
                    className="block w-full text-left px-4 py-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition"
                  >
                    <span className="font-medium text-stone-900">
                      Order History
                    </span>
                    <p className="text-sm text-stone-500">
                      View your past orders
                    </p>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    <span className="font-medium text-red-700">Sign Out</span>
                    <p className="text-sm text-red-500">
                      Log out of your account
                    </p>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
