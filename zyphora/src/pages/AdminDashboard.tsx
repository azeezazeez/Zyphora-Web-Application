import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Settings,
  BarChart3,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Trash2,
  Edit,
  Mail
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { productApi, orderApi, newsletterApi } from '../services/api';

// Chart data (sample data for visualization)
const REVENUE_DATA = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 9000 },
  { name: 'Thu', revenue: 5000 },
  { name: 'Fri', revenue: 8000 },
  { name: 'Sat', revenue: 12000 },
  { name: 'Sun', revenue: 10000 },
];

const CATEGORY_DATA = [
  { name: 'Apparel', value: 45 },
  { name: 'Accessories', value: 25 },
  { name: 'Beauty', value: 20 },
  { name: 'Footwear', value: 10 },
];

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  stockQuantity?: number;
  status: string;
  image: string;
  rating?: number;
  brand?: string;
  size?: string;
  color?: string;
  available?: boolean;
}

interface Order {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  paymentMethod?: string;
  createdAt: string;
  items?: any[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribedAt?: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Apparel',
    price: 0,
    stock: 0,
    status: 'In Stock',
    image: '',
    description: '',
    rating: 0,
  });
  const [orderFilter, setOrderFilter] = useState('All');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0', change: '+0%', icon: DollarSign },
    { label: 'Active Orders', value: '0', change: '+0', icon: Package },
    { label: 'New Customers', value: '0', change: '+0%', icon: Users },
    { label: 'Conversion Rate', value: '0%', change: '+0%', icon: TrendingUp },
  ]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const productsResponse = await productApi.getAll();
      const productsData: Product[] = productsResponse.data || [];
      setAdminProducts(productsData);

      // Fetch orders - with error handling so dashboard still loads
      let ordersData: Order[] = [];
      try {
        const ordersResponse = await orderApi.getAllOrders();
        ordersData = ordersResponse.data || [];
        setRecentOrders(ordersData);
      } catch (orderError: any) {
        console.error('Failed to fetch orders:', orderError);
        toast.error('Could not load orders data. Please check backend.');
        setRecentOrders([]);
      }

      // Fetch subscribers
      try {
        const subscribersResponse = await newsletterApi.getSubscribers();
        setSubscribers(subscribersResponse.data || []);
      } catch (error) {
        console.log('Error fetching subscribers:', error);
        setSubscribers([]);
      }

      // Calculate stats from real data
      const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
      const activeOrdersCount = ordersData.filter((order: Order) =>
        order.status === 'PROCESSING' || order.status === 'SHIPPED'
      ).length;

      setStats([
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign },
        { label: 'Active Orders', value: activeOrdersCount.toString(), change: '+5', icon: Package },
        { label: 'New Customers', value: customers.length.toString(), change: '+24%', icon: Users },
        { label: 'Conversion Rate', value: ordersData.length > 0 ? ((activeOrdersCount / ordersData.length) * 100).toFixed(1) : '0', change: '+0.4%', icon: TrendingUp },
      ]);

      // Extract unique customers from orders
      const uniqueCustomers = new Map<string, Customer>();
      ordersData.forEach((order: Order) => {
        const orderUser = order.user || order.customer;
        if (orderUser && orderUser.id && !uniqueCustomers.has(orderUser.id)) {
          uniqueCustomers.set(orderUser.id, {
            id: orderUser.id,
            name: orderUser.name || 'Guest',
            email: orderUser.email || 'no-email@example.com',
            orders: 1,
            spent: order.total || 0,
            joined: order.createdAt || new Date().toISOString()
          });
        } else if (orderUser && orderUser.id && uniqueCustomers.has(orderUser.id)) {
          const existing = uniqueCustomers.get(orderUser.id)!;
          existing.orders += 1;
          existing.spent += order.total || 0;
          uniqueCustomers.set(orderUser.id, existing);
        }
      });
      setCustomers(Array.from(uniqueCustomers.values()));

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productApi.delete(id);
      setAdminProducts(prev => prev.filter((p: Product) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      const updateData = {
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: Number(editingProduct.price),
        category: editingProduct.category,
        image: editingProduct.image,
        stockQuantity: Number(editingProduct.stock),
        status: editingProduct.status,
        rating: editingProduct.rating || 0,
      };

      const response = await productApi.update(editingProduct.id, updateData);
      const updatedProduct = response.data;

      if (updatedProduct && updatedProduct.id) {
        const mappedProduct: Product = {
          ...updatedProduct,
          stock: updatedProduct.stockQuantity || updatedProduct.stock,
          status: updatedProduct.stockQuantity <= 0 ? 'Out of Stock' : 
                  updatedProduct.stockQuantity < 10 ? 'Low Stock' : 'In Stock'
        };
        setAdminProducts(prev => prev.map((p: Product) =>
          p.id === editingProduct.id ? mappedProduct : p
        ));
        toast.success('Product updated successfully');
      } else {
        const productsResponse = await productApi.getAll();
        setAdminProducts(productsResponse.data || []);
        toast.success('Product updated successfully');
      }

      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) {
      toast.error('Product name is required');
      return;
    }
    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description || '',
        price: Number(newProduct.price),
        category: newProduct.category,
        image: newProduct.image,
        stockQuantity: Number(newProduct.stock),
        status: newProduct.status,
        rating: newProduct.rating || 0,
      };

      const response = await productApi.create(productData);
      const addedProduct = response.data;

      if (addedProduct && addedProduct.id) {
        const mappedProduct: Product = {
          ...addedProduct,
          stock: addedProduct.stockQuantity || addedProduct.stock,
          status: addedProduct.stockQuantity <= 0 ? 'Out of Stock' : 
                  addedProduct.stockQuantity < 10 ? 'Low Stock' : 'In Stock'
        };
        setAdminProducts(prev => [...prev, mappedProduct]);
        toast.success('Product added successfully');
      } else {
        const productsResponse = await productApi.getAll();
        setAdminProducts(productsResponse.data || []);
        toast.success('Product added successfully');
      }

      setIsAddDialogOpen(false);
      setNewProduct({
        name: '',
        category: 'Apparel',
        price: 0,
        stock: 0,
        status: 'In Stock',
        image: '',
        description: '',
        rating: 0,
      });
    } catch (error: any) {
      console.error('Add error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleExportOrders = () => {
    if (recentOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    const headers = ['Order ID', 'Customer', 'Status', 'Amount', 'Date'];
    const csvContent = [
      headers.join(','),
      ...recentOrders.map((o: Order) => [
        o.id,
        `"${o.user?.name || o.customer?.name || 'Guest'}"`,
        o.status,
        o.total,
        new Date(o.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zyphora_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  const handleExportCustomers = () => {
    if (customers.length === 0) {
      toast.error('No customers to export');
      return;
    }
    const headers = ['Name', 'Email', 'Orders', 'Spent', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...customers.map((c: Customer) => [
        `"${c.name}"`,
        c.email,
        c.orders,
        c.spent,
        new Date(c.joined).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zyphora_customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Customer list exported successfully');
  };

  const handleLast30Days = () => {
    toast.info('Filtering analytics for the last 30 days...');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredProducts = adminProducts.filter((p: Product) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = recentOrders.filter((o: Order) => {
    const matchesSearch = o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.user?.name || o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCustomers = customers.filter((c: Customer) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-xs uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Rest of the render functions remain the same...
  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-black/5 border border-black/10 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="h-12 w-12" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-4">{stat.label}</p>
            <div className="flex items-end gap-4">
              <h3 className="text-4xl font-serif">{stat.value}</h3>
              <span className="text-[10px] font-bold text-green-500 mb-2">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-8 bg-black/5 border border-black/10"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Revenue Projection</h3>
            <div className="flex gap-4">
              <button className="text-[9px] font-bold uppercase tracking-widest text-black">Weekly</button>
              <button className="text-[9px] font-bold uppercase tracking-widest text-black/40">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                <XAxis dataKey="name" stroke="#00000040" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#00000040" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', fontSize: '10px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#000000" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-8 bg-black/5 border border-black/10"
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-10">Sales by Category</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#000000', '#00000080', '#00000040', '#00000020'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold">{cat.name}</span>
                <span className="text-[9px] uppercase tracking-widest text-black font-bold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-8 bg-black/5 border border-black/10"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Recent Transactions</h3>
          <Button variant="link" onClick={() => setActiveTab('orders')} className="text-[9px] uppercase tracking-widest text-black p-0 h-auto">
            View All
          </Button>
        </div>
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-black/10">
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Order ID</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Customer</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Status</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Amount</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.slice(0, 5).map((order: Order) => (
                  <tr key={order.id} className="group hover:bg-black/5 transition-colors">
                    <td className="py-6 text-[10px] font-bold tracking-widest">{order.id}</td>
                    <td className="py-6 text-[10px] font-light text-black/60">{order.user?.name || order.customer?.name || 'Guest'}</td>
                    <td className="py-6">
                      <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest ${
                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                        order.status === 'PROCESSING' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-6 text-[10px] font-bold">${order.total}</td>
                    <td className="py-6 text-[10px] font-light text-black/40">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[10px] uppercase tracking-widest text-black/40">No orders found</p>
          </div>
        )}
      </motion.div>
    </>
  );

  const renderProducts = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Inventory Management</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-black text-white hover:bg-black/90 text-[10px] uppercase tracking-widest font-bold px-6">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      <div className="p-8 bg-black/5 border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-black/10">
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Product</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Category</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Price</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Stock</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Status</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.map((product: Product) => (
                <tr key={product.id} className="group hover:bg-black/5 transition-colors">
                  <td className="py-6 text-[10px] font-bold tracking-widest">{product.name}</td>
                  <td className="py-6 text-[10px] font-light text-black/60">{product.category}</td>
                  <td className="py-6 text-[10px] font-bold">${product.price}</td>
                  <td className="py-6 text-[10px] font-light text-black/60">{product.stock}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest ${
                      product.status === 'In Stock' ? 'bg-green-500/10 text-green-500' :
                      product.status === 'Low Stock' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-black/40 hover:text-black h-8 w-8" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-black/40 hover:text-destructive h-8 w-8" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Order Fulfillment</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-black/5 border border-black/10 px-4 py-2">
            <Filter className="h-4 w-4 text-black/40" />
            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="bg-transparent text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer">
              <option value="All">All Status</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
          <Button variant="outline" onClick={handleExportOrders} className="border-black/10 text-[10px] uppercase tracking-widest font-bold px-6">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
      <div className="p-8 bg-black/5 border border-black/10">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-black/10">
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Order ID</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Customer</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Items</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Amount</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.map((order: Order) => (
                  <tr key={order.id} className="group hover:bg-black/5 transition-colors">
                    <td className="py-6 text-[10px] font-bold tracking-widest">{order.id}</td>
                    <td className="py-6 text-[10px] font-light text-black/60">{order.user?.name || order.customer?.name || 'Guest'}</td>
                    <td className="py-6 text-[10px] font-light text-black/60">{order.items?.length || 0} items</td>
                    <td className="py-6 text-[10px] font-bold">${order.total}</td>
                    <td className="py-6">
                      <select 
                        className="bg-transparent border border-black/10 text-[8px] font-bold uppercase tracking-widest px-2 py-1 outline-none"
                        value={order.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await orderApi.updateOrderStatus(order.id, newStatus);
                            setRecentOrders(prev => prev.map(o => 
                              o.id === order.id ? { ...o, status: newStatus } : o
                            ));
                            toast.success(`Order ${order.id} updated to ${newStatus}`);
                          } catch (error) {
                            toast.error('Failed to update order status');
                          }
                        }}
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[10px] uppercase tracking-widest text-black/40">No orders found</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Advanced Analytics</h3>
        <Button variant="outline" onClick={handleLast30Days} className="border-black/10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-black/5 border border-black/10">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8">User Engagement</h4>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                <XAxis dataKey="name" stroke="#00000040" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#00000040" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', fontSize: '10px' }} />
                <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-8 bg-black/5 border border-black/10">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Conversion Funnel</h4>
          <div className="space-y-8">
            {[
              { label: 'Visits', value: '12,450', percent: 100 },
              { label: 'Add to Cart', value: '2,840', percent: 22.8 },
              { label: 'Checkout', value: '1,120', percent: 8.9 },
              { label: 'Purchased', value: '420', percent: 3.4 },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>{item.label}</span>
                  <span className="text-black/40">{item.value} ({item.percent}%)</span>
                </div>
                <div className="h-1 w-full bg-black/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.percent}%` }} className="h-full bg-black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-12">
      <div className="space-y-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">General Configuration</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-black/40">Store Name</label>
            <input type="text" defaultValue="Zyphora Luxury" className="w-full bg-black/5 border border-black/10 px-4 py-3 text-xs focus:outline-none focus:border-black/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-black/40">Support Email</label>
            <input type="email" defaultValue="concierge@zyphora.com" className="w-full bg-black/5 border border-black/10 px-4 py-3 text-xs focus:outline-none focus:border-black/20" />
          </div>
          <div className="flex items-center justify-between p-4 bg-black/5 border border-black/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Maintenance Mode</p>
              <p className="text-[8px] text-black/40 uppercase tracking-widest mt-1">Disable storefront for public users</p>
            </div>
            <div onClick={() => setIsMaintenanceMode(!isMaintenanceMode)} className={`h-6 w-12 rounded-full relative cursor-pointer transition-colors ${isMaintenanceMode ? 'bg-black' : 'bg-black/10'}`}>
              <motion.div animate={{ x: isMaintenanceMode ? 24 : 4 }} className={`absolute top-1 h-4 w-4 rounded-full ${isMaintenanceMode ? 'bg-white' : 'bg-black/20'}`} />
            </div>
          </div>
        </div>
      </div>
      <Button onClick={() => toast.success('Settings updated successfully')} className="bg-black text-white hover:bg-black/90 text-[10px] uppercase tracking-widest font-bold px-12 h-12">
        Save Changes
      </Button>
    </motion.div>
  );

  const renderCustomers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Customer Directory</h3>
        <Button variant="outline" onClick={handleExportCustomers} className="border-black/10 text-[10px] uppercase tracking-widest font-bold px-6">
          <Download className="mr-2 h-4 w-4" /> Export List
        </Button>
      </div>
      <div className="p-8 bg-black/5 border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-black/10">
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Customer</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Email</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Orders</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Total Spent</th>
                <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCustomers.map((customer: Customer) => (
                <tr key={customer.id} className="group hover:bg-black/5 transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-full border border-black/10">
                        <AvatarFallback className="bg-black/5 text-black text-[10px] rounded-full uppercase">
                          {customer.name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-bold tracking-widest">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-6 text-[10px] font-light text-black/60">{customer.email}</td>
                  <td className="py-6 text-[10px] font-light text-black/60">{customer.orders}</td>
                  <td className="py-6 text-[10px] font-bold">${customer.spent.toLocaleString()}</td>
                  <td className="py-6 text-[10px] font-light text-black/40">{new Date(customer.joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderSubscribers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Newsletter Subscribers</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">{subscribers.length} Active Subscriptions</p>
      </div>
      <div className="p-8 bg-black/5 border border-black/10">
        {subscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-black/10">
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Email Address</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold">Subscription Date</th>
                  <th className="pb-6 text-[9px] uppercase tracking-widest text-black/40 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {subscribers.map((sub: Subscriber) => (
                  <tr key={sub.id} className="group hover:bg-black/5 transition-colors">
                    <td className="py-6 text-[10px] font-bold tracking-widest">{sub.email}</td>
                    <td className="py-6 text-[10px] font-light text-black/60">
                      {new Date(sub.subscribedAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = subscribers.filter((s: Subscriber) => s.id !== sub.id);
                          setSubscribers(updated);
                          toast.success('Subscriber removed');
                        }}
                        className="text-black/20 hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[10px] uppercase tracking-widest text-black/40">No subscribers yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black flex">
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 border-r border-black/5 flex flex-col p-8 space-y-12 shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-black rounded-none flex items-center justify-center">
            <span className="text-white font-serif text-xl font-bold">Z</span>
          </div>
          <h2 className="font-serif text-2xl tracking-tighter gold-shimmer">ZYPHORA</h2>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'subscribers', label: 'Subscribers', icon: Mail },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === item.id
                ? 'bg-black text-white'
                : 'text-black/40 hover:text-black hover:bg-black/5'
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-black/5 space-y-6">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black hover:bg-black/5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Website
          </button>
          <div className="flex items-center gap-4 px-2">
            <Avatar className="h-10 w-10 rounded-full border border-black/10">
              <AvatarFallback className="bg-black text-white rounded-full font-serif uppercase">{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest truncate">{user?.name}</p>
              <p className="text-[8px] uppercase tracking-widest text-black/40 font-medium">Administrator</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 text-black/40 hover:text-black hover:bg-black/5 text-[10px] uppercase tracking-widest h-12"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-4 h-4 w-4" />
              Exit Terminal
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-4 text-destructive hover:text-destructive hover:bg-destructive/10 text-[10px] uppercase tracking-widest h-12"
              onClick={handleLogout}
            >
              <LogOut className="mr-4 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl tracking-tighter capitalize">
              {activeTab === 'overview' ? 'Executive Overview' : `${activeTab} Management`}
            </h1>
            <p className="text-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              {activeTab === 'overview' ? 'Real-time performance metrics' : `Control and monitor your ${activeTab}`}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-black/5 border border-black/10">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">System Online</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-black/5 border border-black/10 min-w-[240px]">
              <Search className="h-4 w-4 text-black/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-full placeholder:text-black/20"
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'subscribers' && renderSubscribers()}
        </AnimatePresence>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white border-black/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Edit Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Product Name</label>
                <Input
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, name: e.target.value } : null)}
                  className="rounded-none border-black/10 focus:border-black transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Description</label>
                <Input
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, description: e.target.value } : null)}
                  className="rounded-none border-black/10 focus:border-black transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Price ($)</label>
                  <Input
                    type="number"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, price: Number(e.target.value) } : null)}
                    className="rounded-none border-black/10 focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Stock</label>
                  <Input
                    type="number"
                    value={editingProduct?.stock || ''}
                    onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, stock: Number(e.target.value) } : null)}
                    className="rounded-none border-black/10 focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category</label>
                <select
                  value={editingProduct?.category || ''}
                  onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, category: e.target.value } : null)}
                  className="w-full h-10 bg-transparent border border-black/10 px-3 text-sm outline-none focus:border-black transition-colors"
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Status</label>
                <select
                  value={editingProduct?.status || ''}
                  onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, status: e.target.value as any } : null)}
                  className="w-full h-10 bg-transparent border border-black/10 px-3 text-sm outline-none focus:border-black transition-colors"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Image URL</label>
                <Input
                  placeholder="Paste image link here"
                  value={editingProduct?.image || ''}
                  onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, image: e.target.value } : null)}
                  className="rounded-none border-black/10 focus:border-black transition-colors"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-none border-black/10 text-[10px] uppercase tracking-widest font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="rounded-none bg-black text-white hover:bg-black/90 text-[10px] uppercase tracking-widest font-bold"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white border-black/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Product Name</label>
                <Input
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="rounded-none border-black/10 focus:border-black transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Description</label>
                <Input
                  placeholder="Enter description"
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="rounded-none border-black/10 focus:border-black transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Price ($)</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="rounded-none border-black/10 focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Stock</label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="rounded-none border-black/10 focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full h-10 bg-transparent border border-black/10 px-3 text-sm outline-none focus:border-black transition-colors"
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Status</label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })}
                  className="w-full h-10 bg-transparent border border-black/10 px-3 text-sm outline-none focus:border-black transition-colors"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Image URL</label>
                <Input
                  placeholder="Paste image link here"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="rounded-none border-black/10 focus:border-black transition-colors"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-none border-black/10 text-[10px] uppercase tracking-widest font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                className="rounded-none bg-black text-white hover:bg-black/90 text-[10px] uppercase tracking-widest font-bold"
              >
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};