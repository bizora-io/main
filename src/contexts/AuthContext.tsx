import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Permission, UserSession, LoginHistoryEntry, ActivityLogEntry, DeviceInfo, Staff } from '../types';
import { useNotifications } from './NotificationContext';

export interface BusinessSettings {
  category?: string;
  logo?: string;
  taxNumber?: string;
  taxRate?: number;
  invoicePrefix?: string;
  invoiceFooter?: string;
  workingHours?: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  timezone?: string;
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  emailTemplates?: {
    welcome?: string;
    invoice?: string;
    receipt?: string;
  };
  smsSettings?: {
    enabled: boolean;
    provider?: string;
    apiKey?: string;
  };
}

export interface Business {
  id: string;
  name: string;
  type: string;
  location: string;
  settings?: BusinessSettings;
}

import { PERMISSIONS, getAllPermissions } from '../utils/permissions';

export interface User {
  id: string;
  token?: string; // Added token property
  name?: string; // Added name property
  businessName: string;
  email: string;
  mobile: string;
  businessType: string;
  location: string;
  locationCount: number;
  isPremium: boolean;
  unlockedTemplates: number[];
  role: UserRole;
  permissions: string[];
  initialLoginDate: string;
  twoFactorEnabled: boolean;
  pinEnabled: boolean;
  passwordEnabled: boolean;
  pin?: string;
  password?: string;
  avatar?: string;
  parentId?: string; // For sub-users
  businesses?: Business[];
  totalStores?: number;
  totalBusiness?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sessions: UserSession[];
  loginHistory: LoginHistoryEntry[];
  activityLogs: ActivityLogEntry[];
  devices: DeviceInfo[];
  
  login: (identifier: string, secret: string, method: 'PASSWORD' | 'PIN' | 'OTP') => Promise<{ success: boolean; require2fa?: boolean }>;
  signup: (data: any) => Promise<boolean>;
  socialLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  complete2fa: (otp: string) => Promise<boolean>;
  logout: () => void;
  upgradeSubscription: () => void;
  updateUser: (data: Partial<User>) => void;
  unlockTemplate: (templateId: number) => void;
  switchBusiness: (businessId: string) => void;
  updateBusinessSettings: (businessId: string, settings: Partial<BusinessSettings>) => void;
  addBusiness: (business: Omit<Business, 'id'>) => void;
  
