'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Product, Category, ProductFilters } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const limit = 20;

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Parse URL params to set initial filters
  useEffect(() => {
    const q = searchParams.get('q');
    const categorySlug = searchParams.get('category');
    
    if (q) setSearchQuery(q);
    
    // Convert category slug to ID
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategoryId(category.id);
      }
    }
  }, [searchParams, categories]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: ProductFilters = {
        page: currentPage,
        limit,
        sort_by: sortBy,
      };

      if (searchQuery) filters.q = searchQuery;
      if (selectedCategoryId) filters.category_id = selectedCategoryId;
      if (minPrice) filters.min_price = parseFloat(minPrice);
      if (maxPrice) filters.max_price = parseFloat(maxPrice);

      const response = await productsAPI.getProducts(filters);
      setProducts(response.items);
      setTotalProducts(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategoryId, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setSortBy('name');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            Our Products
          </h1>
          <p className="text-stone-600">{totalProducts} premium spices available</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field text-sm"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <MagnifyingGlassIcon className="h-4 w-4 text-stone-400" />
                  </button>
                </div>
              </form>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-stone-700 mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedCategoryId(null); setCurrentPage(1); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      !selectedCategoryId ? 'bg-primary-50 text-primary-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => { setSelectedCategoryId(category.id); setCurrentPage(1); }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedCategoryId === category.id 
                          ? 'bg-primary-50 text-primary-600 font-medium' 
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {category.name} ({category.product_count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-stone-700 mb-3">Price Range (LKR)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="input-field text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Clear all filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-stone-600"
              >
                <FunnelIcon className="h-5 w-5" />
                Filters
              </button>
              
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-stone-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">Name</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden bg-white rounded-xl p-4 mb-4 shadow-sm"
                >
                  <form onSubmit={handleSearch} className="mb-4">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field text-sm"
                    />
                  </form>

                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => { setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null); setCurrentPage(1); }}
                    className="input-field text-sm mb-3"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>

                  <div className="flex gap-2 mb-3">
                    <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }} className="input-field text-sm" />
                    <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }} className="input-field text-sm" />
                  </div>

                  <button onClick={clearFilters} className="text-sm text-primary-600 font-medium">
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-stone-200 rounded-xl aspect-square mb-4" />
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                          currentPage === page ? 'bg-primary-600 text-white' : 'border hover:bg-stone-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-stone-500 text-lg">No products found</p>
                <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 font-medium mt-2">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
