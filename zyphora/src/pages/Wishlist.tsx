import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Wishlist = () => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-6 py-32 space-y-20"
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="font-serif text-6xl md:text-8xl tracking-tighter">My <span className="italic">Wishlist</span></h1>
        <p className="text-xl text-muted-foreground font-light leading-relaxed">
          Your curated selection of timeless pieces, awaiting their place in your collection.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 gap-8 border border-dashed border-border/50">
        <Heart className="h-16 w-16 text-muted-foreground opacity-20" />
        <div className="text-center space-y-2">
          <p className="font-serif text-2xl italic">Your wishlist is currently empty</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Discover pieces you'll love</p>
        </div>
        <Button 
          onClick={() => navigate('/shop')}
          className="h-16 px-12 rounded-none text-[10px] uppercase tracking-[0.3em] font-bold"
        >
          Explore Collection
        </Button>
      </div>
    </motion.div>
  );
};
