import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppLanguage, Currency } from '../types';
import { translations } from '../utils/translations';

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface InvoiceConfig {
    logo?: string;
    footerNote: string;
    showSignature: boolean;
    showSeal: boolean;
}

interface SettingsContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  currencySymbol: string;
  t: (key: string) => string;
  
  // Invoice & Format
  invoiceTemplateId: number;
  setInvoiceTemplateId: (id: number) => void;
  decimalPlaces: number;
  setDecimalPlaces: (num: number) => void;
  formatMoney: (amount: number) => string;
  
  // Invoice Customization
  invoiceConfig: InvoiceConfig;
  setInvoiceConfig: (config: InvoiceConfig) => void;
  
  // Currency Conversion Helpers
  convertLocalToGlobal: (localAmount: number) => number;
  convertGlobalToLocal: (globalAmount: number) => number;
  
  // Marketing Slides
  promoSlides: {id: number, title: string, desc: string, color: string}[];
  updatePromoSlides: (slides: any[]) => void;

  // Appearance / Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Exchange Rates relative to USD (Base Currency)
const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1,
  [Currency.EUR]: 0.92,
  [Currency.GBP]: 0.79,
  [Currency.JPY]: 150.5,
  [Currency.CAD]: 1.35,
  [Currency.AUD]: 1.52,
  [Currency.CNY]: 7.19,
  [Currency.INR]: 83.5,
  [Currency.BDT]: 120.0,
  [Currency.PKR]: 278.5,
  [Currency.SAR]: 3.75,
  [Currency.AED]: 3.67,
  [Currency.RUB]: 92.5,
  [Currency.BRL]: 4.98,
  [Currency.MXN]: 16.8,
  [Currency.TRY]: 32.1,
  [Currency.IDR]: 15700,
  [Currency.KRW]: 1330,
  [Currency.VND]: 24600,
  [Currency.THB]: 35.8,
  [Currency.ZAR]: 18.9,
  [Currency.NGN]: 1500,
  [Currency.PHP]: 56.2,
  [Currency.MYR]: 4.75,
  [Currency.SGD]: 1.34,
  [Currency.HKD]: 7.82,
  [Currency.NZD]: 1.65,
  [Currency.CHF]: 0.88,
  [Currency.SEK]: 10.3,
  [Currency.NOK]: 10.5,
  [Currency.DKK]: 6.8,
  [Currency.PLN]: 3.95,
  [Currency.HUF]: 360,
  [Currency.CZK]: 23.3,
  [Currency.ILS]: 3.65,
  [Currency.EGP]: 47.5,
  [Currency.KWD]: 0.31,
  [Currency.QAR]: 3.64,
  [Currency.OMR]: 0.38,
  [Currency.LKR]: 305,
  [Currency.NPR]: 133,
  [Currency.KES]: 135
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.JPY]: '¥',
  [Currency.CAD]: 'C$',
  [Currency.AUD]: 'A$',
  [Currency.CNY]: '¥',
  [Currency.INR]: '₹',
  [Currency.BDT]: '৳',
  [Currency.PKR]: '₨',
  [Currency.SAR]: '﷼',
  [Currency.AED]: 'د.إ',
  [Currency.RUB]: '₽',
  [Currency.BRL]: 'R$',
  [Currency.MXN]: '$',
  [Currency.TRY]: '₺',
  [Currency.IDR]: 'Rp',
  [Currency.KRW]: '₩',
  [Currency.VND]: '₫',
  [Currency.THB]: '฿',
  [Currency.ZAR]: 'R',
  [Currency.NGN]: '₦',
  [Currency.PHP]: '₱',
  [Currency.MYR]: 'RM',
  [Currency.SGD]: 'S$',
  [Currency.HKD]: 'HK$',
  [Currency.NZD]: 'NZ$',
  [Currency.CHF]: 'Fr',
  [Currency.SEK]: 'kr',
  [Currency.NOK]: 'kr',
  [Currency.DKK]: 'kr',
  [Currency.PLN]: 'zł',
  [Currency.HUF]: 'Ft',
  [Currency.CZK]: 'Kč',
  [Currency.ILS]: '₪',
  [Currency.EGP]: 'E£',
  [Currency.KWD]: 'KD',
  [Currency.QAR]: 'QR',
  [Currency.OMR]: 'OMR',
  [Currency.LKR]: 'Rs',
  [Currency.NPR]: 'Rs',
  [Currency.KES]: 'KSh'
};

