
import React from 'react';

export enum AppLanguage {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  JAPANESE = 'ja',
  CHINESE = 'zh',
  HINDI = 'hi',
  ARABIC = 'ar',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  BENGALI = 'bn',
  URDU = 'ur',
  INDONESIAN = 'id',
  TURKISH = 'tr',
  ITALIAN = 'it',
  KOREAN = 'ko',
  VIETNAMESE = 'vi',
  THAI = 'th',
  DUTCH = 'nl',
  POLISH = 'pl',
  FILIPINO = 'tl',
  MALAY = 'ms',
  PERSIAN = 'fa',
  SWAHILI = 'sw',
  TAMIL = 'ta',
  TELUGU = 'te',
  MARATHI = 'mr',
  GUJARATI = 'gu',
  PUNJABI = 'pa',
  UKRAINIAN = 'uk',
  ROMANIAN = 'ro',
  GREEK = 'el',
  CZECH = 'cs',
  HUNGARIAN = 'hu',
  SWEDISH = 'sv',
  NORWEGIAN = 'no',
  DANISH = 'da',
  FINNISH = 'fi',
  HEBREW = 'he'
}

export enum Currency {
  USD = 'USD', // United States Dollar (BASE)
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound Sterling
  JPY = 'JPY', // Japanese Yen
  CAD = 'CAD', // Canadian Dollar
  AUD = 'AUD', // Australian Dollar
  CNY = 'CNY', // Chinese Yuan
  INR = 'INR', // Indian Rupee
  BDT = 'BDT', // Bangladeshi Taka
  PKR = 'PKR', // Pakistani Rupee
  SAR = 'SAR', // Saudi Riyal
  AED = 'AED', // United Arab Emirates Dirham
  RUB = 'RUB', // Russian Ruble
  BRL = 'BRL', // Brazilian Real
  MXN = 'MXN', // Mexican Peso
  TRY = 'TRY', // Turkish Lira
  IDR = 'IDR', // Indonesian Rupiah
  KRW = 'KRW', // South Korean Won
  VND = 'VND', // Vietnamese Dong
  THB = 'THB', // Thai Baht
  ZAR = 'ZAR', // South African Rand
  NGN = 'NGN', // Nigerian Naira
  PHP = 'PHP', // Philippine Peso
  MYR = 'MYR', // Malaysian Ringgit
  SGD = 'SGD', // Singapore Dollar
  HKD = 'HKD', // Hong Kong Dollar
  NZD = 'NZD', // New Zealand Dollar
  CHF = 'CHF', // Swiss Franc
  SEK = 'SEK', // Swedish Krona
  NOK = 'NOK', // Norwegian Krone
  DKK = 'DKK', // Danish Krone
  PLN = 'PLN', // Polish Zloty
  HUF = 'HUF', // Hungarian Forint
  CZK = 'CZK', // Czech Koruna
  ILS = 'ILS', // Israeli New Shekel
  EGP = 'EGP', // Egyptian Pound
  KWD = 'KWD', // Kuwaiti Dinar
  QAR = 'QAR', // Qatari Riyal
  OMR = 'OMR', // Omani Rial
  LKR = 'LKR', // Sri Lankan Rupee
  NPR = 'NPR', // Nepalese Rupee
  KES = 'KES'  // Kenyan Shilling
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export enum UserRole {
  // SaaS Level
  SAAS_OWNER = 'SAAS_OWNER',
  SAAS_ADMIN = 'SAAS_ADMIN',
  
  // Business Level
  SHOP_OWNER = 'SHOP_OWNER', // Previously OWNER
  OWNER = 'OWNER', // Kept for backward compatibility
  
  // Staff
  ADMIN = 'ADMIN', // Shop Admin
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  SALES = 'SALES',
  STOCK_MANAGER = 'STOCK_MANAGER'
}

export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_PRODUCTS = 'MANAGE_PRODUCTS',
  MAKE_SALES = 'MAKE_SALES',
  MAKE_PURCHASES = 'MAKE_PURCHASES',
  VIEW_REPORTS = 'VIEW_REPORTS',
  MANAGE_STORES = 'MANAGE_STORES',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  DELETE_RECORDS = 'DELETE_RECORDS',
  VIEW_LEDGERS = 'VIEW_LEDGERS'
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  method: 'PASSWORD' | 'PIN' | 'OTP' | 'SOCIAL';
  device: string;
  ip: string;
}

export interface Staff {
  id: string;
  storeId?: string;
  name: string;
  role: string; // e.g., 'Manager', 'Sales', 'Stock'
  pin: string;
  permissions: string[]; // List of permission keys e.g., 'sale.create', 'stock.view'
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  // HR Fields
  joiningDate?: string;
  basicSalary?: number;
  salesTarget?: number; // Monthly sales target
  commissionRate?: number; // Commission percentage (e.g., 5 for 5%)
  attendance?: Record<string, { status: 'Present' | 'Absent' | 'Leave' | 'Half Day', checkIn?: string, checkOut?: string }>; // Key: YYYY-MM-DD
  performance?: {
      rating: number; // 1-5
      reviews: { date: string, comment: string, rating: number }[];
  };
  lastLocation?: { lat: number, lng: number, address: string, timestamp: string };
  locationHistory?: { lat: number, lng: number, address: string, timestamp: string }[];
}

export interface AppLog {
  id: string;
  staffName: string;
  action: string;
  module: string;
  timestamp: string;
  details?: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
  details?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'MOBILE' | 'DESKTOP' | 'TABLET';
  lastUsed: string;
  isTrusted: boolean;
}

export enum AiModelType {
  CHAT = 'gemini-3-pro-preview',
  VISION = 'gemini-3-pro-preview',
  VIDEO = 'gemini-3-pro-preview',
  IMAGE_GEN = 'gemini-3-pro-image-preview',
  MAPS = 'gemini-2.5-flash',
  TTS = 'gemini-2.5-flash-preview-tts'
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        reviewText?: string;
        authorAttribution?: {
          displayName?: string;
        }
      }[]
    }
  }
}
