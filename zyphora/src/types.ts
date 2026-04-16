// src/types.ts

// In types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stockQuantity: number;
  stock?: number;
  status?: string;
  brand?: string;
  size?: string;
  color?: string;
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  token: string
  email: string;
  role: 'USER' | 'ADMIN';     // Changed to uppercase to match backend
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  active: boolean;            // New field from backend
  createdAt?: string;         // New field from backend
  updatedAt?: string;         // New field from backend
  deletionScheduledAt?: string;
}

export interface Order {
  id: string;
  userId: string;              // Keep for reference
  user?: {                     // Nested user object from backend
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];          // Changed from CartItem to OrderItem
  address: Address;            // Changed to full Address object
  paymentMethod: string;       // New field from backend
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';  // Uppercase to match backend
  subtotal: number;            // New field from backend
  tax: number;                 // New field from backend
  shippingCost: number;        // New field from backend
  total: number;               // Keep this
  trackingNumber?: string;     // New field from backend
  createdAt: string;
  updatedAt: string;           // New field from backend
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;           // Optional nested product
  quantity: number;
  price: number;
  subtotal: number;            // Calculated field (price * quantity)
}

export interface Address {
  street: string;
  city: string;
  state?: string;              // New field from backend
  zipCode: string;             // Changed from 'zip' to 'zipCode'
  country: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

// Helper type for order status display
export const OrderStatusDisplay = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
} as const;

// Helper function to get product status from stock quantity
export function getProductStatus(stockQuantity: number): string {
  if (stockQuantity <= 0) return 'Out of Stock';
  if (stockQuantity < 10) return 'Low Stock';
  return 'In Stock';
}

// Helper function to map backend product to frontend product
export function mapProduct(backendProduct: any): Product {
  return {
    id: backendProduct.id.toString(),
    name: backendProduct.name,
    description: backendProduct.description,
    price: backendProduct.price,
    category: backendProduct.category,
    image: backendProduct.image,
    rating: backendProduct.rating || 0,
    stockQuantity: backendProduct.stockQuantity || 0,
    status: getProductStatus(backendProduct.stockQuantity || 0),
    brand: backendProduct.brand,
    size: backendProduct.size,
    color: backendProduct.color,
    available: backendProduct.available !== undefined ? backendProduct.available : true,
    stock: backendProduct.stockQuantity || 0  // For compatibility
  };
}

// Helper function to map backend order to frontend order
export function mapOrder(backendOrder: any): Order {
  return {
    id: backendOrder.id.toString(),
    userId: backendOrder.user?.id?.toString() || '',
    user: backendOrder.user,
    items: backendOrder.items?.map((item: any) => ({
      id: item.id.toString(),
      productId: item.product?.id?.toString() || '',
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    })) || [],
    address: backendOrder.address,
    paymentMethod: backendOrder.paymentMethod,
    status: backendOrder.status,
    subtotal: backendOrder.subtotal,
    tax: backendOrder.tax,
    shippingCost: backendOrder.shippingCost,
    total: backendOrder.total,
    trackingNumber: backendOrder.trackingNumber,
    createdAt: backendOrder.createdAt,
    updatedAt: backendOrder.updatedAt
  };
}