import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import { UseAuthReturn, STORAGE_KEYS } from '../types';
import toast from 'react-hot-toast';

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      // Validate token with backend
      await adminApi.validateToken();
      setIsAuthenticated(true);
      setError(undefined);
    } catch (err) {
      // Token is invalid, remove it
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setIsAuthenticated(false);
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string): Promise<void> => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await adminApi.login({ password });
      
      // Store token
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      setIsAuthenticated(true);
      
      toast.success('Successfully logged in!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setIsAuthenticated(false);
    setError(undefined);
    toast.success('Successfully logged out!');
  }, []);

  return {
    isAuthenticated,
    loading,
    login,
    logout,
    error,
  };
}; 