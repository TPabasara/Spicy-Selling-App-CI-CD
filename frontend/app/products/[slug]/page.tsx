"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { productsAPI } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types";
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const addToCart = useCartStore((state) => state.addToCart);
  const cartLoading = useCartStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsAPI.getProductBySlug(slug);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      return;
    }

    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      alert(`${product.name} added to cart!`);
      setQuantity(1);
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-stone-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-stone-200 rounded w-3/4" />
              <div className="h-6 bg-stone-200 rounded w-1/4" />
              <div className="h-4 bg-stone-200 rounded w-1/2" />
              <div className="h-32 bg-stone-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">
          Product Not Found
        </h1>
        <p className="text-stone-600 mb-8">
          The product you're looking for doesn't exist.
        </p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const discount = product.compare_price
    ? Math.round(
        ((product.compare_price - product.price) / product.compare_price) * 100,
      )
    : 0;

  return (
    <div className="bg-white">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-8">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-600">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category_id}`}
            className="hover:text-primary-600"
          >
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="text-stone-900">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-stone-100 rounded-2xl flex items-center justify-center text-9xl">
              🌿
            </div>
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {discount}% OFF
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <p className="text-sm text-primary-600 font-medium">
              {product.category_name}
            </p>

            <h1
              className="text-3xl md:text-4xl font-bold text-stone-900"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-sm text-stone-500">(24 reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-stone-900">
                LKR {product.price.toLocaleString()}
              </span>
              {product.compare_price && (
                <span className="text-xl text-stone-400 line-through">
                  LKR {product.compare_price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-stone-600">
              <span className="font-medium">Size:</span> {product.unit}
            </p>

            {product.short_description && (
              <p className="text-stone-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {product.stock_quantity > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-medium text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-stone-100 transition disabled:opacity-50"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 hover:bg-stone-100 transition disabled:opacity-50"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                {product.stock_quantity <= 10 && (
                  <span className="text-sm text-orange-600">
                    Only {product.stock_quantity} left
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || cartLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <TruckIcon className="h-5 w-5 text-green-600" />
                <span>Free delivery in Colombo for orders above LKR 5,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <span>Quality guaranteed or your money back</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <div className="border-b">
            <div className="flex gap-8">
              <button className="pb-4 font-medium text-sm border-b-2 border-primary-600 text-primary-600">
                Description
              </button>
            </div>
          </div>
          <div className="py-8">
            <p className="text-stone-600 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-primary-600 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
}
