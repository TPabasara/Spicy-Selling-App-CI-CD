"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import HeroSection from "@/components/home/HeroSection";
import Features from "@/components/home/Features";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getFeaturedProducts(8),
          categoriesAPI.getCategories(),
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <HeroSection />
      <Features />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-stone-900 mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Shop by Category
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Explore our carefully curated collection of premium spices, each
              sourced from the finest regions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="block p-6 bg-stone-50 rounded-xl hover:bg-primary-50 transition-all duration-300 group"
                >
                  <div className="text-4xl mb-3">
                    {getCategoryIcon(category.slug)}
                  </div>
                  <h3 className="font-medium text-stone-900 group-hover:text-primary-600 transition">
                    {category.name}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">
                    {category.product_count} products
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-stone-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold text-stone-900 mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Featured Products
              </h2>
              <p className="text-stone-600">
                Handpicked selection of our finest spices
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition group"
            >
              View All Products
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-stone-200 rounded-lg aspect-square mb-4" />
                  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="btn-primary inline-block">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Free Delivery in Colombo
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              On all orders above LKR 5,000. Premium spices delivered to your
              doorstep.
            </p>
            <Link
              href="/products"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition"
            >
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    vanilla: "🌿",
    "nutmeg-mace": "🥜",
    tea: "🍵",
    cardamom: "🟢",
    "other-spices": "🌶️",
  };
  return icons[slug] || "📦";
}
