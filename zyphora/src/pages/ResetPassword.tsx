import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, ShieldCheck, Lock, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [step, setStep] = useState<'otp' | 'password' | 'success'>('otp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpString, setOtpString] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && step === 'otp') {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Update the combined OTP string
    setOtpString(newOtp.join(''));

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Use the correct API method - verifyOTP
      await authApi.verifyOTP({ email, otp: otpCode });
      toast.success('OTP Verified Successfully');
      setStep('password');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setOtpString('');
      toast.success('New OTP sent to your email');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Use the correct API method - resetPassword
      await authApi.resetPassword({ 
        email, 
        newPassword 
      });
      setStep('success');
      toast.success('Password reset successfully');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-black/5"
      >
        <AnimatePresence mode="wait">
          {step === 'otp' && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                <h1 className="font-serif text-3xl tracking-tight">Verify OTP</h1>
                <p className="text-zinc-500 text-sm">
                  We've sent a 6-digit code to <br />
                  <span className="font-medium text-black">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-zinc-50 border border-zinc-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
                      Resend code in <span className="text-black">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-xs font-bold uppercase tracking-widest text-black hover:underline flex items-center justify-center mx-auto gap-2"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all group"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (
                    <>
                      Verify Code
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 'password' && (
            <motion.div
              key="password-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-black" />
                </div>
                <h1 className="font-serif text-3xl tracking-tight">New Password</h1>
                <p className="text-zinc-500 text-sm">Create a secure password for your account</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-14 bg-zinc-50 border-zinc-200 rounded-2xl focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 bg-zinc-50 border-zinc-200 rounded-2xl focus:ring-black"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-3xl tracking-tight">All Set!</h1>
                <p className="text-zinc-500 text-sm">Your password has been successfully reset.</p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-14 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                Back to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <button
            onClick={() => navigate('/login')}
            className="mt-8 flex items-center justify-center w-full gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Login
          </button>
        )}
      </motion.div>
    </div>
  );
};