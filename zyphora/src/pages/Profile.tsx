import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { User as UserIcon, Package, Heart, Settings, LogOut, Save, MapPin, Phone, Mail, ChevronRight, Trash2, ShoppingBag, Camera, Upload, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi, orderApi } from '../services/api';

type TabType = 'personal' | 'orders' | 'wishlist' | 'settings';

export const Profile = () => {
  const { user, logout, updateProfile, deleteAccount, refreshUserData } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab') as TabType;
  
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'request' | 'verify'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchUserOrders();
    }
  }, [activeTab, user]);

  const fetchUserOrders = async () => {
  setIsLoadingOrders(true);
  try {
    const response = await orderApi.getMyOrders();
    console.log('Orders API Response:', response);
    
    // Handle different response structures
    let orders = [];
    if (Array.isArray(response.data)) {
      orders = response.data;
    } else if (response.data?.content && Array.isArray(response.data.content)) {
      orders = response.data.content; // Paginated response
    } else if (response.data?.orders && Array.isArray(response.data.orders)) {
      orders = response.data.orders;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      orders = response.data.data;
    } else {
      orders = [];
    }
    
    console.log('Processed orders:', orders);
    setUserOrders(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    setUserOrders([]);
  } finally {
    setIsLoadingOrders(false);
  }
};

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
      });
    }
  }, [user]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      await authApi.updatePassword({
        current: passwordData.current,
        new: passwordData.new
      });
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleNotificationUpdate = () => {
    toast.success('Notification preferences saved');
    setShowNotificationModal(false);
  };

  const handleSendOtp = async () => {
    if (!user) return;
    setIsSendingOtp(true);
    try {
      await authApi.forgotPassword(user.email);
      setDeleteStep('verify');
      toast.success(`OTP sent to ${user.email}`);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await authApi.verifyOTP({ email: user.email, otp: otpValue });
      await deleteAccount();
      toast.success('Account permanently deleted');
      navigate('/');
    } catch (error: any) {
      console.error('Deletion error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP or deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await updateProfile({ avatar: reader.result as string });
          toast.success('Profile picture updated');
          setShowAvatarModal(false);
        } catch (error) {
          toast.error('Failed to update profile picture');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPredefinedAvatar = async (url: string) => {
    try {
      await updateProfile({ avatar: url });
      toast.success('Profile picture updated');
      setShowAvatarModal(false);
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  if (!user) return null;

  const handleSave = async () => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || !trimmedEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (trimmedName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.phone) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10 && digitsOnly.length !== 0) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }
    }

    try {
      const updateData: any = {};
      if (trimmedName !== user.name) updateData.name = trimmedName;
      if (trimmedEmail !== user.email) updateData.email = trimmedEmail;
      if (formData.phone !== user.phone) updateData.phone = formData.phone;
      if (formData.address !== user.address) updateData.address = formData.address;
      if (formData.city !== user.city) updateData.city = formData.city;
      if (formData.country !== user.country) updateData.country = formData.country;

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }

      await updateProfile(updateData);
      await refreshUserData();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const navItems = [
    { id: 'personal' as TabType, label: 'Personal Information', icon: UserIcon },
    { id: 'orders' as TabType, label: 'Order History', icon: Package },
    { id: 'wishlist' as TabType, label: 'My Wishlist', icon: Heart },
    { id: 'settings' as TabType, label: 'Account Settings', icon: Settings },
  ];

  // Helper function to format order status for display
  const getOrderStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'PENDING': { label: 'Pending', color: 'bg-gray-500/10 text-gray-500' },
      'PROCESSING': { label: 'Processing', color: 'bg-yellow-500/10 text-yellow-500' },
      'SHIPPED': { label: 'Shipped', color: 'bg-blue-500/10 text-blue-500' },
      'DELIVERED': { label: 'Delivered', color: 'bg-green-500/10 text-green-500' },
      'CANCELLED': { label: 'Cancelled', color: 'bg-red-500/10 text-red-500' },
    };
    return statusMap[status] || { label: status || 'Processing', color: 'bg-yellow-500/10 text-yellow-500' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-6 py-32"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-28 w-28 bg-black rounded-full flex items-center justify-center overflow-hidden border border-black/5 shadow-inner relative">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white font-serif text-4xl font-bold uppercase">{user.name[0].toUpperCase()}</span>
                )}
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div>
              <h1 className="font-serif text-3xl tracking-tight gold-shimmer">{user.name}</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all text-left rounded-xl ${
                  activeTab === item.id 
                    ? 'bg-black text-white shadow-lg shadow-black/10' 
                    : 'hover:bg-muted text-muted-foreground hover:text-black'
                }`}
              >
                <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-white' : ''}`} />
                {item.label}
                {item.id === 'wishlist' && wishlist.length > 0 && (
                  <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[8px]">
                    {wishlist.length}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-colors text-left mt-8 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 sm:p-10 bg-white border border-black/5 rounded-[2.5rem] shadow-sm space-y-10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Personal Information</h2>
                    <p className="text-2xl font-serif gold-shimmer">Account Details</p>
                  </div>
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="rounded-xl px-8 text-[10px] uppercase tracking-widest font-bold h-12 w-full lg:w-auto shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                  >
                    {isEditing ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : 'Edit Profile'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-muted/30 border border-transparent px-12 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all disabled:opacity-50 font-serif italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                      <input
                        type="email"
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-muted/30 border border-transparent px-12 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all disabled:opacity-50 font-serif italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                      <input
                        type="tel"
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-muted/30 border border-transparent px-12 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all disabled:opacity-50 font-serif italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Shipping Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        placeholder="123 Luxury Ave"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-muted/30 border border-transparent px-12 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all disabled:opacity-50 font-serif italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">City</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-muted/30 border border-transparent px-6 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all disabled:opacity-50 font-serif italic"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Country</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-muted/30 border border-transparent px-6 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all disabled:opacity-50 font-serif italic"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 bg-white border border-black/5 rounded-[2.5rem] shadow-sm space-y-8"
              >
                <div className="space-y-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Order History</h2>
                  <p className="text-2xl font-serif gold-shimmer">Recent Purchases</p>
                </div>
                <div className="space-y-6">
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <Package className="h-12 w-12 text-black/10" />
                      <p className="text-sm font-light italic text-muted-foreground">No recent orders found.</p>
                      <Button onClick={() => navigate('/shop')} variant="outline" className="rounded-xl px-8 text-[10px] uppercase tracking-widest font-bold h-12">
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order: any) => {
                        const statusDisplay = getOrderStatusDisplay(order.status);
                        return (
                          <div key={order.id} className="border border-black/5 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-black/40">Order #{order.id}</p>
                                <p className="text-xs font-bold mt-1">${order.total || order.totalAmount || 0}</p>
                                {order.items && order.items.length > 0 && (
                                  <p className="text-[10px] text-black/40 mt-1">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider rounded-full ${statusDisplay.color}`}>
                                {statusDisplay.label}
                              </span>
                            </div>
                            <div className="text-[10px] text-black/40 space-y-1">
                              {order.paymentMethod && <p>Payment: {order.paymentMethod}</p>}
                              {order.trackingNumber && <p>Tracking: {order.trackingNumber}</p>}
                              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 bg-white border border-black/5 rounded-[2.5rem] shadow-sm space-y-8"
              >
                <div className="space-y-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">My Wishlist</h2>
                  <p className="text-2xl font-serif gold-shimmer">Saved Items</p>
                </div>
                
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Heart className="h-12 w-12 text-black/10" />
                    <p className="text-sm font-light italic text-muted-foreground">Your wishlist is empty.</p>
                    <Button onClick={() => navigate('/shop')} variant="outline" className="rounded-xl px-8 text-[10px] uppercase tracking-widest font-bold h-12">
                      Browse Collection
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.map((product) => (
                      <div key={product.id} className="flex gap-4 p-4 border border-black/5 rounded-2xl group hover:border-black/10 transition-all">
                        <div className="h-24 w-20 overflow-hidden rounded-xl bg-muted">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h4 className="font-serif text-sm font-bold">{product.name}</h4>
                            <p className="text-xs font-bold mt-1">${product.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="h-8 rounded-lg text-[9px] uppercase tracking-widest font-bold px-4"
                              onClick={() => {
                                addToCart(product);
                                toast.success('Added to bag');
                              }}
                            >
                              Add to Bag
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/5"
                              onClick={() => removeFromWishlist(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 bg-white border border-black/5 rounded-[2.5rem] shadow-sm space-y-10"
              >
                <div className="space-y-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Account Settings</h2>
                  <p className="text-2xl font-serif gold-shimmer">Preferences & Security</p>
                </div>

                <div className="space-y-8">
                  <div className="p-6 border border-black/5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest">Password</h3>
                    <p className="text-sm text-muted-foreground font-light">Change your account password to keep your account secure.</p>
                    <Button 
                      variant="outline" 
                      className="rounded-xl px-6 text-[10px] uppercase tracking-widest font-bold h-10"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Update Password
                    </Button>
                  </div>

                  <div className="p-6 border border-black/5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest">Notifications</h3>
                    <p className="text-sm text-muted-foreground font-light">Manage how you receive updates about orders and promotions.</p>
                    <Button 
                      variant="outline" 
                      className="rounded-xl px-6 text-[10px] uppercase tracking-widest font-bold h-10"
                      onClick={() => setShowNotificationModal(true)}
                    >
                      Manage Notifications
                    </Button>
                  </div>

                  <div className="pt-8 border-t border-black/5">
                    <Button 
                      variant="ghost" 
                      className="text-destructive hover:bg-destructive/5 rounded-xl px-6 text-[10px] uppercase tracking-widest font-bold h-10"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Password Modal - Same as original */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Security</h2>
                <h3 className="text-3xl font-serif tracking-tighter">Update Password</h3>
              </div>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full bg-muted/30 border border-transparent px-6 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all font-serif italic" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full bg-muted/30 border border-transparent px-6 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all font-serif italic" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full bg-muted/30 border border-transparent px-6 py-4 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-black/10 transition-all font-serif italic" 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Modal - Same as original */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Preferences</h2>
                <h3 className="text-3xl font-serif tracking-tighter">Notifications</h3>
              </div>
              <div className="space-y-6">
                {[
                  { id: 'orders', label: 'Order Updates', desc: 'Get notified about your order status' },
                  { id: 'promo', label: 'Promotions', desc: 'New collections and exclusive offers' },
                  { id: 'wishlist', label: 'Wishlist Alerts', desc: 'When items in your wishlist go on sale' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="h-6 w-10 bg-black rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <Button variant="ghost" className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
                  <Button className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold" onClick={handleNotificationUpdate}>Save</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal - Same as original */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteStep('request');
                setOtpValue('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-destructive">Danger Zone</h2>
                <h3 className="text-3xl font-serif tracking-tighter">Delete Account</h3>
              </div>

              {deleteStep === 'request' ? (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    This action is <span className="font-bold text-black">permanent</span>. All your data, including order history and wishlist, will be erased. We will send a verification code to <span className="font-bold text-black">{user.email}</span> to confirm.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold" 
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold bg-destructive hover:bg-destructive/90" 
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    Please enter the 6-digit code sent to your email to finalize account deletion.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Verification Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-muted/30 border border-transparent px-6 py-4 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:bg-white focus:border-black/10 transition-all font-serif italic" 
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold" 
                      onClick={() => setDeleteStep('request')}
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold bg-destructive hover:bg-destructive/90" 
                      onClick={handleVerifyAndDelete}
                      disabled={otpValue.length !== 6 || isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Avatar Selection Modal - Same as original */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Personalization</h2>
                  <h3 className="text-3xl font-serif tracking-tighter">Choose Profile Picture</h3>
                </div>
                <button onClick={() => setShowAvatarModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Upload from Device</h4>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/10 rounded-2xl hover:bg-muted/30 transition-all cursor-pointer group">
                    <Upload className="h-8 w-8 text-black/20 group-hover:text-black/40 transition-colors" />
                    <span className="text-[10px] uppercase tracking-widest font-bold mt-2 text-black/40">Select Image File</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Premium Humane Avatars</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {['avataaars', 'personas', 'lorelei'].map((style) => (
                      [1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={`${style}-${num}`}
                          onClick={() => selectPredefinedAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${style}${num}`)}
                          className="aspect-square rounded-xl bg-muted/30 overflow-hidden hover:ring-2 hover:ring-black transition-all hover:scale-105"
                        >
                          <img src={`https://api.dicebear.com/7.x/${style}/svg?seed=${style}${num}`} alt="Avatar" className="w-full h-full object-cover" />
                        </button>
                      ))
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">A-Z Capital Logos</h4>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
                    {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter, index) => {
                      const luxuryColors = [
                        'D4AF37', '1A237E', '1B5E20', '880E4F', '212121', 'AD1457', '4E342E', '37474F', '000000'
                      ];
                      const color = luxuryColors[index % luxuryColors.length];
                      return (
                        <button
                          key={letter}
                          onClick={() => selectPredefinedAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${letter}&backgroundColor=${color}&fontFamily=serif`)}
                          style={{ backgroundColor: `#${color}` }}
                          className="aspect-square rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg hover:scale-110 transition-transform shadow-md"
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};