import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import {
  loginUser,
  registerUser,
  googleLogin,
  googleRegister,
} from '@/services/auth';

import { AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// type AuthResponse = User & { token: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Failed to load stored user');
    } finally {
      setLoading(false);
    }
  };

  const storeUser = async (userData: User) => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Failed to store user');
    }
  };

  const login = async (email: string, password: string) => {
    const userData: AuthResponse = await loginUser(email, password);
    await SecureStore.setItemAsync('userToken', userData.token); // Store the JWT
    const { token, ...userWithoutToken } = userData;
    await storeUser(userWithoutToken);
  };

  const signup = async (name: string, email: string, password: string) => {
    const userData: AuthResponse = await registerUser(name, email, password);
    await SecureStore.setItemAsync('userToken', userData.token); // Store the JWT
    const { token, ...userWithoutToken } = userData;
    await storeUser(userWithoutToken);
  };

  const loginWithGoogle = async () => {
    // You may need to get the token from your Google login flow
    // For now, just call googleLogin with a token (update as needed)
    // const token = ...
    // const userData = await googleLogin(token);
    // await storeUser(userData);
    // Placeholder: throw error if not implemented
    throw new Error(
      'Google login not implemented in this context. Use the useGoogleAuth hook in your component.'
    );
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('notification_settings');
      setUser(null);
    } catch (error) {
      console.log('Failed to logout');
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
