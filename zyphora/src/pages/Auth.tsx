import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!isLogin && !name) {
      toast.error('Please enter your full name');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN - Auto-login
        const response = await authApi.login({ email, password });
        if (response.data && response.data.token) {
          localStorage.setItem('zyphora_user', JSON.stringify(response.data));
          await login(email, password);
          toast.success('Welcome back to Zyphora');

          if (response.data.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else {
        // REGISTER - Do NOT auto-login
        const response = await authApi.register({ name, email, password });

        if (response.data && response.data.token) {
          // Clear any existing user data
          localStorage.removeItem('zyphora_user');

          // Show success message
          toast.success('Account created successfully! Please login.');

          // Clear form fields
          setName('');
          setEmail('');
          setPassword('');

          // Switch to login mode
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-[#F5F5F5] relative overflow-hidden"
      >
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate(-1)}
          className="absolute top-12 left-12 flex items-center gap-3 group z-20"
        >
          <div className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 group-hover:text-black transition-colors">Back</span>
        </motion.button>

        {/* Subtle Light Background */}
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
            alt="Auth Background"
            className="h-full w-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-white" />
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md p-10 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-black/5"
        >
          <div className="text-center space-y-4 mb-10">
            <h1 className="font-serif text-4xl tracking-tighter text-black">
              {isLogin ? 'Welcome Back' : 'Join Zyphora'}
            </h1>
            <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.3em]">
              {isLogin ? 'Access your exclusive account' : 'Experience modern luxury'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Alexander Rossi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-muted/50 border border-transparent px-6 py-4 rounded-2xl text-black placeholder:text-black/20 focus:outline-none focus:bg-white focus:border-black/10 transition-all font-light"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="alexander@rossi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/50 border border-transparent px-6 py-4 rounded-2xl text-black placeholder:text-black/20 focus:outline-none focus:bg-white focus:border-black/10 transition-all font-light"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[9px] font-medium text-black/40 hover:text-black transition-colors underline underline-offset-2"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/50 border border-transparent px-6 py-4 rounded-2xl text-black placeholder:text-black/20 focus:outline-none focus:bg-white focus:border-black/10 transition-all font-light"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 rounded-2xl bg-black text-white hover:bg-black/90 text-[10px] uppercase tracking-[0.4em] font-bold pt-1"
            >
              {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-10 text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-black/5" />
              <span className="text-[9px] uppercase tracking-widest text-black/20 font-bold">Or</span>
              <div className="h-[1px] flex-1 bg-black/5" />
            </div>

            <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-black font-bold hover:underline transition-all underline-offset-4"
              >
                {isLogin ? 'Join Now' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Side Text */}
        <div className="absolute bottom-10 right-10 z-10 hidden lg:block">
          <p className="text-[10px] uppercase tracking-[0.5em] text-black/10 font-bold">
            SECURE ENCRYPTION ENABLED
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};