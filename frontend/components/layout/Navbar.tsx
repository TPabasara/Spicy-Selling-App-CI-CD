"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.getCartCount());
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
      }`}
    >
      {/* Top Bar */}
      <div className="bg-stone-900 text-white text-sm hidden md:block">
        <div className="container-custom py-2 flex justify-between items-center">
          <p className="text-stone-300">
            Free delivery across Colombo for orders above LKR 5,000
          </p>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">📞 +94 11 234 5678</span>
            <span className="text-stone-400">✉️ info@spiceshop.lk</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl md:text-3xl font-bold text-primary-600"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              SpiceShop
            </span>
            <span className="hidden sm:block text-xs text-stone-500 mt-2">
              Premium Spices
            </span>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search spices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-10 py-2 rounded-full"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-stone-400" />
              </button>
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 hover:bg-stone-100 rounded-full transition"
            >
              <ShoppingCartIcon className="h-6 w-6 text-stone-700" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs 
                               w-5 h-5 rounded-full flex items-center justify-center font-medium"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/orders"
                  className="text-sm text-stone-600 hover:text-primary-600 transition"
                >
                  My Orders
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-1 p-2 hover:bg-stone-100 rounded-full transition">
                    <UserIcon className="h-6 w-6 text-stone-700" />
                    <span className="text-sm text-stone-700">
                      {user?.full_name}
                    </span>
                  </button>
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg 
                                border opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                transition-all duration-200"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-stone-50"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block btn-primary text-sm py-2 px-4"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-stone-100 rounded-full transition"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-stone-700" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 pb-3">
          <Link
            href="/products"
            className="text-sm font-medium text-stone-600 hover:text-primary-600 transition"
          >
            All Products
          </Link>
          <Link
            href="/products?category=vanilla"
            className="text-sm font-medium text-stone-600 hover:text-primary-600 transition"
          >
            Vanilla
          </Link>
          <Link
            href="/products?category=nutmeg-mace"
            className="text-sm font-medium text-stone-600 hover:text-primary-600 transition"
          >
            Nutmeg & Mace
          </Link>
          <Link
            href="/products?category=tea"
            className="text-sm font-medium text-stone-600 hover:text-primary-600 transition"
          >
            Ceylon Tea
          </Link>
          <Link
            href="/products?category=cardamom"
            className="text-sm font-medium text-stone-600 hover:text-primary-600 transition"
          >
            Cardamom
          </Link>
          <Link
            href="/products?category=other-spices"
            className="text-sm font-medium text-stone-600 hover:text-primary-600 transition"
          >
            Other Spices
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-200 bg-white"
          >
            <div className="container-custom py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search spices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                  />
                </div>
              </form>

              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block py-2 text-stone-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/products?category=vanilla"
                  className="block py-2 text-stone-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Vanilla
                </Link>
                <Link
                  href="/products?category=nutmeg-mace"
                  className="block py-2 text-stone-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Nutmeg & Mace
                </Link>
                <Link
                  href="/products?category=tea"
                  className="block py-2 text-stone-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ceylon Tea
                </Link>
                <Link
                  href="/products?category=cardamom"
                  className="block py-2 text-stone-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cardamom
                </Link>
              </div>

              <div className="border-t pt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-stone-500">
                      Signed in as{" "}
                      <span className="font-medium text-stone-900">
                        {user?.full_name}
                      </span>
                    </p>
                    <Link
                      href="/orders"
                      className="block py-2 text-stone-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="btn-primary block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
