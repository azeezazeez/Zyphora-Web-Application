import React, { useRef } from 'react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../constants';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { ArrowRight, Star, Quote, Play, ChevronRight, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000"
];

export const Home = () => {
  const navigate = useNavigate();
  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const [currentImage, setCurrentImage] = React.useState(0);
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-0 pb-32 bg-[#FDFDFD]"
    >
      {/* Hero Section - Refined & Elegant */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-[#0A0A0A]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={CAROUSEL_IMAGES[currentImage]} 
              alt="Luxury Fashion" 
              className="h-full w-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="flex items-center justify-center gap-4">
            </div>
            
            <h1 className="font-serif text-7xl md:text-9xl text-white tracking-tighter leading-[0.9]">
              The Art of <br />
              <span className="italic font-light gold-shimmer">Modern Luxury</span>
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <div className="relative w-full max-w-md group">
                <button 
                  onClick={() => {
                    const input = document.getElementById('hero-search') as HTMLInputElement;
                    if (input.value) navigate(`/shop?search=${encodeURIComponent(input.value)}`);
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors z-10"
                >
                  <Search className="h-full w-full" />
                </button>
                <input 
                  id="hero-search"
                  type="text"
                  placeholder="Search collection..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/shop?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                    }
                  }}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-5 pl-14 pr-8 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  size="lg" 
                  onClick={() => navigate('/shop')}
                  className="h-16 px-12 rounded-full border-white text-white hover:bg-white hover:text-black text-[11px] uppercase tracking-[0.3em] font-bold bg-transparent transition-all duration-300"
                >
                  Shop Collection
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-10 w-[1px] bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* Featured Products - Refined Grid */}
      <section className="py-32 bg-white dark:bg-black transition-colors duration-500">
        <div className="container mx-auto px-6">
          <div className="mb-24 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-black dark:bg-white" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] dark:text-white/60">New Arrivals</span>
              </div>
              <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none gold-shimmer">
                Featured <span className="italic text-black/20 dark:text-white/10">Pieces</span>
              </h2>
            </div>
            <Button 
              variant="link" 
              className="group text-[10px] uppercase tracking-[0.3em] font-bold p-0 h-auto text-black dark:text-white" 
              onClick={() => navigate('/shop')}
            >
              Explore All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-x-12 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Showcase - Balanced & Clean */}
      <section className="bg-[#0A0A0A] text-white py-40">
        <div className="container mx-auto px-6">
          <div className="mb-24 text-center space-y-6">
            <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none gold-shimmer">
              The <span className="italic font-light text-white/20">Atelier</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg font-light tracking-wide">
              Curated realms of excellence, where every piece tells a story of heritage and innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.name}
                whileHover="hover"
                className="group relative aspect-[16/9] overflow-hidden cursor-pointer bg-white/5"
                onClick={() => navigate(`/shop?category=${category.name}`)}
              >
                <motion.img 
                  src={category.image} 
                  alt={category.name} 
                  variants={{
                    hover: { scale: 1.05 }
                  }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full object-cover opacity-50 transition-opacity duration-700 group-hover:opacity-70"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-12 space-y-4">
                  <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-white/30">0{index + 1}</span>
                  <h3 className="font-serif text-5xl text-white tracking-tighter">{category.name}</h3>
                  <div className="flex items-center gap-4 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Discover</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Philosophy - Sophisticated */}
      <section className="py-40 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-24 lg:grid-cols-2 items-center">
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" 
                  alt="Fashion Lifestyle" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-12 -right-12 hidden xl:block w-80 bg-black text-white p-12 space-y-6 shadow-2xl">
                <Quote className="h-8 w-8 text-white/20" />
                <p className="text-xl italic font-light leading-relaxed">
                  "Luxury is not a status, but a state of being. Zyphora is the vessel for that expression."
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Julian Vane — Founder</p>
              </div>
            </div>

            <div className="space-y-16">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-12 bg-black" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em]">Our Philosophy</span>
                </div>
                <h2 className="font-serif text-6xl md:text-8xl tracking-tighter leading-[0.95] gold-shimmer">
                  Crafting <br /> <span className="italic font-light text-black/10">Eternal</span> Legacies
                </h2>
                <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-lg">
                  We architect identities. Every thread is a testament to our obsession with perfection and the pursuit of the extraordinary.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12">
                {[
                  { label: 'Global Patrons', value: '25k+' },
                  { label: 'Artisanal Brands', value: '350+' }
                ].map((stat) => (
                  <div key={stat.label} className="space-y-2">
                    <h4 className="text-5xl font-serif font-light tracking-tighter">{stat.value}</h4>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline"
                size="lg" 
                onClick={() => navigate('/about')}
                className="rounded-full h-16 px-12 text-[11px] uppercase tracking-[0.3em] font-bold bg-transparent border-black text-black hover:bg-black hover:text-white transition-all duration-300"
              >
                Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Minimal & Clean */}
      <section className="container mx-auto px-6 mb-20">
        <div className="bg-[#0A0A0A] text-white p-20 md:p-32 text-center relative overflow-hidden rounded-[3rem] md:rounded-[5rem]">
          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
            <div className="space-y-6">
              <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none gold-shimmer">
                The <span className="italic text-white/20">Inner Circle</span>
              </h2>
              <p className="text-white/40 text-lg font-light tracking-wide max-w-xl mx-auto">
                Subscribe for early access to limited collections and private events.
              </p>
            </div>
            
            <form 
              id="newsletter-form"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const email = formData.get('email')?.toString().trim();
                
                if (!email) {
                  toast.error('Please enter an email address');
                  return;
                }

                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(email)) {
                  toast.error('Please enter a valid email address');
                  return;
                }

                setIsSubscribing(true);
                const toastId = toast.loading('Joining the Inner Circle...');

                try {
                  // Mock API delay
                  await new Promise(resolve => setTimeout(resolve, 1500));

                  // Save to local storage for admin to see
                  let subscribers = [];
                  try {
                    const stored = localStorage.getItem('zyphora_subscribers');
                    subscribers = stored ? JSON.parse(stored) : [];
                    if (!Array.isArray(subscribers)) subscribers = [];
                  } catch (err) {
                    subscribers = [];
                  }

                  const alreadySubscribed = subscribers.some((s: any) => s.email === email);
                  
                  if (!alreadySubscribed) {
                    subscribers.push({
                      email,
                      date: new Date().toISOString(),
                      id: Math.random().toString(36).substr(2, 9)
                    });
                    localStorage.setItem('zyphora_subscribers', JSON.stringify(subscribers));
                    toast.success('Welcome to the Inner Circle! Check your inbox for exclusive access.', { id: toastId });
                  } else {
                    toast.info('You are already part of the Inner Circle!', { id: toastId });
                  }
                  
                  form.reset();
                } catch (error) {
                  toast.error('Something went wrong. Please try again later.', { id: toastId });
                } finally {
                  setIsSubscribing(false);
                }
              }}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative z-10"
            >
              <input 
                name="email"
                type="email" 
                placeholder="Email address" 
                required
                disabled={isSubscribing}
                className="flex-1 bg-white/5 border border-white/10 px-8 py-5 rounded-full focus:outline-none focus:border-white/40 transition-all font-light text-base disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="rounded-full bg-white text-black hover:bg-white/90 h-16 px-10 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 transition-all flex items-center justify-center min-w-[160px]"
              >
                {isSubscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 bg-black rounded-full animate-bounce" />
                  </div>
                ) : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
