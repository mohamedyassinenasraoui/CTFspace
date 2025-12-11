import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, apiClient, setAuthToken } from '../utils/api.js';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  // Update axios default headers when token changes
  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchUser = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiClient.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const oauthLogin = async (provider, token) => {
    try {
      const response = await apiClient.post(
        `/api/oauth/${provider}`,
        { accessToken: token }
      );

      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || `${provider} login failed`
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        username,
        email,
        password
      });

      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/api/auth/refresh', {});
      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && accessToken && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [accessToken]);

  const value = {
    user,
    loading,
    accessToken,
    login,
    register,
    logout,
    refreshToken,
    fetchUser,
    oauthLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

