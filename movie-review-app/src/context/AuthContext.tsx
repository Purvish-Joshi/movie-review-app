import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

interface User {
  id: string;
  username?: string;
  email: string;
  picture?: string;
  authProvider?: 'local' | 'google';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.email) {
            // Set up API authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token and get fresh user data
            const response = await api.get('/auth/verify');
            setIsAuthenticated(true);
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (data: { token: string; user: User }) => {
    if (!data.user || !data.user.email) {
      console.error('Invalid user data received:', data);
      return;
    }
    
    setIsAuthenticated(true);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 