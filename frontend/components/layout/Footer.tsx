import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-white text-xl mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              SpiceShop
            </h3>
            <p className="text-sm leading-relaxed">
              Premium quality spices sourced directly from the finest gardens in
              Sri Lanka. Bringing authentic flavors to your kitchen since 1990.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary-400 transition"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-primary-400 transition"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary-400 transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-400 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=vanilla"
                  className="hover:text-primary-400 transition"
                >
                  Vanilla
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=nutmeg-mace"
                  className="hover:text-primary-400 transition"
                >
                  Nutmeg & Mace
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=tea"
                  className="hover:text-primary-400 transition"
                >
                  Ceylon Tea
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=cardamom"
                  className="hover:text-primary-400 transition"
                >
                  Cardamom
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 +94 11 234 5678</li>
              <li>✉️ info@spiceshop.lk</li>
              <li>📍 123 Spice Street, Colombo 01</li>
              <li>🕐 Mon-Sat: 8:00 AM - 6:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} SpiceShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
