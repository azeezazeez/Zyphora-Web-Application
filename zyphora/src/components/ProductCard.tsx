import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingCart, Eye, Plus } from 'lucide-react';
import { Product, CartItem } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Create a CartItem object matching the CartItem interface
    const cartItem: CartItem = {
      ...product,
      quantity: 1
    };

    addToCart(cartItem);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleNavigate = () => {
    navigate(`/product/${product.id}`);
  };

  // Get stock status for display
  const getStockStatus = () => {
    const stockQty = product.stockQuantity || product.stock || 0;
    if (stockQty <= 0) return 'Out of Stock';
    if (stockQty < 10) return 'Low Stock';
    return 'In Stock';
  };

  const isOutOfStock = (product.stockQuantity || product.stock || 0) <= 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col h-full"
      >
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-2xl transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 cursor-pointer"
          onClick={handleNavigate}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            referrerPolicy="no-referrer"
          />

          {/* Wishlist Button */}
          <div className="absolute top-4 right-4 z-30">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${isWishlisted
                  ? 'bg-black text-white'
                  : 'bg-white/80 backdrop-blur-md text-black hover:bg-white'
                }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1] z-30">
            <div className="flex gap-2">
              <Button
                className="flex-1 h-12 rounded-xl bg-black text-white hover:bg-black/90 text-[10px] uppercase tracking-[0.2em] font-bold"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <Plus className="mr-2 h-3 w-3" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-xl bg-white text-black hover:bg-black hover:text-white border-none shadow-xl"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute left-6 top-6 z-20">
              <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-black border border-black/5">
                Featured
              </span>
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute left-6 top-6 z-20">
              <span className="bg-red-500/90 backdrop-blur-md px-4 py-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 flex flex-col flex-1 space-y-4 px-2">
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-muted-foreground/60 dark:text-white/40">
              {product.category}
            </p>
            <h3 className="font-serif text-xl lg:text-2xl font-light tracking-tight group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors duration-500 dark:text-white">
              {product.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm font-bold tracking-widest dark:text-white">${product.price}</p>
              {product.brand && (
                <p className="text-[8px] uppercase tracking-widest text-muted-foreground/50">
                  {product.brand}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-black dark:fill-white dark:text-white" />
              <span className="text-[10px] font-bold dark:text-white">{product.rating || 0}</span>
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' :
                (product.stockQuantity || product.stock || 0) < 10 ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
            <span className="text-[8px] uppercase tracking-widest text-muted-foreground/60">
              {getStockStatus()}
            </span>
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};

// Helper for Star icon
const Star = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);