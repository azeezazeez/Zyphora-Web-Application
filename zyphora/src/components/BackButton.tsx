import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

export const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page, admin pages, or auth pages
  if (location.pathname === '/' || location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed top-28 left-8 z-40 hidden xl:flex items-center gap-4"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-xl hover:bg-black hover:text-white transition-all duration-500 group"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
      </Button>
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Back
      </span>
    </motion.div>
  );
};

export const MobileBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/' || location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="lg:hidden mr-4"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="h-10 w-10 rounded-full hover:bg-muted"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </motion.div>
  );
};