const DEFAULT_SLIDES = [
    { id: 1, title: "Organize your business!", desc: "Get Lifetime Subscription for only $99", color: "bg-yellow-400" },
    { id: 2, title: "Ramadan Special", desc: "50% Off on SMS Marketing Packages", color: "bg-emerald-500" },
    { id: 3, title: "Enterprise Power", desc: "Unlock AI Analytics for your team", color: "bg-purple-600" }
];

const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
    footerNote: "Thank you for your business!",
    showSignature: true,
    showSeal: false
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(AppLanguage.ENGLISH);
  const [currency, setCurrencyState] = useState<Currency>(Currency.USD);
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  
  // Format States
  const [invoiceTemplateId, setInvoiceTemplateId] = useState<number>(1);
  const [invoiceConfig, setInvoiceConfigState] = useState<InvoiceConfig>(DEFAULT_INVOICE_CONFIG);
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);
  const [promoSlides, setPromoSlides] = useState(DEFAULT_SLIDES);

  // Theme States
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [brandColor, setBrandColor] = useState<string>('#4f46e5'); // Default Indigo-600

  // Load Settings
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    const savedCurr = localStorage.getItem('app_currency');
    const savedTempl = localStorage.getItem('app_template');
    const savedInvConfig = localStorage.getItem('app_invoice_config');
    const savedDec = localStorage.getItem('app_decimal');
    const savedSlides = localStorage.getItem('app_slides');
    const savedTheme = localStorage.getItem('app_theme_mode');
    const savedColor = localStorage.getItem('app_brand_color');
    
    if (savedLang && Object.values(AppLanguage).includes(savedLang as AppLanguage)) {
      setLanguageState(savedLang as AppLanguage);
    }
    if (savedCurr && Object.values(Currency).includes(savedCurr as Currency)) {
      setCurrencyState(savedCurr as Currency);
    }
    if (savedTempl) setInvoiceTemplateId(parseInt(savedTempl));
    if (savedInvConfig) {
        try {
            setInvoiceConfigState(JSON.parse(savedInvConfig));
        } catch (e) {
            console.error("Failed to parse invoice config");
        }
    }
    if (savedDec) setDecimalPlaces(parseInt(savedDec));
    if (savedSlides) setPromoSlides(JSON.parse(savedSlides));
    if (savedTheme) setThemeMode(savedTheme as ThemeMode);
    if (savedColor) setBrandColor(savedColor);
  }, []);

  // Sync Currency Symbol
  useEffect(() => {
    setCurrencySymbol(CURRENCY_SYMBOLS[currency] || currency);
  }, [currency]);

  // Apply Theme Logic (CSS Variable Injection)
  useEffect(() => {
    // 1. Determine Dark Mode
    const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // 2. Generate CSS Overrides
    // We override specific Tailwind classes globally to apply the theme without rewriting components
    // We specifically target the 'indigo' palette which is used as the primary brand color
    // And 'slate' palette which is used for backgrounds/text
    
    const root = document.documentElement;
    const styleId = 'bizora-dynamic-theme';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }

    // Helper to hex to rgb
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '79, 70, 229';
    };

    const primaryRgb = hexToRgb(brandColor);

    let css = `
        :root {
            --primary-rgb: ${primaryRgb};
        }
        
        /* Override Tailwind Indigo (Primary) classes with Brand Color */
        .bg-indigo-600, .hover\\:bg-indigo-600:hover, .bg-indigo-500 { background-color: ${brandColor} !important; }
        .text-indigo-600, .hover\\:text-indigo-600:hover, .text-indigo-500 { color: ${brandColor} !important; }
        .border-indigo-600, .focus\\:ring-indigo-500:focus { border-color: ${brandColor} !important; }
        .ring-indigo-600 { --tw-ring-color: ${brandColor} !important; }
        
        /* Light BG versions */
        .bg-indigo-50, .hover\\:bg-indigo-50:hover { background-color: rgba(var(--primary-rgb), 0.1) !important; color: ${brandColor} !important; }
        .bg-indigo-100 { background-color: rgba(var(--primary-rgb), 0.2) !important; color: ${brandColor} !important; }
    `;

    if (isDark) {
        root.classList.add('dark');
        // Dark Mode Overrides for Slate (Backgrounds/Text)
        css += `
            body, .bg-slate-50, .bg-slate-100 { background-color: #0f172a !important; color: #f1f5f9 !important; }
            .bg-white { background-color: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }
            .text-slate-900, .text-slate-800, .text-slate-700 { color: #f8fafc !important; }
            .text-slate-600, .text-slate-500, .text-slate-400 { color: #94a3b8 !important; }
            .border-slate-200, .border-slate-300, .border-slate-100 { border-color: #334155 !important; }
            input, select, textarea { background-color: #334155 !important; color: white !important; border-color: #475569 !important; }
            /* Specific fix for inputs with white bg in code */
            .bg-white input { background-color: transparent !important; }
        `;
    } else {
        root.classList.remove('dark');
    }

    styleTag.innerHTML = css;

  }, [themeMode, brandColor]);

  // Setters
  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('app_currency', curr);
  };

  const updateInvoiceTemplate = (id: number) => {
      setInvoiceTemplateId(id);
      localStorage.setItem('app_template', id.toString());
  };

  const setInvoiceConfig = (config: InvoiceConfig) => {
      setInvoiceConfigState(config);
      localStorage.setItem('app_invoice_config', JSON.stringify(config));
  };

  const updateDecimalPlaces = (num: number) => {
      setDecimalPlaces(num);
      localStorage.setItem('app_decimal', num.toString());
  };

  const updatePromoSlides = (slides: any[]) => {
      setPromoSlides(slides);
      localStorage.setItem('app_slides', JSON.stringify(slides));
  };

  const saveThemeMode = (mode: ThemeMode) => {
      setThemeMode(mode);
      localStorage.setItem('app_theme_mode', mode);
  }

  const saveBrandColor = (color: string) => {
      setBrandColor(color);
      localStorage.setItem('app_brand_color', color);
  }

  // Helpers
  const convertGlobalToLocal = useCallback((amount: number) => {
      const rate = EXCHANGE_RATES[currency] || 1;
      return amount * rate;
  }, [currency]);

  const convertLocalToGlobal = useCallback((localAmount: number) => {
      const rate = EXCHANGE_RATES[currency] || 1;
      if (rate === 0) return 0;
      return localAmount / rate;
  }, [currency]);

  const formatMoney = useCallback((amount: number) => {
      const convertedAmount = convertGlobalToLocal(amount);
      return `${currencySymbol} ${convertedAmount.toLocaleString(undefined, { 
          minimumFractionDigits: decimalPlaces, 
          maximumFractionDigits: decimalPlaces 
      })}`;
  }, [currencySymbol, decimalPlaces, convertGlobalToLocal]);

  const t = useCallback((key: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) return langDict[key];
    const enDict = translations[AppLanguage.ENGLISH];
    if (enDict && enDict[key]) return enDict[key];
    return key; 
  }, [language]);

  return (
    <SettingsContext.Provider value={{ 
        language, setLanguage, 
        currency, setCurrency, 
        currencySymbol, t,
        invoiceTemplateId, setInvoiceTemplateId: updateInvoiceTemplate,
        invoiceConfig, setInvoiceConfig,
        decimalPlaces, setDecimalPlaces: updateDecimalPlaces,
        formatMoney,
        convertLocalToGlobal,
        convertGlobalToLocal,
        promoSlides, updatePromoSlides,
        themeMode, setThemeMode: saveThemeMode,
        brandColor, setBrandColor: saveBrandColor
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};