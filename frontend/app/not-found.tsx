import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2
          className="text-3xl font-bold text-stone-900 mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Page Not Found
        </h2>
        <p className="text-stone-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/products" className="btn-outline">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
