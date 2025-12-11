import axios from 'axios';

// Auto-detect API URL based on current hostname
// This allows the app to work when accessed from other devices on the network
export const getApiUrl = () => {
  // If VITE_API_URL is set (production), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development fallback: Get current hostname and protocol
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Development: If accessing via localhost, use localhost for API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Development: If accessing via network IP, use the same IP for API
  return `${protocol}//${hostname}:5000`;
};

export const API_URL = getApiUrl();

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage if available
const storedToken = localStorage.getItem('accessToken');
if (storedToken) {
  setAuthToken(storedToken);
}



