import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X, Search, LogOut, Settings, Sun, Moon, ArrowRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { MobileBackButton } from './BackButton';

export const Navbar = () => {
  const { totalItems, cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');


  const isAdmin = () => {
    if (!user) return false;
    
    const userRole = user.role;
    return userRole === 'admin' || userRole?.toUpperCase() === 'ADMIN';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(localSearchQuery.trim())}`);
      setIsSearchOpen(false);
      setLocalSearchQuery('');
    }
  };

  console.log('Navbar - User:', user);
  console.log('Navbar - Is Admin:', isAdmin());
  console.log('Navbar - User Role:', user?.role);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
    >
      <div className="w-full flex h-20 items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <MobileBackButton />
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-10 w-10 bg-black flex items-center justify-center rounded-none"
            >
              <span className="text-white font-serif text-xl font-bold">Z</span>
            </motion.div>
            <motion.span
              initial={{ letterSpacing: "0.2em" }}
              animate={{ letterSpacing: "0.4em" }}
              whileHover={{ letterSpacing: "0.6em" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-2xl font-bold tracking-tighter hidden sm:block gold-shimmer"
            >
              ZYPHORA
            </motion.span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {['Home', 'Shop', 'Collections', 'About'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:flex rounded-full"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile?tab=wishlist')}
              className="relative rounded-full"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[8px] rounded-full bg-black text-white border-none">
                  {wishlist.length}
                </Badge>
              )}
            </Button>
          </motion.div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="cursor-pointer">
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0 border border-border overflow-hidden">
                    <Avatar className="h-full w-full rounded-full">
                      {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name || 'User'} className="object-cover" />}
                      <AvatarFallback className="rounded-full bg-black text-white font-serif text-lg uppercase">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 glass-morphism border-border/50">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-serif text-lg">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=personal')} className="rounded-none focus:bg-primary/5">
                    <User className="mr-3 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=wishlist')} className="rounded-none focus:bg-primary/5">
                    <Heart className="mr-3 h-4 w-4" /> Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')} className="rounded-none focus:bg-primary/5">
                    <Settings className="mr-3 h-4 w-4" /> Account Settings
                  </DropdownMenuItem>

                  {isAdmin() && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem
                        onClick={() => {
                          console.log('Navigating to admin dashboard');
                          navigate('/admin');
                        }}
                        className="rounded-none focus:bg-primary/5 font-bold text-black"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4" /> Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={logout} className="text-destructive rounded-none focus:bg-destructive/5">
                  <LogOut className="mr-3 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={() => navigate('/login')} className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger>
              <div className="cursor-pointer">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[8px] rounded-full bg-black text-white border-none">
                          {totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md border-l border-border/50 glass-morphism rounded-l-[2.5rem] p-0 overflow-hidden">
              <div className="flex flex-col h-full p-8">
                <SheetHeader className="pb-6 border-b border-border/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <SheetTitle className="font-serif text-3xl tracking-tight">Your Bag</SheetTitle>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
                        {totalItems} {totalItems === 1 ? 'Item' : 'Items'} selected
                      </p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-8 scrollbar-hide">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center"
                        >
                          <ShoppingBag className="h-10 w-10 opacity-20" />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-serif text-2xl italic">Your bag is empty</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                          Discover our latest collections and find your next piece.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                        className="rounded-full px-10 h-12 border-black/10 hover:bg-black hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold"
                      >
                        Explore Shop
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                          <span className="text-muted-foreground">Free Shipping</span>
                          <span>{totalPrice >= 500 ? 'Unlocked' : `$${(500 - totalPrice).toFixed(0)} away`}</span>
                        </div>
                        <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalPrice / 500) * 100, 100)}%` }}
                            className="h-full bg-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-8">
                        {cart.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-6 group relative"
                          >
                            <div className="h-40 w-28 overflow-hidden rounded-2xl bg-muted relative shrink-0">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/5" />
                            </div>

                            <div className="flex flex-col justify-between flex-1 py-2">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-4">
                                  <h4 className="font-serif text-xl leading-tight tracking-tight group-hover:gold-shimmer transition-all duration-500">{item.name}</h4>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">{item.category}</p>
                              </div>

                              <div className="flex items-end justify-between">
                                <div className="space-y-3">
                                  <p className="text-sm font-bold tracking-wider">${item.price}</p>
                                  <div className="flex items-center bg-muted/30 rounded-full p-1 w-fit">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white transition-colors text-xs"
                                    >-</button>
                                    <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white transition-colors text-xs"
                                    >+</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-border/10 pt-8 space-y-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="text-black">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">
                        <span>Shipping</span>
                        <span className="text-black">{totalPrice >= 500 ? 'Complimentary' : 'Calculated at next step'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-serif text-2xl tracking-tight">Total</span>
                        <span className="text-2xl font-serif gold-shimmer">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        className="w-full h-16 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative"
                        onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Secure Checkout <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-white/10"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      </Button>
                      <p className="text-[9px] text-center text-muted-foreground uppercase tracking-[0.2em] font-medium">
                        Taxes and duties included • 30-day returns
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container mx-auto flex flex-col gap-6 p-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Menu</p>
                <div className="flex items-center gap-4">
                  <button onClick={toggleTheme} className="p-2">
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </button>
                  <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="p-2">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <Link to="/" className="text-2xl font-serif tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/shop" className="text-2xl font-serif tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              <Link to="/collections" className="text-2xl font-serif tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
              <Link to="/about" className="text-2xl font-serif tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>About</Link>

              {isAdmin() && (
                <Link
                  to="/admin"
                  className="text-2xl font-serif tracking-tight text-black border-t border-border/50 pt-4 mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-2xl"
          >
            <div className="container mx-auto max-w-4xl py-12 px-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search collection..."
                  className="w-full bg-transparent border-b border-black/10 py-4 text-2xl md:text-4xl font-serif tracking-tight focus:outline-none focus:border-black transition-colors"
                />
                <div className="absolute right-0 bottom-4 flex items-center gap-4">
                  <button type="submit" className="p-2 hover:scale-110 transition-transform">
                    <Search className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:rotate-90 transition-transform duration-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};