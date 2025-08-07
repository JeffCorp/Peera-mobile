import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { LoginCredentials, RegisterData, User } from '../services/auth/authService';
import { useAppDispatch, useAppSelector } from '../store';
import {
  autoLogin,
  clearError,
  getProfile,
  login,
  logout,
  register,
  updateProfile
} from '../store/slices/authSlice';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  getProfile: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  autoLogin: () => Promise<{ success: boolean; error?: string }>;

  // Utilities
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Auto-login on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(autoLogin()).unwrap();
      } catch (error) {
        // Auto-login failed, user needs to login manually
        console.log('Auto-login failed:', error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Login function
  const handleLogin = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      console.log("AuthContext - Login result:", result);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Register function
  const handleRegister = async (credentials: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      await dispatch(register(credentials)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Logout function
  const handleLogout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await dispatch(logout()).unwrap();
      console.log("AuthContext - Logout result => ", result);
      // Navigate to login screen
      router.replace('/login');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Logout failed' };
    }
  };

  // Get profile function
  const handleGetProfile = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await dispatch(getProfile()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get profile' };
    }
  };

  // Update profile function
  const handleUpdateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      await dispatch(updateProfile(updates)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  // Auto-login function
  const handleAutoLogin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await dispatch(autoLogin()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Auto-login failed' };
    }
  };

  // Clear error function
  const handleClearError = () => {
    dispatch(clearError());
  };

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getProfile: handleGetProfile,
    updateProfile: handleUpdateProfile,
    autoLogin: handleAutoLogin,

    // Utilities
    clearError: handleClearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 