import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckCircle2, CreditCard, Truck, MapPin, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { orderApi } from '../services/api';

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  address: AddressData;
}

export const Checkout = () => {
  const [step, setStep] = useState(1);
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Shipping form data
  const [shippingData, setShippingData] = useState<ShippingData>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: {
      street: user?.address || '',
      city: user?.city || '',
      state: '',
      zipCode: '',
      country: user?.country || 'United States'
    }
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [shippingMethod, setShippingMethod] = useState('std');

  // Card payment fields
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleShippingChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'address') {
        setShippingData(prev => ({
          ...prev,
          address: { ...prev.address, [child]: value }
        }));
      }
    } else {
      setShippingData(prev => ({ ...prev, [field]: value }));
    }
  };

  const shippingPrice = shippingMethod === 'exp' ? 25 : 0;
  const finalTotal = totalPrice + shippingPrice;

  const handleNext = () => {
    // Validate shipping info before proceeding
    if (step === 1) {
      if (!shippingData.firstName || !shippingData.lastName || !shippingData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!shippingData.address.street || !shippingData.address.city || !shippingData.address.zipCode) {
        toast.error('Please fill in complete address');
        return;
      }
      if (!shippingData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handlePlaceOrder = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please login to place order');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // FIXED: Properly retrieve token from localStorage
    const storedUser = localStorage.getItem('zyphora_user');
    let token = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        token = parsedUser.token;
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }

    if (!token) {
      toast.error('Session expired. Please login again.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    console.log('Token found, placing order...');

    // Validate payment method
    if (paymentMethod === 'upi' && (!upiId || !upiId.includes('@'))) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardData.number || !cardData.expiry || !cardData.cvc) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        subtotal: totalPrice,
        tax: totalPrice * 0.1,
        shippingCost: shippingPrice,
        total: finalTotal + (totalPrice * 0.1),
        paymentMethod: paymentMethod === 'card' ? 'CREDIT_CARD' : 'UPI',
        address: {
          street: shippingData.address.street,
          city: shippingData.address.city,
          state: shippingData.address.state,
          zipCode: shippingData.address.zipCode,
          country: shippingData.address.country
        },
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('Placing order with data:', orderData);
      const response = await orderApi.placeOrder(orderData);

      if (response.data) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/order-success');
      }
    } catch (error: any) {
      console.error('Order placement error:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('zyphora_user');
        navigate('/login', { state: { from: '/checkout' } });
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0 && step < 4) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-4xl font-serif tracking-tighter">Your bag is <span className="italic text-muted-foreground">vacant</span></h2>
          <Button
            onClick={() => navigate('/shop')}
            className="h-16 px-12 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            Explore Collection
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <header className="text-center space-y-4 mb-20">
          <h1 className="font-serif text-5xl tracking-tighter">Secure Checkout</h1>
          <div className="flex justify-center items-center gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`h-8 w-8 flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${step >= i ? 'bg-black text-white' : 'bg-muted/30 text-muted-foreground'
                    }`}
                >
                  {i}
                </div>
                {i < 3 && <div className="h-[1px] w-12 bg-border/50" />}
              </div>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Main Content */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Step 01</h2>
                    <h3 className="text-3xl font-serif tracking-tighter">Shipping Destination</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name *</label>
                      <input
                        value={shippingData.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        placeholder="Alexander"
                        className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name *</label>
                      <input
                        value={shippingData.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        placeholder="Rossi"
                        className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address *</label>
                      <input
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        placeholder="alexander@rossi.com"
                        className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Street Address *</label>
                      <input
                        value={shippingData.address.street}
                        onChange={(e) => handleShippingChange('address.street', e.target.value)}
                        placeholder="123 Luxury Avenue"
                        className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">City *</label>
                      <input
                        value={shippingData.address.city}
                        onChange={(e) => handleShippingChange('address.city', e.target.value)}
                        placeholder="Milan"
                        className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">ZIP Code *</label>
                      <input
                        value={shippingData.address.zipCode}
                        onChange={(e) => handleShippingChange('address.zipCode', e.target.value)}
                        placeholder="20121"
                        className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full h-16 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold"
                    onClick={handleNext}
                  >
                    Continue to Shipping
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Step 02</h2>
                    <h3 className="text-3xl font-serif tracking-tighter">Delivery Method</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'std', name: 'Standard Delivery', time: '3-5 business days', price: 0 },
                      { id: 'exp', name: 'Express Delivery', time: '1-2 business days', price: 25 },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setShippingMethod(method.id)}
                        className={`flex items-center justify-between p-8 border transition-all group cursor-pointer ${shippingMethod === method.id ? 'border-black bg-black/5' : 'border-border/50 hover:border-black'
                          }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`h-4 w-4 rounded-none border border-black flex items-center justify-center`}>
                            <div className={`h-2 w-2 bg-black transition-opacity ${shippingMethod === method.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                              }`} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{method.name}</p>
                            <p className="text-xs text-muted-foreground font-light mt-1">{method.time}</p>
                          </div>
                        </div>
                        <p className="text-sm font-serif">{method.price === 0 ? 'Complimentary' : `$${method.price}`}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-16 rounded-full text-[10px] uppercase tracking-widest font-bold" onClick={handleBack}>
                      Back
                    </Button>
                    <Button className="flex-[2] h-16 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold" onClick={handleNext}>
                      Continue to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Step 03</h2>
                    <h3 className="text-3xl font-serif tracking-tighter">Payment Details</h3>
                  </div>
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 p-6 border transition-all ${paymentMethod === 'card' ? 'border-black bg-black/5' : 'border-border/50'}`}
                      >
                        <CreditCard className="h-6 w-6 mb-2 mx-auto" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Credit Card</p>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`flex-1 p-6 border transition-all ${paymentMethod === 'upi' ? 'border-black bg-black/5' : 'border-border/50'}`}
                      >
                        <div className="h-6 w-6 mb-2 mx-auto flex items-center justify-center font-bold text-xs italic">UPI</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">UPI Payment</p>
                      </button>
                    </div>

                    {paymentMethod === 'card' ? (
                      <div className="space-y-8">
                        <div className="p-10 bg-black text-white space-y-10 relative overflow-hidden rounded-2xl">
                          <div className="absolute top-0 right-0 p-10 opacity-10">
                            <CreditCard className="h-32 w-32" />
                          </div>
                          <div className="flex justify-between items-start relative z-10">
                            <div className="h-12 w-20 bg-white/10 border border-white/20 rounded" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">ZYPHORA PLATINUM</span>
                          </div>
                          <div className="space-y-2 relative z-10">
                            <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Card Number</p>
                            <p className="text-2xl tracking-[0.3em] font-light">
                              {cardData.number || '**** **** **** 4242'}
                            </p>
                          </div>
                          <div className="flex justify-between relative z-10">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Holder</p>
                              <p className="text-xs uppercase font-bold tracking-widest">
                                {cardData.name || shippingData.firstName + ' ' + shippingData.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Expires</p>
                              <p className="text-xs font-bold tracking-widest">{cardData.expiry || 'MM/YY'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Card Number</label>
                            <input
                              value={cardData.number}
                              onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                              placeholder="**** **** **** ****"
                              className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                            />
                          </div>
                          <div className="col-span-1 space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cardholder Name</label>
                            <input
                              value={cardData.name}
                              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                              placeholder="Name on card"
                              className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                            />
                          </div>
                          <div className="col-span-1 space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Expiry Date</label>
                            <input
                              value={cardData.expiry}
                              onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                              placeholder="MM/YY"
                              className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                            />
                          </div>
                          <div className="col-span-1 space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CVC</label>
                            <input
                              value={cardData.cvc}
                              onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                              placeholder="***"
                              className="w-full bg-muted/10 border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 p-8 bg-black/5 border border-black/10 rounded-[2rem]">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">UPI ID *</label>
                          <input
                            placeholder="username@bank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-white border border-border/50 px-6 py-4 rounded-full focus:outline-none focus:border-black transition-all font-serif italic"
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                          A payment request will be sent to your UPI app. Please approve it to complete the transaction.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-16 rounded-full text-[10px] uppercase tracking-widest font-bold" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      className="flex-[2] h-16 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-muted/5 p-10 border border-border/50 sticky top-32 space-y-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Order Summary</h3>
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="h-24 w-20 bg-muted overflow-hidden rounded-xl">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                      <p className="text-xs font-serif mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 border-t border-border/50 pt-8">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Tax (10%)</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'Complimentary' : `$${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xl font-serif pt-4 border-t border-border/50">
                  <span>Total</span>
                  <span>${(finalTotal + totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed text-center font-bold opacity-60">
                  Secure checkout powered by Zyphora Pay. All transactions are encrypted and monitored for your safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrderSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full text-center space-y-12 relative z-10"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40"
          >
            Transaction Successful
          </motion.div>
          <h1 className="font-serif text-6xl md:text-8xl tracking-tighter">Order <span className="italic">Confirmed</span></h1>
        </div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg font-light text-white/60 leading-relaxed max-w-lg mx-auto"
        >
          Thank you for choosing Zyphora. Your order has been received and is currently being prepared by our master artisans. A confirmation has been sent to your email.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
        >
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="h-16 px-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            Return to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/shop')}
            className="h-16 px-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            Continue Shopping
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};