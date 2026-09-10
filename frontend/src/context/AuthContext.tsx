import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  quickLogin: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  kitchen_operator: {
    id: 'usr_chef_01',
    email: 'chef@abckitchen.edu',
    full_name: 'Chef Rajesh Sharma',
    role: 'kitchen_operator',
    organization_name: 'ABC College Central Kitchen',
    phone: '+91 98101 23456',
    avatar_initials: 'RS',
  },
  ngo: {
    id: 'usr_ngo_01',
    email: 'aman@robinhoodarmy.org',
    full_name: 'Aman Verma',
    role: 'ngo',
    organization_name: 'Robin Hood Army - South Delhi Shelter',
    phone: '+91 98112 34567',
    avatar_initials: 'AV',
  },
  admin: {
    id: 'usr_admin_01',
    email: 'admin@foodresq.in',
    full_name: 'Dr. Sunita Mehra',
    role: 'admin',
    organization_name: 'FoodResQ System Administrator',
    phone: '+91 98000 11223',
    avatar_initials: 'SM',
  },
};

const AUTH_STORAGE_KEY = 'foodresq_active_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : PRESET_USERS.kitchen_operator;
    } catch {
      return PRESET_USERS.kitchen_operator;
    }
  });

  const role: UserRole = user?.role || 'kitchen_operator';

  const login = (email: string, pass: string): boolean => {
    // Check preset accounts
    const match = Object.values(PRESET_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (match && pass.length >= 6) {
      setUser(match);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(match));
      return true;
    }

    // Default dynamic login for custom credentials
    if (email && pass.length >= 6) {
      const isNGO = email.includes('ngo') || email.includes('shelter');
      const isAdmin = email.includes('admin');
      const assignedRole: UserRole = isAdmin ? 'admin' : isNGO ? 'ngo' : 'kitchen_operator';

      const customUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email: email.trim(),
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role: assignedRole,
        organization_name: assignedRole === 'kitchen_operator' ? 'Registered Kitchen Mess' : assignedRole === 'ngo' ? 'Verified Community Shelter' : 'Platform Oversight',
        avatar_initials: email.slice(0, 2).toUpperCase(),
      };
      setUser(customUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      return true;
    }

    return false;
  };

  const quickLogin = (selectedRole: UserRole) => {
    const preset = PRESET_USERS[selectedRole];
    setUser(preset);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(preset));
  };

  const switchRole = (selectedRole: UserRole) => {
    quickLogin(selectedRole);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        quickLogin,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
