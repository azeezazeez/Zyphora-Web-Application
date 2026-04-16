import React from 'react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { useNavigate } from 'react-router-dom';

export const Collections = () => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-6 py-32 space-y-20"
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="font-serif text-6xl md:text-8xl tracking-tighter gold-shimmer">The <span className="italic">Collections</span></h1>
        <p className="text-xl text-muted-foreground font-light leading-relaxed">
          Explore our thematic universes, each designed to evoke a unique sense of presence and style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative aspect-video overflow-hidden cursor-pointer"
            onClick={() => navigate(`/shop?category=${cat.name}`)}
          >
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="font-serif text-5xl text-white tracking-tighter gold-shimmer">{cat.name}</h2>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
