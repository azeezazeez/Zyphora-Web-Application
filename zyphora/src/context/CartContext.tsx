import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Product | CartItem) => void;  // Allow both Product and CartItem
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('zyphora_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('zyphora_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Product | CartItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);

      // Get quantity from item if it's a CartItem, otherwise default to 1
      const quantityToAdd = 'quantity' in item ? item.quantity : 1;

      if (existing) {
        toast.success(`Increased ${item.name} quantity`);
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem
        );
      }

      // Create a CartItem from the product
      const newCartItem: CartItem = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        image: item.image,
        rating: item.rating || 0,
        stockQuantity: (item as any).stockQuantity || (item as any).stock || 0,
        brand: (item as any).brand,
        size: (item as any).size,
        color: (item as any).color,
        available: (item as any).available !== undefined ? (item as any).available : true,
        quantity: quantityToAdd
      };

      toast.success(`Added ${item.name} to cart`);
      setIsCartOpen(true);
      return [...prev, newCartItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    toast.info('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};