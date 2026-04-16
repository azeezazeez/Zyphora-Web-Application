import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Auth } from './pages/Auth';
import { Checkout, OrderSuccess } from './pages/Checkout';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Collections } from './pages/Collections';
import { Profile } from './pages/Profile';
import { Wishlist } from './pages/Wishlist';
import { InfoPage } from './pages/InfoPage';
import { ResetPassword } from './pages/ResetPassword';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Footer = () => {
  const copyrightText = `© ${new Date().getFullYear()} Zyphora Luxury. All rights reserved.`;

  return (
    <footer className="border-t bg-background py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div className="space-y-6">
            <motion.h3
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="font-serif text-3xl tracking-tighter gold-shimmer"
            >
              ZYPHORA
            </motion.h3>
            <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-bold opacity-60">
              Redefining modern elegance through curated luxury fashion and lifestyle pieces.
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]">Shop</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              <li><Link to="/shop" className="hover:text-black transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Apparel" className="hover:text-black transition-colors">Apparel</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-black transition-colors">Accessories</Link></li>
              <li><Link to="/shop?category=Beauty" className="hover:text-black transition-colors">Beauty</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]">Company</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              <li><Link to="/about" className="hover:text-black transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="hover:text-black transition-colors">Careers</Link></li>
              <li><Link to="/sustainability" className="hover:text-black transition-colors">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]">Support</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              <li><Link to="/faq" className="hover:text-black transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-black transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 border-t pt-10 text-center">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-[9px] uppercase tracking-[0.4em] font-bold gold-shimmer"
          >
            {copyrightText.split('').map((char, index) => (
              <motion.span
                key={index}
                whileHover={{
                  y: -8,
                  scale: 1.2,
                  color: "var(--primary)",
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className="inline-block cursor-default select-none"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

import { BackButton } from './components/BackButton';

const AnimatedRoutes = () => {
  const location = useLocation();

  // Hide navbar/footer on admin dashboard and auth pages
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/reset-password';

  return (
    <>
      {!isAdminPage && !isAuthPage && <Navbar />}
      <BackButton />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/contact" element={<InfoPage />} />
              <Route path="/careers" element={<InfoPage />} />
              <Route path="/sustainability" element={<InfoPage />} />
              <Route path="/faq" element={<InfoPage />} />
              <Route path="/shipping" element={<InfoPage />} />
              <Route path="/privacy" element={<InfoPage />} />
              <Route path="/terms" element={<InfoPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAdminPage && !isAuthPage && <Footer />}
    </>
  );
};

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <AnimatedRoutes />
              <Toaster
                position="bottom-right"
                closeButton
                richColors
                duration={5000}
                visibleToasts={5}
                expand={true}
              />
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
