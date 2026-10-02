import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, KieConnectionState } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  kieConnection: KieConnectionState;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemo: (role: 'ADMIN' | 'USER') => Promise<void>;
  refreshKieStatus: () => Promise<void>;
  connectKie: (apiKey: string) => Promise<{ maskedKey: string; message: string }>;
  testKie: () => Promise<{ success: boolean; message: string }>;
  disconnectKie: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [kieConnection, setKieConnection] = useState<KieConnectionState>({
    connected: false,
    maskedKey: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
        if (data.kieConnection) {
          setKieConnection(data.kieConnection);
        } else {
          await refreshKieStatus();
        }
      } else {
        setUser(null);
        setKieConnection({ connected: false, maskedKey: null });
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshKieStatus = async () => {
    try {
      const status = await api.getKieStatus();
      setKieConnection(status);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setKieConnection(data.kieConnection);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    setUser(data.user);
    setKieConnection(data.kieConnection);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setKieConnection({ connected: false, maskedKey: null });
  };

  const switchDemo = async (role: 'ADMIN' | 'USER') => {
    setIsLoading(true);
    try {
      const data = await api.switchDemoUser(role);
      setUser(data.user);
      setKieConnection(data.kieConnection);
    } finally {
      setIsLoading(false);
    }
  };

  const connectKie = async (apiKey: string) => {
    const res = await api.connectKieKey(apiKey);
    await refreshKieStatus();
    return { maskedKey: res.maskedKey, message: res.message };
  };

  const testKie = async () => {
    try {
      const res = await api.testKieConnection();
      await refreshKieStatus();
      return { success: res.connected, message: res.message };
    } catch (err: any) {
      await refreshKieStatus();
      return { success: false, message: err.message || 'Unable to connect to Kie.ai' };
    }
  };

  const disconnectKie = async () => {
    await api.disconnectKie();
    setKieConnection({
      connected: false,
      maskedKey: null,
      status: 'DISCONNECTED',
    });
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    setUser(null);
    setKieConnection({ connected: false, maskedKey: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        kieConnection,
        isLoading,
        login,
        register,
        logout,
        switchDemo,
        refreshKieStatus,
        connectKie,
        testKie,
        disconnectKie,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
