import axios from 'axios';
import { getSession } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let cachedSessionPromise: Promise<any> | null = null;

const getCachedSession = () => {
  if (cachedSessionPromise) return cachedSessionPromise;

  cachedSessionPromise = getSession();

  // Clear cache after 5 seconds to get fresh session, but deduplicate concurrent calls
  setTimeout(() => {
    cachedSessionPromise = null;
  }, 5000);

  return cachedSessionPromise;
};

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add Auth Token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getCachedSession();
    let token = (session as any)?.backendToken || (session as any)?.user?.token;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Auto logout if unauthorized (401)
    if (error.response?.status === 401) {
      // In a real app, you might want to redirect to login
      // window.location.href = '/';
    }
    
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
