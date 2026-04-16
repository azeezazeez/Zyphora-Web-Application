import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { productApi } from '../services/api';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stockQuantity: number;
  brand?: string;
  size?: string;
  color?: string;
  available: boolean;
  reviews?: number;
}

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      console.log('Fetching product with ID:', id);
      fetchProductDetails();
    } else {
      console.error('No product ID provided');
      navigate('/shop');
    }
  }, [id]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching product with ID:', id);

      // Validate ID
      if (!id || id === 'undefined' || id === 'null' || isNaN(Number(id))) {
        console.error('Invalid product ID:', id);
        toast.error('Invalid product ID');
        navigate('/shop');
        return;
      }

      const productResponse = await productApi.getById(id);
      const productData = productResponse.data;

      console.log('Product API Response:', productData);

      if (!productData || !productData.id) {
        throw new Error('Product not found');
      }

      const mappedProduct: Product = {
        id: String(productData.id),
        name: productData.name,
        description: productData.description || '',
        price: Number(productData.price),
        category: productData.category,
        image: productData.image,
        rating: productData.rating || 0,
        stockQuantity: productData.stockQuantity || 0,
        brand: productData.brand,
        size: productData.size,
        color: productData.color,
        available: productData.available !== undefined ? productData.available : true,
        reviews: productData.reviews || 0
      };

      console.log('Mapped product:', mappedProduct);
      setProduct(mappedProduct);

      // Fetch related products (same category, excluding current)
      const allProductsResponse = await productApi.getAll();
      const allProducts = allProductsResponse.data || [];
      const related = allProducts
        .filter((p: any) => p.category === productData.category && String(p.id) !== String(id))
        .slice(0, 4);
      setRelatedProducts(related);

    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      console.error('Error details:', error.response?.data);

      if (error.response?.status === 404) {
        toast.error('Product not found');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load product');
      }
      navigate('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.available && product.stockQuantity > 0) {
      // Pass just the product, CartContext will handle creating CartItem
      addToCart(product);
      toast.success(`Added ${quantity} × ${product.name} to bag`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleAddToWishlist = () => {
    toast.success(`${product?.name} added to wishlist`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
          <p className="text-[10px] uppercase tracking-widest">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-40 text-center">
        <p className="font-serif text-2xl">Product not found</p>
        <Button onClick={() => navigate('/shop')} className="mt-6">
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-6 py-20"
    >
      {/* Rest of your JSX remains the same */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="aspect-[3/4] overflow-hidden bg-muted relative group">
            <motion.img
              src={product.image}
              alt={product.name}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full object-cover"
            />
            {product.stockQuantity <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-widest px-4 py-2 border border-white">
                  Out of Stock
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                <img src={product.image} alt={`${product.name} view ${i}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info - Rest remains the same */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center space-y-10"
        >
          {/* ... rest of your product info JSX ... */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-black/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">{product.category}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-tight">{product.name}</h1>
            <div className="flex items-center gap-6">
              <p className="text-3xl font-serif">${product.price.toLocaleString()}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  ({product.reviews || 0} Reviews)
                </span>
              </div>
            </div>
          </div>

          <p className="text-lg font-light text-muted-foreground leading-relaxed text-balance">
            {product.description}
          </p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${product.stockQuantity > 10 ? 'bg-green-500' :
              product.stockQuantity > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            <span className="text-[10px] uppercase tracking-widest">
              {product.stockQuantity > 10 ? 'In Stock' :
                product.stockQuantity > 0 ? `Only ${product.stockQuantity} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Size Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Select Size</h3>
              <Button variant="link" className="text-[10px] uppercase tracking-widest p-0 h-auto">Size Guide</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-14 w-14 text-xs font-bold transition-all duration-300 ${selectedSize === size
                    ? 'bg-black text-white'
                    : 'bg-transparent border border-gray-300 text-gray-500 hover:border-black hover:text-black'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em]">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 border border-black/10 hover:bg-black hover:text-white transition-colors"
                disabled={product.stockQuantity <= 0}
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="h-10 w-10 border border-black/10 hover:bg-black hover:text-white transition-colors"
                disabled={quantity >= product.stockQuantity || product.stockQuantity <= 0}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              className="flex-1 h-16 rounded-none text-xs uppercase tracking-[0.3em] font-bold"
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
            >
              {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Bag'}
            </Button>
            <Button
              variant="outline"
              className="h-16 w-16 rounded-none border-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="pt-12">
            <div className="flex border-b border-gray-200">
              {['details', 'shipping', 'returns'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-light text-gray-600 leading-relaxed"
                >
                  {activeTab === 'details' && (
                    <ul className="space-y-4 list-disc pl-4">
                      <li>100% Ethically sourced premium materials</li>
                      <li>Hand-finished detailing by master artisans</li>
                      <li>Signature Zyphora tailored fit</li>
                      <li>Dry clean only</li>
                      {product.color && <li>Color: {product.color}</li>}
                    </ul>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="space-y-2">
                      <p>Complimentary express shipping on all orders over $500.</p>
                      <p>Standard delivery within 3-5 business days.</p>
                      <p>International shipping available to over 50 countries.</p>
                    </div>
                  )}
                  {activeTab === 'returns' && (
                    <div className="space-y-2">
                      <p>We offer a 30-day return policy for all unworn items in their original packaging.</p>
                      <p>Returns are complimentary for our Inner Circle members.</p>
                      <p>Contact our concierge team for any return requests.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-40 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-4xl md:text-6xl tracking-tighter">You May Also <span className="italic">Admire</span></h2>
            <div className="h-[1px] w-24 bg-black/10 mx-auto" />
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};