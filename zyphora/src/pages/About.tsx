import React from 'react';
import { motion } from 'motion/react';
import { Shield, Globe, Sparkles, Heart } from 'lucide-react';

export const About = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-6 py-32 space-y-32"
    >
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4"
        >
          <span className="h-[1px] w-12 bg-black/10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black/40">Our Legacy</span>
          <span className="h-[1px] w-12 bg-black/10" />
        </motion.div>
        <h1 className="font-serif text-6xl md:text-8xl tracking-tighter leading-none gold-shimmer">
          The Heritage of <br />
          <span className="italic text-black/20">Zyphora</span>
        </h1>
        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
          Founded in 2026, Zyphora was born from a singular vision: to bridge the gap between traditional craftsmanship and contemporary elegance. We don't just sell products; we curate experiences.
        </p>
      </div>
      
      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-[4/5] bg-muted overflow-hidden rounded-[2.5rem]">
            <img 
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1000" 
              alt="Atelier" 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 bg-white p-10 shadow-2xl rounded-3xl hidden xl:block w-64 border border-black/5">
            <p className="text-sm font-serif italic leading-relaxed">
              "Every stitch is a conversation between the artisan and the future owner."
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <h2 className="font-serif text-5xl tracking-tight gold-shimmer">The Art of Curation</h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Every piece in our collection is hand-selected by our global team of curators. We look beyond trends, focusing on silhouette, material integrity, and the story behind the maker.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="h-12 w-12 bg-black/5 rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Uncompromising Quality</h4>
              <p className="text-sm text-muted-foreground font-light">We partner only with ateliers that share our obsession with perfection.</p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 bg-black/5 rounded-2xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-black" />
              </div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Global Sourcing</h4>
              <p className="text-sm text-muted-foreground font-light">From the streets of Milan to the workshops of Tokyo, we find the extraordinary.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Philosophy Section */}
      <section className="bg-black text-white py-32 -mx-6 px-6 md:-mx-12 md:px-12 rounded-[3rem] md:rounded-[5rem]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="h-[1px] w-12 bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">Our Philosophy</span>
            </div>
            <h2 className="font-serif text-6xl md:text-7xl tracking-tighter leading-none gold-shimmer">
              Luxury is a <br />
              <span className="italic text-white/20">State of Mind</span>
            </h2>
            <p className="text-xl text-white/60 font-light leading-relaxed">
              We believe that luxury is not just about the price tag, but about the time, skill, and passion invested in every detail. It's the feeling of wearing something that was made with intention.
            </p>
            <div className="flex gap-12 pt-6">
              <div>
                <h3 className="text-4xl font-serif">100%</h3>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mt-2">Artisanal Focus</p>
              </div>
              <div>
                <h3 className="text-4xl font-serif">24/7</h3>
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mt-2">Concierge Support</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000" 
              alt="Philosophy" 
              className="h-full w-full object-cover rounded-[3rem] opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="font-serif text-5xl tracking-tight gold-shimmer">Core Values</h2>
          <p className="text-muted-foreground font-light">The pillars that sustain our house.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Innovation",
              desc: "Merging timeless aesthetics with modern technology to create the future of fashion.",
              icon: Sparkles
            },
            {
              title: "Sustainability",
              desc: "Conscious curation that respects both the artisan and the environment.",
              icon: Heart
            },
            {
              title: "Exclusivity",
              desc: "Limited runs and unique pieces that ensure your style remains truly your own.",
              icon: Shield
            }
          ].map((value, i) => (
            <motion.div 
              key={value.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-10 bg-muted/30 rounded-[2.5rem] space-y-6 hover:bg-muted/50 transition-colors"
            >
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <value.icon className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-serif text-2xl">{value.title}</h3>
              <p className="text-muted-foreground font-light leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
