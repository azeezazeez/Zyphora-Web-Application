import React from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Shield, Truck, CreditCard, HelpCircle, Leaf, Briefcase, Mail } from 'lucide-react';

const CONTENT_MAP: Record<string, { icon: any, text: string[] }> = {
  'shipping': {
    icon: Truck,
    text: [
      "We offer complimentary express shipping on all orders over $500. For orders below this amount, a flat rate of $25 applies.",
      "Our global logistics partners ensure your pieces arrive within 3-5 business days for international orders and 1-2 days for domestic delivery.",
      "Every shipment is fully insured and requires a signature upon delivery to ensure your luxury items reach you safely."
    ]
  },
  'privacy': {
    icon: Shield,
    text: [
      "Your privacy is our utmost priority. We use industry-leading encryption to protect your personal and financial data.",
      "We never sell your information to third parties. Your data is used solely to enhance your shopping experience and fulfill your orders.",
      "You have full control over your data and can request a copy or deletion of your information at any time."
    ]
  },
  'terms': {
    icon: Shield,
    text: [
      "By using Zyphora, you agree to our terms of service which govern the use of our platform and the purchase of our products.",
      "All content on this site is the intellectual property of Zyphora and may not be used without explicit permission.",
      "We reserve the right to update these terms as our services evolve to better serve our community."
    ]
  },
  'faq': {
    icon: HelpCircle,
    text: [
      "How do I track my order? Once your order ships, you will receive a tracking number via email.",
      "What is your return policy? We accept returns within 14 days of delivery for items in original condition.",
      "Do you offer international shipping? Yes, we ship to over 150 countries worldwide."
    ]
  },
  'sustainability': {
    icon: Leaf,
    text: [
      "Zyphora is committed to ethical luxury. We partner with ateliers that prioritize sustainable practices and fair wages.",
      "Our packaging is 100% recyclable and made from FSC-certified materials.",
      "We are working towards becoming carbon neutral by 2030 through carbon offset programs and renewable energy."
    ]
  },
  'careers': {
    icon: Briefcase,
    text: [
      "Join a team of visionaries, artisans, and innovators. We are always looking for talent that shares our passion for luxury.",
      "We offer a dynamic work environment, competitive benefits, and the opportunity to shape the future of fashion.",
      "Explore our open positions in design, technology, and operations."
    ]
  },
  'contact': {
    icon: Mail,
    text: [
      "Our concierge team is available 24/7 to assist you with any inquiries.",
      "Email us at concierge@zyphora.com or call us at +1 (800) ZYPHORA.",
      "Visit our flagship atelier in New York for a personalized shopping experience."
    ]
  }
};

export const InfoPage = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop() || '';
  const title = path.replace(/-/g, ' ') || 'Information';
  const content = CONTENT_MAP[path] || {
    icon: HelpCircle,
    text: [
      "Welcome to the " + title + " page. At Zyphora, we are committed to providing a seamless and transparent experience.",
      "This section is currently being updated with the latest information regarding our " + title + " policies.",
      "Should you have any immediate inquiries, please do not hesitate to reach out to our concierge team."
    ]
  };

  const Icon = content.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-32 space-y-12"
    >
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-6">
          <div className="h-16 w-16 bg-black/5 rounded-2xl flex items-center justify-center">
            <Icon className="h-8 w-8 text-black" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tighter capitalize gold-shimmer">{title}</h1>
        </div>
        
        <div className="h-[1px] w-full bg-border/50" />
        
        <div className="space-y-8 text-lg text-muted-foreground font-light leading-relaxed">
          {content.text.map((paragraph, index) => (
            <motion.p 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        <div className="pt-12">
          <button 
            onClick={() => window.history.back()}
            className="text-[10px] font-bold uppercase tracking-[0.3em] hover:text-black transition-colors flex items-center gap-4"
          >
            <span className="h-[1px] w-8 bg-black/20" />
            Return to Previous
          </button>
        </div>
      </div>
    </motion.div>
  );
};
