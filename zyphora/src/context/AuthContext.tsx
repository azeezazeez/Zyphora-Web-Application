import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';
import { showToast } from '../services/toast';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('zyphora_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role) {
          parsedUser.role = parsedUser.role.toUpperCase();
        }
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Check if token is expired
        checkTokenValidity(parsedUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('zyphora_user');
      }
    }
  }, []);

  const checkTokenValidity = async (userData: User) => {
    try {
      // Try to fetch current user to validate token
      await authApi.getCurrentUser();
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Token expired, logging out');
        localStorage.removeItem('zyphora_user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken();
      if (response.data && response.data.token) {
        const updatedUser = { ...user, token: response.data.token };
        localStorage.setItem('zyphora_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Login attempt for:', email);
      const response = await authApi.login({ email, password });
      const userData = response.data;

      console.log('[AuthContext] Login response:', userData);

      // Ensure token exists
      if (!userData.token) {
        throw new Error('No token received from server');
      }
      else {
        console.log(userData.token)
      }

      // Ensure role is uppercase
      if (userData.role) {
        userData.role = userData.role.toUpperCase();
      }

      // Store user data with token
      localStorage.setItem('zyphora_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      console.log('[AuthContext] Token stored successfully');
      toast.success('Welcome back to Zyphora');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ name, email, password });
      const userData = response.data;

      console.log('Register response - User role:', userData.role);

      if (userData.role) {
        userData.role = userData.role.toUpperCase();
      }

      localStorage.setItem('zyphora_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('zyphora_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const { id, email, role, createdAt, updatedAt, ...updateData } = data as any;

      console.log('Sending to backend:', updateData);

      const response = await authApi.updateProfile(updateData);
      const updatedUser = { ...user, ...response.data, ...updateData };

      localStorage.setItem('zyphora_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      await authApi.deleteAccount();
      localStorage.removeItem('zyphora_user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Account scheduled for deletion');
    } catch (error: any) {
      console.error('Delete account error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Deletion failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const refreshUserData = async (): Promise<User | null> => {
    if (!user) return null;

    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data;

      if (userData.role) {
        userData.role = userData.role.toUpperCase();
      }

      const updatedUser = { ...user, ...userData };
      localStorage.setItem('zyphora_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        refreshUserData,
        refreshToken,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};