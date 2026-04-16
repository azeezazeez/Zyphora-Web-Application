import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { productApi } from '../services/api';
import { Product } from '../types';

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setSelectedCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-xs uppercase tracking-widest">Loading luxury pieces...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-32 transition-colors duration-500 dark:bg-black"
    >
      <section className="relative h-[40vh] w-full overflow-hidden bg-black">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
            alt="Shop Header"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-4"
          >
            <h1 className="font-serif text-6xl md:text-8xl tracking-tighter gold-shimmer">The <span className="italic">Collection</span></h1>
            <p className="text-white/60 text-lg font-light tracking-widest uppercase">Curated Excellence</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-morphism p-8 flex flex-col lg:flex-row items-center justify-between gap-8 border-border/50 dark:bg-white/5"
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['All', ...CATEGORIES.map(c => c.name)].map((category) => (
              <motion.button
                key={category}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`relative px-8 py-3 text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${selectedCategory === category
                  ? 'text-black dark:text-white'
                  : 'text-muted-foreground hover:text-black dark:hover:text-white'
                  }`}
              >
                {category}
                {selectedCategory === category && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/5 border-none pl-12 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-black/20 transition-all"
              />
            </div>

            {/* Simple select dropdown - no warnings */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/5 border-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer h-11"
            >
              <option value="featured">Sort By: Featured</option>
              <option value="price-low">Sort By: Price Low to High</option>
              <option value="price-high">Sort By: Price High to Low</option>
              <option value="rating">Sort By: Top Rated</option>
            </select>
          </div>
        </motion.div>

        <div className="mt-12 mb-8 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground dark:text-white/40">
            Showing {filteredProducts.length} results
          </p>
          <div className="h-[1px] flex-1 mx-8 bg-border/30 dark:bg-white/10" />
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center space-y-6"
          >
            <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <p className="font-serif text-2xl italic text-muted-foreground">No pieces found matching your criteria</p>
            <Button variant="outline" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="rounded-none border-black">
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};