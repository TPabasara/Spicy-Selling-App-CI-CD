"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-primary-900 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-custom relative py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Authentic Spices
              <span className="block text-primary-400">From Sri Lanka</span>
            </h1>
            <p className="text-lg text-stone-300 mb-8 max-w-lg">
              Discover the rich heritage of Ceylon spices. From aromatic
              cinnamon to premium vanilla, bring authentic flavors to your
              kitchen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="btn-primary bg-primary-500 hover:bg-primary-400 text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/categories"
                className="btn-outline border-white text-white hover:bg-white/10 text-center"
              >
                Explore Categories
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12">
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-stone-400 text-sm">Spice Varieties</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">1000+</p>
                <p className="text-stone-400 text-sm">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">30+</p>
                <p className="text-stone-400 text-sm">Years Experience</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 p-8 relative overflow-hidden">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 aspect-square flex items-center justify-center">
                    <span className="text-5xl">🌿</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 aspect-square flex items-center justify-center">
                    <span className="text-5xl">🥜</span>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 aspect-square flex items-center justify-center">
                    <span className="text-5xl">🍵</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 aspect-square flex items-center justify-center">
                    <span className="text-5xl">🟢</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
