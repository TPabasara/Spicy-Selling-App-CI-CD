"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const isLoading = useCartStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const discount = product.compare_price
    ? Math.round(
        ((product.compare_price - product.price) / product.compare_price) * 100,
      )
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      await addToCart(product.id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to add to cart");
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative">
        <div className="aspect-square bg-stone-100 relative overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getProductEmoji(product.category_id)}
          </div>

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                Out of Stock
              </span>
            </div>
          )}

          {product.stock_quantity > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={isLoading}
              className="absolute bottom-3 right-3 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </motion.button>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-stone-500 mb-1">
            {product.category_name || "Spice"}
          </p>
          <h3 className="font-medium text-stone-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 mb-2">{product.unit}</p>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-stone-900">
              LKR {product.price.toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-sm text-stone-400 line-through">
                LKR {product.compare_price.toLocaleString()}
              </span>
            )}
          </div>

          {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
            <p className="text-xs text-orange-600 mt-1">
              Only {product.stock_quantity} left in stock
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function getProductEmoji(categoryId: number): string {
  const emojis: Record<number, string> = {
    1: "🌿",
    2: "🥜",
    3: "🍵",
    4: "🟢",
    5: "🌶️",
  };
  return emojis[categoryId] || "📦";
}
