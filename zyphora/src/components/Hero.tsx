import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Fashion" 
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Floating Elements for "Stunning" look */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] h-64 w-64 rounded-full bg-white/5 blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, 40, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[10%] h-96 w-96 rounded-full bg-white/5 blur-3xl"
        />
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Content */}
      <div className="container relative z-20 mx-auto flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="h-[1px] w-12 bg-white/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/60">
                The Zenith of Style
              </span>
              <span className="h-[1px] w-12 bg-white/30" />
            </div>

            <h1 className="font-serif text-6xl font-light leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl lg:text-[10rem]">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="block"
              >
                Ethereal
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="block italic font-light ml-12 md:ml-24"
              >
                Couture
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mx-auto max-w-xl text-lg font-light text-white/60 md:text-xl leading-relaxed text-balance"
            >
              Experience the fusion of traditional craftsmanship and avant-garde design. A new era of luxury awaits.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="flex flex-col items-center justify-center gap-6 sm:flex-row pt-4"
            >
              <Button 
                size="lg" 
                className="group h-16 min-w-[240px] rounded-none bg-white text-black hover:bg-white/90 transition-all duration-500"
                onClick={() => navigate('/shop')}
              >
                <span className="text-xs uppercase tracking-[0.3em] font-bold">Explore Collection</span>
                <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 min-w-[240px] rounded-none border-white/30 text-white hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm"
                onClick={() => navigate('/collections')}
              >
                <span className="text-xs uppercase tracking-[0.3em] font-bold">The Lookbook</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Side Rail Text */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <p className="writing-mode-vertical text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold rotate-180">
          ESTABLISHED MMXXVI
        </p>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold">Scroll</span>
        <div className="h-16 w-[1px] bg-gradient-to-b from-white/40 to-transparent overflow-hidden">
          <motion.div 
            animate={{ y: [0, 64, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="h-8 w-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
};
