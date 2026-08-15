import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { User } from '../../domain/entities';
import {
  LoginData,
  RegisterData,
} from '../../domain/repositories/AuthRepository';
import { LocalAuthRepository } from '../../data/repositories/LocalAuthRepository';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authRepository = new LocalAuthRepository();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await authRepository.getCurrentUser();
        setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (data: RegisterData) => {
    const registeredUser = await authRepository.register(data);
    setUser(registeredUser);
  };

  const login = async (data: LoginData) => {
    const loggedUser = await authRepository.login(data);
    setUser(loggedUser);
  };

  const logout = async () => {
    await authRepository.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }

  return context;
}