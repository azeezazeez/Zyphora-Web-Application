import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, Loader2, Key, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('OTP sent to your email!');
      setStep('otp');
      setResendTimer(60);
      setOtpError('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email not found. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setOtpError('');
       try {
      await authApi.verifyOTP({ email, otp });
      toast.success('OTP verified! Please set your new password.');
      setStep('reset');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid or expired OTP';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, newPassword });
      toast.success('Password reset successfully!');
      setStep('success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('OTP resent to your email!');
      setResendTimer(60);
      setOtp('');
      setOtpError('');
    } catch (error: any) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResendTimer(0);
    setOtpError('');
    onClose();
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      setOtpError('');
    } else if (step === 'reset') {
      setStep('otp');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="relative h-1.5 bg-black dark:bg-white" />

        <div className="p-10 relative">
          {step !== 'email' && step !== 'success' && (
            <button
              onClick={handleBack}
              className="absolute top-8 left-8 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors z-10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-500 hover:text-black dark:hover:text-white" />
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <DialogHeader className="mb-8">
                  <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-7 h-7 text-black dark:text-white" />
                  </div>
                  <DialogTitle className="text-3xl font-serif tracking-tight leading-tight">Forgot Password?</DialogTitle>
                  <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-3 text-base">
                    Enter your email address and we'll send you an OTP to reset your password.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2.5">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 luxury-input-focus rounded-xl text-base"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-xl group text-xs font-bold uppercase tracking-widest"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <DialogHeader className="mb-8">
                  <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Key className="w-7 h-7 text-black dark:text-white" />
                  </div>
                  <DialogTitle className="text-3xl font-serif tracking-tight leading-tight">Verify OTP</DialogTitle>
                  <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-3 text-base">
                    Enter the 6-digit code sent to <br />
                    <span className="font-medium text-black dark:text-white">{email}</span>
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-2.5">
                    <label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      OTP Code
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className={`h-16 text-center text-3xl font-bold tracking-[0.4em] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 luxury-input-focus rounded-xl ${otpError ? 'border-red-500 ring-red-500' : ''
                        }`}
                      disabled={isLoading}
                    />
                    {otpError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mt-2 font-medium ml-1"
                      >
                        {otpError}
                      </motion.p>
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center mx-auto gap-2"
                    >
                      {resendTimer > 0 ? (
                        <>Resend OTP in <span className="text-black dark:text-white">{resendTimer}s</span></>
                      ) : (
                        'Resend OTP'
                      )}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-xl text-xs font-bold uppercase tracking-widest"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <DialogHeader className="mb-8">
                  <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-7 h-7 text-black dark:text-white" />
                  </div>
                  <DialogTitle className="text-3xl font-serif tracking-tight leading-tight">Reset Password</DialogTitle>
                  <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-3 text-base">
                    Create a secure new password for your account.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2.5">
                    <label htmlFor="newPassword" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 luxury-input-focus rounded-xl"
                      disabled={isLoading}
                    />
                    <p className="text-[10px] text-zinc-400 ml-1">Minimum 6 characters required</p>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 luxury-input-focus rounded-xl"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-xl text-xs font-bold uppercase tracking-widest mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-3xl font-serif tracking-tight mb-4 leading-tight">Password Updated</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-base leading-relaxed">
                  Your password has been successfully reset. You can now log in with your new credentials.
                </p>
                <Button
                  onClick={handleClose}
                  className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-xl text-xs font-bold uppercase tracking-widest"
                >
                  Back to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 text-center border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold">
            Zyphora Luxury E-Commerce
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
