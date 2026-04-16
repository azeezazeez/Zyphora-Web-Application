import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none bg-white rounded-3xl sm:rounded-3xl">
        <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
          {/* Image Section */}
          <div className="lg:w-1/2 relative bg-muted aspect-[4/5] lg:aspect-auto">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            </div>

          {/* Content Section */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold">{product.category}</span>
                <span className="h-4 w-[1px] bg-border" />
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-black" />
                  <span className="text-[10px] font-bold">{product.rating}</span>
                </div>
              </div>
              <h2 className="font-serif text-4xl lg:text-6xl tracking-tight leading-none">{product.name}</h2>
              <p className="text-2xl font-light tracking-widest">${product.price}</p>
            </div>

            <p className="text-muted-foreground leading-relaxed font-light text-lg">
              {product.description || "Experience the pinnacle of artisanal craftsmanship. This piece embodies our commitment to timeless elegance and superior quality, meticulously designed for the discerning individual."}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button 
                  className="flex-1 h-16 rounded-2xl bg-black text-white hover:bg-black/90 text-[11px] uppercase tracking-[0.3em] font-bold"
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                >
                  <ShoppingCart className="mr-3 h-4 w-4" /> Add to Bag
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => toggleWishlist(product)}
                  className={`h-16 w-16 rounded-2xl border-border hover:bg-muted transition-colors ${isWishlisted ? 'bg-black text-white hover:bg-black/90' : ''}`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
                <div className="flex flex-col items-center text-center space-y-2">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Fast Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
