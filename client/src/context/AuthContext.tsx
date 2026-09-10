import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginFormInput, RegisterFormInput } from '@/types';
import {
  login as loginService,
  register as registerService,
  getCurrentUser,
  logout as logoutService,
  saveAuthData,
  getStoredUser,
  getStoredToken,
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  login: (data: LoginFormInput) => Promise<void>;
  register: (data: RegisterFormInput) => Promise<void>;
  guestLogin: () => void;
  logout: () => void;
  me: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          saveAuthData(storedToken, currentUser);
        } catch {
          logoutService();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginFormInput) => {
    setIsLoading(true);
    try {
      const response = await loginService(data);
      setUser(response.user);
      setToken(response.token);
      saveAuthData(response.token, response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormInput) => {
    setIsLoading(true);
    try {
      const response = await registerService(data);
      setUser(response.user);
      setToken(response.token);
      saveAuthData(response.token, response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const guestLogin = () => {
    const demoUser: User = {
      _id: 'guest-demo-user',
      name: 'Guest User',
      email: 'guest@demo.com',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    setToken('guest-demo-token');
    setIsGuest(true);
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setToken(null);
    setIsGuest(false);
  };

  const me = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const storedToken = getStoredToken();
      if (storedToken) {
        saveAuthData(storedToken, currentUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    isGuest,
    login,
    register,
    guestLogin,
    logout,
    me,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
