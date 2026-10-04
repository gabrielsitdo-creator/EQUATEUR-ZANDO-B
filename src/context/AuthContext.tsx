import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Shop, PaymentMethod, CurrencyCode } from '../types';
import { DataStore } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  userShop: Shop | null;
  hasActiveSubscription: boolean;
  login: (phone: string) => boolean;
  registerClient: (data: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    address?: string;
  }) => User;
  subscribeMerchant: (paymentMethod: PaymentMethod) => void;
  registerMerchantShop: (data: {
    ownerName: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    shopName: string;
    category: string;
    city: string;
    quartier?: string;
    address: string;
    marketName?: string;
    standNumber?: string;
    description: string;
    currency?: CurrencyCode;
    currency_code?: CurrencyCode;
    logoUrl?: string;
    bannerUrl?: string;
  }) => { user: User; shop: Shop };
  registerMerchant: (data: any) => { user: User; shop: Shop };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUserProfile: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    DataStore.init();
    return DataStore.getCurrentUser();
  });

  const [userShop, setUserShop] = useState<Shop | null>(() => {
    if (currentUser?.shopId) {
      return DataStore.getShopById(currentUser.shopId) || null;
    }
    return null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const user = DataStore.getCurrentUser();
      setCurrentUser(user);
      if (user?.shopId) {
        setUserShop(DataStore.getShopById(user.shopId) || null);
      } else {
        setUserShop(null);
      }
    };

    window.addEventListener('ezm_storage_change', handleStorageChange);
    return () => window.removeEventListener('ezm_storage_change', handleStorageChange);
  }, []);

  const hasActiveSubscription = currentUser ? DataStore.hasActiveSubscription(currentUser.id) : false;

  const login = (phone: string): boolean => {
    const users = DataStore.getUsers();
    const found = users.find(
      (u) => u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
    );
    if (found) {
      DataStore.setCurrentUser(found);
      setCurrentUser(found);
      if (found.shopId) {
        setUserShop(DataStore.getShopById(found.shopId) || null);
      }
      return true;
    }
    return false;
  };

  const registerClient = (data: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    address?: string;
  }) => {
    const user = DataStore.registerClient(data);
    setCurrentUser(user);
    setUserShop(null);
    return user;
  };

  const subscribeMerchant = (paymentMethod: PaymentMethod) => {
    if (!currentUser) return;
    DataStore.subscribeMerchant({
      userId: currentUser.id,
      phone: currentUser.phone,
      paymentMethod,
    });
    const updated = DataStore.getCurrentUser();
    setCurrentUser(updated);
  };

  const registerMerchantShop = (data: {
    ownerName: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    shopName: string;
    category: string;
    city: string;
    quartier?: string;
    address: string;
    marketName?: string;
    standNumber?: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
  }) => {
    const result = DataStore.registerMerchantShop(data);
    setCurrentUser(result.user);
    setUserShop(result.shop);
    return result;
  };

  const logout = () => {
    DataStore.setCurrentUser(null);
    setCurrentUser(null);
    setUserShop(null);
  };

  const switchRole = (newRole: UserRole) => {
    const user = DataStore.switchUserByRole(newRole);
    setCurrentUser(user);
    if (user.shopId) {
      setUserShop(DataStore.getShopById(user.shopId) || null);
    } else {
      setUserShop(null);
    }
  };

  const updateCurrentUserProfile = (partial: Partial<User>) => {
    if (!currentUser) return;
    const users = DataStore.getUsers();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...partial };
      setCurrentUser(users[idx]);
      DataStore.setCurrentUser(users[idx]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        userShop,
        hasActiveSubscription,
        login,
        registerClient,
        subscribeMerchant,
        registerMerchantShop,
        registerMerchant: registerMerchantShop,
        logout,
        switchRole,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
