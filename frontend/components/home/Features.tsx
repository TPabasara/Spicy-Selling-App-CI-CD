"use client";

import { motion } from "framer-motion";
import {
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: TruckIcon,
    title: "Fast Delivery",
    description:
      "Free delivery in Colombo for orders over LKR 5,000. Reliable shipping island-wide.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Quality Guaranteed",
    description:
      "All our spices are sourced from trusted growers and undergo quality checks.",
  },
  {
    icon: SparklesIcon,
    title: "Fresh Spices",
    description:
      "We import in small batches to ensure maximum freshness and flavor.",
  },
  {
    icon: ClockIcon,
    title: "30+ Years",
    description:
      "Three decades of experience in bringing the finest spices to your kitchen.",
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
                <feature.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
