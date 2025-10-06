import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../user/types';
import { authService } from '../user/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authService.getToken();

      if (savedToken) {
        try {
          const result = await authService.verifyToken(savedToken);
          if (result.success) {
            setToken(savedToken);
            setUser(result.user);
          } else {
            authService.removeToken();
          }
        } catch (error) {
          authService.removeToken();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    authService.saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authService.removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
