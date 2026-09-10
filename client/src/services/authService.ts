import api from './api';
import type { User, AuthResponse, LoginFormInput, RegisterFormInput } from '@/types';

export const login = async (data: LoginFormInput): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
  }
};

export const register = async (data: RegisterFormInput): Promise<AuthResponse> => {
  try {
    const { confirmPassword, ...registerData } = data;
    const response = await api.post<AuthResponse>('/auth/register', registerData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user data.');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const saveAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};
