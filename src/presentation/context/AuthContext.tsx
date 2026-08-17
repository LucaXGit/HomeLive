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
import {
  authenticateWithBiometrics,
  getBiometricAvailability,
} from '../../services/biometricService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  biometricLocked: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  unlockWithBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authRepository = new LocalAuthRepository();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricLocked, setBiometricLocked] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await authRepository.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const availability = await getBiometricAvailability();
          if (availability.hasHardware && availability.isEnrolled) {
            setBiometricLocked(true);
            const authenticated = await authenticateWithBiometrics();
            if (authenticated) {
              setBiometricLocked(false);
            }
          }
        }
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
    setBiometricLocked(false);
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    const authenticated = await authenticateWithBiometrics();
    if (authenticated) {
      setBiometricLocked(false);
    }
    return authenticated;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      biometricLocked,
      register,
      login,
      logout,
      unlockWithBiometrics,
    }),
    [user, loading, biometricLocked]
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