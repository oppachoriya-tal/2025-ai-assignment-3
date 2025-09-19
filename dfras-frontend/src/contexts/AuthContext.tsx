import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      
      // If we have cached user data, use it immediately to avoid loading state
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
        } catch (e) {
          console.error('Failed to parse cached user data');
        }
      }
      
      // Verify token and get user info (this will update user data if verification succeeds)
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Set up axios interceptor for token refresh and default headers
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          // Don't redirect here, let ProtectedRoute handle it
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data && response.data.username) {
        setUser(response.data);
        setIsLoading(false);
      } else if (response.data && response.data.detail) {
        // API returned an error message (e.g., "Invalid authentication credentials")
        throw new (Error as any)(response.data.detail);
      } else {
        throw new (Error as any)('Invalid response format');
      }
    } catch (error: any) {
      console.error('Token verification failed:', error);
      
      // Only clear token if it's a 401 (unauthorized) or 403 (forbidden) error
      // For network errors or other issues, keep the token and user state
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Token is invalid or expired, clearing session');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } else {
        console.log('Network or server error, keeping session');
        // For network errors, try to use cached user data if available
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            console.error('Failed to parse cached user data');
          }
        }
      }
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      const { access_token, user: userData } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (error: any) {
      throw new (Error as any)(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new (Error as any)('useAuth must be used within an AuthProvider');
  }
  return context;
};