  // Security & Management
  initiate2faSetup: () => Promise<{ secret: string; qrCode: string }>;
  verifyAndEnable2fa: (otp: string) => Promise<boolean>;
  disable2fa: () => Promise<void>;
  terminateSession: (sessionId: string) => void;
  removeDevice: (deviceId: string) => void;
  recoverAccount: (identifier: string) => Promise<boolean>;
  resetPassword: (identifier: string, otp: string, newPin: string) => Promise<boolean>;
  logActivity: (action: string, module: string, details?: string) => void;
  createSubUser: (userData: Partial<User>) => Promise<boolean>;
  deleteSubUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Auto-add token for existing users
      if (!parsedUser.token) {
          parsedUser.token = `mock-token-${parsedUser.id}`;
          localStorage.setItem('nexus_user', JSON.stringify(parsedUser));
      }
      setUser(parsedUser);
    }
    
    // Removed mock initial data
    setSessions([]);
    setDevices([]);
    setLoginHistory([]);
  }, []);

  const logActivity = (action: string, module: string, details?: string) => {
    const newLog: ActivityLogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        userId: user?.id || 'anonymous',
        userName: user?.businessName || 'System',
        action,
        module,
        timestamp: new Date().toISOString(),
        details
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Trigger security notification for sensitive actions
    if (module === 'Security' || module === 'Auth') {
        addNotification(
            `Security Alert: ${action}`,
            details || `A security-related action was performed in the ${module} module.`,
            action.toLowerCase().includes('fail') ? 'error' : 'warning',
            '/access'
        );
    }
  };

  const login = async (identifier: string, secret: string, method: 'PASSWORD' | 'PIN' | 'OTP'): Promise<{ success: boolean; require2fa?: boolean }> => {
    // SaaS Owner Check
    if (identifier === 'admin' && (secret === 'admin123' || secret === '1234')) {
        const saasOwner: User = {
            id: 'saas-owner-001',
            token: 'mock-token-saas-owner-001',
            name: 'SaaS Owner',
            businessName: 'Bizora Platform',
            email: 'owner@bizora.com',
            mobile: '0000000000',
            businessType: 'SaaS',
            location: 'Global',
            locationCount: 0,
            isPremium: true,
            unlockedTemplates: [1,2,3,4,5],
            role: UserRole.SAAS_OWNER,
            permissions: ['all'], // Full SaaS access
            initialLoginDate: new Date().toISOString(),
            twoFactorEnabled: false,
            pinEnabled: true,
            passwordEnabled: true,
            businesses: []
        };
        setUser(saasOwner);
        localStorage.setItem('nexus_user', JSON.stringify(saasOwner));
        logActivity('Login', 'Auth', `SaaS Owner logged in via ${method}`);
        return { success: true };
    }

    // SaaS Admin Check
    if (identifier === 'saas' && (secret === 'saas123' || secret === '1234')) {
        const saasAdmin: User = {
            id: 'saas-admin-001',
            token: 'mock-token-saas-admin-001',
            name: 'SaaS Admin',
            businessName: 'Bizora Support',
            email: 'admin@bizora.com',
            mobile: '0000000000',
            businessType: 'SaaS',
            location: 'Global',
            locationCount: 0,
            isPremium: true,
            unlockedTemplates: [1,2,3,4,5],
            role: UserRole.SAAS_ADMIN,
            permissions: [
                'saas.users', 
                'saas.businesses', 
                'saas.support', 
                'saas.subscriptions'
            ],
            initialLoginDate: new Date().toISOString(),
            twoFactorEnabled: false,
            pinEnabled: true,
            passwordEnabled: true,
            businesses: []
        };
        setUser(saasAdmin);
        localStorage.setItem('nexus_user', JSON.stringify(saasAdmin));
        logActivity('Login', 'Auth', `SaaS Admin logged in via ${method}`);
        return { success: true };
    }

    // Check against Staff records in localStorage
    const savedStaff = localStorage.getItem('nexus_staff');
    if (savedStaff) {
        const staffList: Staff[] = JSON.parse(savedStaff);
        // Check by name or ID, and PIN
        const staffMember = staffList.find(s => 
            (s.name === identifier || s.id === identifier) && s.pin === secret && s.status === 'Active'
        );

        if (staffMember) {
            const staffUser: User = {
                id: staffMember.id,
                token: `mock-token-${staffMember.id}`,
                name: staffMember.name,
                businessName: 'My Enterprise', // Default business name
                email: `${staffMember.name.toLowerCase().replace(/\s/g, '.')}@example.com`, // Mock email
                mobile: '0000000000',
                businessType: 'Retail',
                location: staffMember.lastLocation?.address || 'Main Store',
                locationCount: 1,
                isPremium: false,
                unlockedTemplates: [1],
                role: staffMember.role as UserRole, // Cast role
                permissions: staffMember.permissions,
                initialLoginDate: staffMember.lastLogin || new Date().toISOString(),
                twoFactorEnabled: false,
                pinEnabled: true,
                passwordEnabled: false,
                businesses: [
                    { id: 'b1', name: 'My Enterprise', type: 'Retail', location: 'New York, USA' }
                ]
            };
            
            setUser(staffUser);
            localStorage.setItem('nexus_user', JSON.stringify(staffUser));
            logActivity('Login', 'Auth', `Staff ${staffMember.name} logged in`);
            return { success: true };
        }
    }

    // Check against registered users
    const savedUsers = localStorage.getItem('nexus_registered_users');
    if (savedUsers) {
        const users: User[] = JSON.parse(savedUsers);
        const registeredUser = users.find(u => 
            (u.email === identifier || u.mobile === identifier) && 
            (method === 'OTP' || secret === u.pin || secret === u.password)
        );

        if (registeredUser) {
            if (registeredUser.twoFactorEnabled) {
                setPendingUser(registeredUser);
                return { success: true, require2fa: true };
            }
            const userWithToken = { ...registeredUser, token: `mock-token-${registeredUser.id}` };
            setUser(userWithToken);
            localStorage.setItem('nexus_user', JSON.stringify(userWithToken));
            logActivity('Login', 'Auth', `Logged in via ${method}`);
            return { success: true };
        }
    }

    return { success: false };
  };

  const complete2fa = async (otp: string): Promise<boolean> => {
    if (otp === '1234' && pendingUser) {
        setUser(pendingUser);
        localStorage.setItem('nexus_user', JSON.stringify(pendingUser));
        logActivity('Login 2FA', 'Auth', 'Completed 2FA verification');
        setPendingUser(null);
        return true;
    }
    return false;
  };

  const signup = async (data: any): Promise<boolean> => {
    const userId = 'user-' + Math.random().toString(36).substring(2, 7);
    const newUser: User = {
      id: userId,
      token: `mock-token-${userId}`,
      name: data.name || 'Shop Owner',
      businessName: data.businessName,
      email: data.email,
      mobile: data.mobile,
      businessType: data.businessType,
      location: data.location,
      locationCount: parseInt(data.locationCount) || 1,
      isPremium: false,
      unlockedTemplates: [1],
      role: UserRole.OWNER,
      permissions: getAllPermissions(), // Give all permissions for new owner
      initialLoginDate: new Date().toISOString(),
      twoFactorEnabled: false,
      pinEnabled: true,
      passwordEnabled: true,
      pin: data.pin,
      password: data.password,
      businesses: [
          { id: 'b1', name: data.businessName, type: data.businessType, location: data.location }
      ]
    };

    const savedUsers = localStorage.getItem('nexus_registered_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    users.push(newUser);
    localStorage.setItem('nexus_registered_users', JSON.stringify(users));

    // Clear existing data for a clean start
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nexus_') && key !== 'nexus_user' && key !== 'nexus_registered_users') {
            localStorage.removeItem(key);
        }
    });

    setUser(newUser);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
    logActivity('Signup', 'Auth', 'Created new account');
    return true;
  };

  const socialLogin = async (provider: 'google' | 'facebook' | 'apple'): Promise<boolean> => {
    // Mock social login
    const result = await login('social-user@example.com', 'social', 'OTP');
    return result.success;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    return otp === '1234';
  };

  const logout = () => {
    logActivity('Logout', 'Auth');
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  const upgradeSubscription = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      setUser(updatedUser);
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
      logActivity('Upgrade', 'Subscription', 'Upgraded to Premium');
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
      logActivity('Update Profile', 'Settings');
    }
  };

  const unlockTemplate = (templateId: number) => {
      if (user && !user.unlockedTemplates.includes(templateId)) {
          const updatedUser = { 
              ...user, 
              unlockedTemplates: [...user.unlockedTemplates, templateId] 
          };
          setUser(updatedUser);
          localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
      }
  };

  const switchBusiness = (businessId: string) => {
    if (user && user.businesses) {
        const target = user.businesses.find(b => b.id === businessId);
        if (target) {
            const updatedUser = { 
                ...user, 
                businessName: target.name,
                businessType: target.type,
                location: target.location
            };
            setUser(updatedUser);
            localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
            logActivity('Switch Business', 'Auth', `Switched to ${target.name}`);
            // In a real app, this would trigger a reload of all data contexts
            window.location.reload(); 
        }
    }
  };

  const updateBusinessSettings = (businessId: string, settings: Partial<BusinessSettings>) => {
    if (user && user.businesses) {
        const updatedBusinesses = user.businesses.map(b => 
            b.id === businessId ? { ...b, settings: { ...b.settings, ...settings } } : b
        );
        updateUser({ businesses: updatedBusinesses });
        logActivity('Update Business Settings', 'Settings', `Business ID: ${businessId}`);
    }
  };

  const addBusiness = (businessData: Omit<Business, 'id'>) => {
    if (user) {
        const newBusiness: Business = {
            ...businessData,
            id: Math.random().toString(36).substring(2, 9),
            settings: {
                timezone: 'UTC',
                currency: 'USD',
                workingHours: {
                    monday: { open: '09:00', close: '17:00', closed: false },
                    tuesday: { open: '09:00', close: '17:00', closed: false },
                    wednesday: { open: '09:00', close: '17:00', closed: false },
                    thursday: { open: '09:00', close: '17:00', closed: false },
                    friday: { open: '09:00', close: '17:00', closed: false },
                    saturday: { open: '10:00', close: '14:00', closed: false },
                    sunday: { open: '00:00', close: '00:00', closed: true },
                }
            }
        };
        const updatedBusinesses = [...(user.businesses || []), newBusiness];
        updateUser({ businesses: updatedBusinesses });
        logActivity('Add Business', 'Auth', `Added ${newBusiness.name}`);
    }
  };

  const initiate2faSetup = async () => {
    // Mock generating a secret and QR code
    return {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Bizora:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Bizora'
    };
  };

  const verifyAndEnable2fa = async (otp: string): Promise<boolean> => {
    if (otp === '1234' && user) {
        updateUser({ twoFactorEnabled: true });
        logActivity('Enable 2FA', 'Security', 'User verified and enabled 2FA');
        return true;
    }
    return false;
  };

  const disable2fa = async () => {
    if (user) {
        updateUser({ twoFactorEnabled: false });
        logActivity('Disable 2FA', 'Security', 'User disabled 2FA');
    }
  };

  const terminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    logActivity('Terminate Session', 'Security', `Session ID: ${sessionId}`);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    logActivity('Remove Device', 'Security', `Device ID: ${deviceId}`);
  };

  const recoverAccount = async (identifier: string) => {
    // Mock recovery - send OTP
    console.log(`Recovery OTP sent to ${identifier}`);
    logActivity('Recovery Requested', 'Auth', `Recovery code sent to ${identifier}`);
    return true;
  };

  const resetPassword = async (identifier: string, otp: string, newPin: string) => {
      if (otp === '1234') {
          // In a real app, we would update the user's PIN in the database
          logActivity('PIN Reset', 'Security', `PIN successfully reset for ${identifier}`);
          return true;
      }
      return false;
  };

  const createSubUser = async (userData: Partial<User>) => {
    logActivity('Create Sub-User', 'User Management', `Name: ${userData.businessName}`);
    return true;
  };

  const deleteSubUser = (userId: string) => {
    logActivity('Delete Sub-User', 'User Management', `User ID: ${userId}`);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        sessions,
        loginHistory,
        activityLogs,
        devices,
        login, 
        signup, 
        socialLogin,
        verifyOtp,
        complete2fa,
        logout, 
        upgradeSubscription, 
        updateUser, 
        unlockTemplate,
        switchBusiness,
        updateBusinessSettings,
        addBusiness,
        initiate2faSetup,
        verifyAndEnable2fa,
        disable2fa,
        terminateSession,
        removeDevice,
        recoverAccount,
        resetPassword,
        logActivity,
        createSubUser,
        deleteSubUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
