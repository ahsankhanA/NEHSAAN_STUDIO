import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IUser, IReseller } from '../types';

interface AuthContextType {
  user: IUser | null;
  reseller: IReseller | null;
  loading: boolean;
  needsSetup: boolean;
  brandName: string;
  login: (credentials: { email: string; password: string; role?: string }) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  checkSetupStatus: () => Promise<void>;
  setBrandName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [reseller, setReseller] = useState<IReseller | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [brandName, setBrandName] = useState('NEHSAAN');

  const checkSetupStatus = async () => {
    try {
      const res = await api.getSetupStatus();
      setNeedsSetup(res.needsSetup);
      if (res.brandName) setBrandName(res.brandName);
    } catch (err) {
      console.warn('Could not check setup status:', err);
    }
  };

  const refreshProfile = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setReseller(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setReseller(data.reseller || null);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      api.setToken(null);
      setUser(null);
      setReseller(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
    refreshProfile();
  }, []);

  const login = async (credentials: { email: string; password: string; role?: string }) => {
    const res = await api.login(credentials);
    api.setToken(res.token);
    setUser(res.user);
    setReseller(res.reseller || null);
    return res;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setReseller(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        reseller,
        loading,
        needsSetup,
        brandName,
        login,
        logout,
        refreshProfile,
        checkSetupStatus,
        setBrandName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
