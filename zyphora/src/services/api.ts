import axios from 'axios';
import { Product, User, Order, NewsletterSubscriber, mapProduct, mapOrder } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    console.log(`[API] 📤 ${config.method?.toUpperCase()} request to: ${config.url}`);

    const user = localStorage.getItem('zyphora_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const token = userData.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[API] 🔑 JWT Token added for request to: ${config.url}`);
          console.log(`[API] 🔑 Token preview: ${token.substring(0, 30)}...`);
        } else {
          console.warn(`[API] ⚠️ No JWT token found for request: ${config.url}`);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    } else {
      console.warn(`[API] ⚠️ No user found in localStorage for request: ${config.url}`);
    }

    // Log request body for POST/PUT/PATCH
    if (config.data && (config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
      console.log(`[API] 📦 Request body:`, config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API] ❌ Error response from ${error.config?.url}:`, error.response?.status);

    if (error.response?.status === 401) {
      console.log('[API] 🔐 401 Unauthorized - Token invalid or expired');
      localStorage.removeItem('zyphora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const authApi = {
  login: (credentials: any) => {
    console.log('[API] Login request:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  register: (userData: any) => api.post('/auth/register', userData),
  updateProfile: (data: Partial<User>) => api.patch('/user/profile', data),
  deleteAccount: () => api.delete('/user/account'),
  getCurrentUser: () => {
    console.log('[API] Fetching current user profile');
    return api.get('/user/profile');
  },
  refreshToken: () => api.post('/auth/refresh-token'),
  updatePassword: (data: { current: string; new: string }) => api.patch('/user/password', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (data: { email: string; otp: string }) => api.post('/auth/verify-otp', data),
  resetPassword: (data: { email: string; newPassword: string }) => api.post('/auth/reset-password', data),
  getMyOrders: () => api.get('/orders/my-orders'),
};

// --- Product Endpoints ---
// --- Product Endpoints ---
export const productApi = {
  getAll: async (params?: { category?: string; featured?: boolean; search?: string }) => {
    try {
      const response = await api.get('/products', { params });
      let products = [];

      if (Array.isArray(response.data)) {
        products = response.data.map((p: any) => ({
          ...p,
          id: String(p.id),
          stock: p.stockQuantity,
          status: p.stockQuantity <= 0 ? 'Out of Stock' :
            p.stockQuantity < 10 ? 'Low Stock' : 'In Stock'
        }));
      } else if (response.data?.products) {
        products = response.data.products.map((p: any) => ({
          ...p,
          id: String(p.id),
          stock: p.stockQuantity,
          status: p.stockQuantity <= 0 ? 'Out of Stock' :
            p.stockQuantity < 10 ? 'Low Stock' : 'In Stock'
        }));
      } else if (response.data?.data) {
        products = response.data.data.map((p: any) => ({
          ...p,
          id: String(p.id),
          stock: p.stockQuantity,
          status: p.stockQuantity <= 0 ? 'Out of Stock' :
            p.stockQuantity < 10 ? 'Low Stock' : 'In Stock'
        }));
      } else {
        products = [];
      }

      console.log(`[Product API] Fetched ${products.length} products`);
      return { ...response, data: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], status: 200 };
    }
  },

  getById: async (id: string) => {
    try {
      console.log(`[Product API] Fetching product with ID: ${id}`);
      const response = await api.get(`/products/${id}`);

      // Ensure id is string for frontend
      const productData = response.data;
      if (productData) {
        productData.id = String(productData.id);
        productData.stock = productData.stockQuantity;
        productData.status = productData.stockQuantity <= 0 ? 'Out of Stock' :
          productData.stockQuantity < 10 ? 'Low Stock' : 'In Stock';
      }

      console.log(`[Product API] Product fetched:`, productData?.name);
      return response;
    } catch (error: any) {
      console.error(`[Product API] Error fetching product ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [], status: 200 };
    }
  },

  create: async (product: any) => {
    try {
      const backendProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stockQuantity: product.stock || product.stockQuantity || 0,
        rating: product.rating || 0,
        brand: product.brand,
        size: product.size,
        color: product.color,
        available: product.available !== undefined ? product.available : true
      };
      const response = await api.post('/products', backendProduct);
      response.data.id = String(response.data.id);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id: string, product: any) => {
    try {
      const backendProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stockQuantity: product.stock || product.stockQuantity || 0,
        rating: product.rating || 0,
        brand: product.brand,
        size: product.size,
        color: product.color,
        available: product.available !== undefined ? product.available : true
      };
      const response = await api.patch(`/products/${id}`, backendProduct);
      response.data.id = String(response.data.id);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

// --- Order Endpoints ---
export const orderApi = {
  placeOrder: async (orderData: any) => {
    try {
      console.log('[Order API] 📝 Placing order with data:', orderData);

      // Validate required fields
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('No items in order');
      }

      if (!orderData.address || !orderData.address.street || !orderData.address.city || !orderData.address.zipCode) {
        throw new Error('Complete address is required');
      }

      // Transform frontend order to backend format
      const backendOrder = {
        subtotal: Number(orderData.subtotal) || 0,
        tax: Number(orderData.tax) || 0,
        shippingCost: Number(orderData.shippingCost) || 0,
        total: Number(orderData.total) || 0,
        paymentMethod: orderData.paymentMethod || 'CREDIT_CARD',
        address: {
          street: orderData.address?.street || '',
          city: orderData.address?.city || '',
          state: orderData.address?.state || '',
          zipCode: orderData.address?.zipCode || orderData.address?.zip || '',
          country: orderData.address?.country || 'United States'
        },
        items: orderData.items.map((item: any) => ({
          productId: item.productId || item.id,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }))
      };

      console.log('[Order API] 📦 Sending to backend:', backendOrder);

      // The JWT token will be automatically added by the interceptor
      const response = await api.post('/orders', backendOrder);
      console.log('[Order API] ✅ Order placed successfully:', response.data);

      return response;
    } catch (error: any) {
      console.error('[Order API] ❌ Error placing order:', error);

      if (error.response) {
        console.error('[Order API] Error response data:', error.response.data);
        console.error('[Order API] Error response status:', error.response.status);
      }

      throw error;
    }
  },

  getMyOrders: async () => {
    try {
      console.log('[Order API] 📝 Fetching my orders');
      const response = await api.get('/orders/my-orders');
      let orders = [];
      if (Array.isArray(response.data)) {
        orders = response.data;
      } else if (response.data?.content) {
        orders = response.data.content;
      } else if (response.data?.orders) {
        orders = response.data.orders;
      } else {
        orders = [];
      }
      console.log(`[Order API] ✅ Fetched ${orders.length} orders`);
      return { ...response, data: orders };
    } catch (error) {
      console.error('[Order API] ❌ Error fetching my orders:', error);
      return { data: [], status: 200 };
    }
  },

  getAllOrders: async () => {
    try {
      console.log('[Order API] 📝 Fetching all orders (admin)');
      const response = await api.get('/orders');
      const orders = Array.isArray(response.data) ? response.data.map(mapOrder) : [];
      console.log(`[Order API] ✅ Fetched ${orders.length} orders`);
      return { ...response, data: orders };
    } catch (error) {
      console.error('[Order API] ❌ Error fetching all orders:', error);
      return { data: [], status: 200 };
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      console.log(`[Order API] 📝 Updating order ${id} status to ${status}`);
      const response = await api.patch(`/orders/${id}/status`, { status });
      console.log('[Order API] ✅ Order status updated');
      return response;
    } catch (error) {
      console.error('[Order API] ❌ Error updating order status:', error);
      throw error;
    }
  },
};

// --- Newsletter Endpoints ---
export const newsletterApi = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
  getSubscribers: async () => {
    try {
      const response = await api.get('/newsletter/subscribers');
      const subscribers = Array.isArray(response.data) ? response.data : [];
      return { ...response, data: subscribers };
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return { data: [], status: 200 };
    }
  },
  deleteSubscriber: (id: string) => api.delete(`/newsletter/subscribers/${id}`),
};

// --- Admin Endpoints ---
export const adminApi = {
  getDashboardStats: () => api.get('/admin/stats'),
  exportCustomers: () => api.get('/admin/export/customers', { responseType: 'blob' }),
  exportOrders: () => api.get('/admin/export/orders', { responseType: 'blob' }),
};

export default api;