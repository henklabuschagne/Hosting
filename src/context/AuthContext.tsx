import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppStore } from '../hooks/useAppStore';

interface User {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { currentUser, isAuthLoading, isAuthenticated, isAdmin, actions } = useAppStore('auth');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const restored = actions.restoreAuth();
      if (!restored) {
        // Auto-login as admin in mock mode
        console.log('🎭 Mock mode detected - Auto-logging in as admin...');
        actions.login('admin', 'admin').then(result => {
          if (result.success) {
            console.log('✅ Auto-login successful');
          } else {
            console.error('❌ Auto-login failed:', result.error.message);
          }
        });
      }
      setInitialized(true);
    }
  }, [initialized, actions]);

  const user: User | null = currentUser ? {
    userId: currentUser.userId,
    username: currentUser.username,
    email: currentUser.email,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    roles: currentUser.roles,
  } : null;

  const login = async (username: string, password: string) => {
    const result = await actions.login(username, password);
    if (!result.success) {
      throw new Error(result.error.message);
    }
  };

  const register = async (data: RegisterData) => {
    const result = await actions.register(data);
    if (!result.success) {
      throw new Error(result.error.message);
    }
  };

  const logout = () => {
    actions.logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, isLoading: isAuthLoading, login, logout, register }}
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