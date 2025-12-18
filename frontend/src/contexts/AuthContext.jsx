import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (accessToken) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true
      });
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
      const response = await axios.post(
        `${API_URL}/api/oauth/${provider}`,
        { accessToken: token },
        { withCredentials: true }
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
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
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
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      }, {
        withCredentials: true
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
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
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
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
        withCredentials: true
      });
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
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && accessToken) {
          try {
            const newToken = await refreshToken();
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios.request(error.config);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
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

