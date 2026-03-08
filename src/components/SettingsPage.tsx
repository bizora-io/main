
import React, { useState } from 'react';
import { useSettings, InvoiceConfig, CURRENCY_SYMBOLS, ThemeMode } from '../contexts/SettingsContext';
import { useAuth, Business, BusinessSettings as BusinessSettingsType } from '../contexts/AuthContext';
import { useStores } from '../contexts/StoreContext';
import { AppLanguage, Currency } from '../types';
import { 
    User, FileText, Save, Lock, CheckCircle, Crown, Shield, Smartphone, Mail, Hash, 
    ToggleLeft, ToggleRight, X, Loader2, Briefcase, Palette, Moon, Sun, Monitor, 
    Layout, Image as ImageIcon, PenTool, Eye, Globe, History, Laptop, LogOut, 
    Trash2, Bell, Plus, MapPin, Clock, Phone, Globe as WebsiteIcon, Settings, 
    MessageSquare, Mail as MailIcon, ChevronRight, Building2, Store, Map as MapIcon,
    DollarSign, Percent
} from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';
import { LedgerEntry } from '../contexts/DataContext';

// Visual Component for Mini Invoice Designs
const MiniInvoice = ({ id }: { id: number }) => {
    return (
        <div className={`w-full h-full bg-white flex flex-col shadow-sm border border-slate-100 overflow-hidden text-[4px] leading-tight select-none`}>
            
            {/* Template 1: Classic Simple */}
            {id === 1 && (
                <div className="p-2 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-1">
                        <div className="space-y-0.5">
                            <div className="w-4 h-4 bg-slate-800 rounded mb-0.5"></div>
                            <div className="w-8 h-1 bg-slate-300 rounded-sm"></div>
                        </div>
                        <div className="text-right">
                            <div className="w-10 h-2 bg-slate-200 rounded-sm mb-0.5 ml-auto"></div>
                            <div className="w-6 h-0.5 bg-slate-200 rounded-sm ml-auto"></div>
                        </div>
                    </div>
                    <div className="space-y-1 mt-1">
                        <div className="w-full h-2 bg-slate-50"></div>
                        <div className="w-full h-2 bg-white"></div>
                        <div className="w-full h-2 bg-slate-50"></div>
                    </div>
                </div>
            )}

            {/* Template 2: Modern Indigo */}
            {id === 2 && (
                <div className="flex flex-col h-full">
                    <div className="bg-indigo-600 h-8 w-full relative mb-2">
                        <div className="absolute bottom-1 left-2 w-6 h-1 bg-white/50 rounded-sm"></div>
                        <div className="absolute top-1 right-2 w-8 h-2 bg-white/20 rounded-sm"></div>
                    </div>
                    <div className="px-2">
                        <div className="flex justify-between mb-2">
                            <div className="w-6 h-2 bg-slate-200 rounded-sm"></div>
                            <div className="w-6 h-2 bg-slate-200 rounded-sm"></div>
                        </div>
                        <div className="w-full h-1.5 bg-indigo-50 rounded-sm mb-0.5"></div>
                        <div className="w-full h-1.5 bg-white rounded-sm mb-0.5"></div>
                        <div className="w-full h-1.5 bg-indigo-50/50 rounded-sm mb-0.5"></div>
                        
                        <div className="mt-2 ml-auto w-8 h-4 bg-indigo-50 rounded-sm flex items-center justify-center">
                            <div className="w-6 h-1 bg-indigo-200 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template 3: Dark Professional */}
            {id === 3 && (
                <div className="flex flex-col h-full">
                    <div className="bg-slate-900 h-6 w-full p-1 flex justify-between items-center mb-2">
                         <div className="w-2 h-2 bg-white rounded-sm"></div>
                         <div className="w-6 h-1 bg-slate-700 rounded-sm"></div>
                    </div>
                    <div className="px-2">
                        <div className="flex gap-2 mb-2">
                            <div className="w-1/2 h-4 bg-slate-50 rounded-sm"></div>
                            <div className="w-1/2 h-4 bg-slate-50 rounded-sm"></div>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-sm mb-0.5"></div>
                        <div className="w-full h-1 bg-slate-100 mb-0.5"></div>
                        <div className="w-full h-1 bg-slate-100 mb-0.5"></div>
                    </div>
                </div>
            )}

            {/* Template 4: Creative Orange */}
            {id === 4 && (
                <div className="flex h-full">
                    <div className="w-1/3 bg-orange-500 h-full p-1 flex flex-col justify-between">
                        <div className="w-4 h-4 border border-white/50 rounded-full"></div>
                        <div className="space-y-0.5">
                             <div className="w-6 h-0.5 bg-white/50"></div>
                             <div className="w-4 h-0.5 bg-white/50"></div>
                        </div>
                    </div>
                    <div className="flex-1 p-2 flex flex-col">
                        <div className="w-12 h-2 bg-slate-800 rounded-sm mb-2"></div>
                        <div className="w-full h-1 bg-orange-100 mb-1"></div>
                        <div className="w-full h-1 bg-white mb-1"></div>
                        <div className="w-full h-1 bg-orange-50 mb-1"></div>
                        <div className="mt-auto w-full h-6 bg-orange-50 rounded-sm border border-orange-100"></div>
                    </div>
                </div>
            )}

            {/* Template 5: Formal Serif */}
            {id === 5 && (
                <div className="p-2 flex flex-col h-full bg-[#fdfbf7]">
                    <div className="border-b border-double border-slate-300 pb-1 mb-2 text-center">
                        <div className="w-12 h-1.5 bg-slate-900 mx-auto mb-0.5 font-serif"></div>
                        <div className="w-8 h-0.5 bg-slate-400 mx-auto"></div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div className="w-8 h-2 bg-slate-100"></div>
                        <div className="w-8 h-2 bg-slate-100 text-right"></div>
                    </div>
                    <div className="w-full border border-slate-200 h-10 mb-1 flex flex-col">
                        <div className="w-full h-2 bg-slate-100 border-b border-slate-200"></div>
                        <div className="w-full h-2 border-b border-slate-100"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TEMPLATES = [
    { id: 1, name: 'Classic Simple', price: 0 },
    { id: 2, name: 'Modern Indigo', price: 10 },
    { id: 3, name: 'Dark Professional', price: 15 },
    { id: 4, name: 'Creative Orange', price: 12 },
    { id: 5, name: 'Formal Serif', price: 20 },
];

const PRESET_COLORS = [
    { name: 'Nexus Indigo', value: '#4f46e5' },
    { name: 'Ocean Blue', value: '#0ea5e9' },
    { name: 'Royal Rose', value: '#e11d48' },
    { name: 'Forest Green', value: '#059669' },
    { name: 'Golden Amber', value: '#d97706' },
    { name: 'Deep Purple', value: '#7c3aed' },
];

const SettingsPage: React.FC = () => {
    const { 
        t, formatMoney, 
        invoiceTemplateId, setInvoiceTemplateId, 
        invoiceConfig, setInvoiceConfig,
        decimalPlaces, setDecimalPlaces, 
        currency, setCurrency, 
        language, setLanguage,
        themeMode, setThemeMode,
        brandColor, setBrandColor
    } = useSettings();
    const { user, updateUser, unlockTemplate, initiate2faSetup, verifyAndEnable2fa, disable2fa, sessions, loginHistory, devices, terminateSession, removeDevice, activityLogs, switchBusiness, updateBusinessSettings, addBusiness } = useAuth();
    const { stores, addStore, updateStore, deleteStore } = useStores();
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'business' | 'templates' | 'security'>('profile');
    const [businessSubTab, setBusinessSubTab] = useState<'general' | 'stores' | 'tax' | 'hours' | 'notifications' | 'localization'>('general');
    
    // Business State
    const activeBusiness = user?.businesses?.find(b => b.name === user.businessName) || user?.businesses?.[0];
    const [businessData, setBusinessData] = useState<Partial<Business>>(activeBusiness || {});
    const [isAddingBusiness, setIsAddingBusiness] = useState(false);
    const [newBusinessName, setNewBusinessName] = useState('');
    
    // Store Modal State
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [editingStore, setEditingStore] = useState<any>(null);
    const [storeFormData, setStoreFormData] = useState({ name: '', location: '', phone: '', isHeadOffice: false });
    const [show2faSetup, setShow2faSetup] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState<{ secret: string; qrCode: string } | null>(null);
    const [twoFactorOtp, setTwoFactorOtp] = useState('');
    const [isVerifying2fa, setIsVerifying2fa] = useState(false);
    
    // Profile State
    const [profileData, setProfileData] = useState({
        businessName: user?.businessName || '',
        businessType: user?.businessType || '',
        location: user?.location || '',
        locationCount: user?.locationCount || 1,
    });

    // Business Control State (Mock)
    const [fiscalYearStart, setFiscalYearStart] = useState('2024-01-01');
    const [taxRegion, setTaxRegion] = useState('Default');

    // Security State
    const [googleAuth, setGoogleAuth] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Purchase Modal
    const [purchaseModal, setPurchaseModal] = useState<{show: boolean, template: typeof TEMPLATES[0] | null}>({ show: false, template: null });
    const [isProcessing, setIsProcessing] = useState(false);

    // Invoice Preview State
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(profileData);
        alert("Profile updated successfully!");
    };

    const handleBusinessSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeBusiness) {
            updateBusinessSettings(activeBusiness.id, businessData.settings || {});
            updateUser({ 
                businessName: businessData.name,
                businessType: businessData.type,
                location: businessData.location
            });
            alert("Business settings updated successfully!");
        }
    };

    const handleAddBusiness = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBusinessName) {
            addBusiness({ 
                name: newBusinessName, 
                type: 'Retail', 
                location: 'Main Office' 
            });
            setNewBusinessName('');
            setIsAddingBusiness(false);
            alert("New business added successfully!");
        }
    };

    const handleStoreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStore) {
            updateStore(editingStore.id, storeFormData);
        } else {
            addStore(storeFormData);
        }
        setShowStoreModal(false);
        setEditingStore(null);
        setStoreFormData({ name: '', location: '', phone: '', isHeadOffice: false });
    };

    const handleBusinessLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusinessData({
                    ...businessData,
                    settings: { ...businessData.settings, logo: reader.result as string }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const isUnlocked = (id: number) => {
        const tmpl = TEMPLATES.find(t => t.id === id);
        if (tmpl?.price === 0) return true;
        if (user?.isPremium) return true; // Premium users get all templates
        return user?.unlockedTemplates?.includes(id);
    };

    const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
        if (isUnlocked(template.id)) {
            setInvoiceTemplateId(template.id);
        } else {
            setPurchaseModal({ show: true, template });
        }
    };

    const handleToggle2fa = async () => {
        if (user?.twoFactorEnabled) {
            if (confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.")) {
                await disable2fa();
                alert("2FA has been disabled.");
            }
        } else {
            const data = await initiate2faSetup();
            setTwoFactorData(data);
            setShow2faSetup(true);
        }
    };

    const handleVerifyAndEnable2fa = async () => {
        setIsVerifying2fa(true);
        const success = await verifyAndEnable2fa(twoFactorOtp);
        if (success) {
            alert("Two-Factor Authentication has been enabled successfully!");
            setShow2faSetup(false);
            setTwoFactorOtp('');
        } else {
            alert("Invalid verification code. Please try again.");
        }
        setIsVerifying2fa(false);
    };

    const handlePurchase = async () => {
        if (!purchaseModal.template) return;
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        unlockTemplate(purchaseModal.template.id);
        setInvoiceTemplateId(purchaseModal.template.id); // Auto select after buy
        setIsProcessing(false);
        setPurchaseModal({ show: false, template: null });
        alert(`${purchaseModal.template.name} Unlocked Successfully!`);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setShowVerificationModal(true);
    };

    const verifyAndChangePassword = () => {
        if (verificationCode === '1234') { // Mock code
            alert("Password Changed Successfully!");
            setShowVerificationModal(false);
            setNewPassword('');
            setVerificationCode('');
        } else {
            alert("Invalid verification code sent to your email.");
        }
    };

    const handleColorChange = (color: string) => {
        if (!user?.isPremium) {
            alert("Custom branding is a Premium feature. Please upgrade to Pro.");
            return;
        }
        setBrandColor(color);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setInvoiceConfig({ ...invoiceConfig, logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Dummy data for preview
    const dummyInvoice: LedgerEntry = {
        id: 'PREVIEW-001',
        date: new Date().toISOString().split('T')[0],
        entityName: 'John Doe Client',
        entityMobile: '0123456789',
        entityAddress: '123 Demo St, Preview City',
        type: 'Sale',
        amount: 2500,
        paymentMethod: 'Cash',
        reference: 'INV-DEMO',
        items: [
            { productId: '1', name: 'Premium Service', qty: 1, price: 1500, total: 1500 },
            { productId: '2', name: 'Standard Product', qty: 2, price: 500, total: 1000 }
        ],
        details: { subtotal: 2500, tax: 0, discount: 0, delivery: 0 }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">{t('Settings')}</h1>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
                {[
                    { id: 'profile', icon: User, label: t('Profile') },
                    { id: 'appearance', icon: Palette, label: t('Appearance') },
                    { id: 'business', icon: Briefcase, label: t('Business') },
                    { id: 'templates', icon: FileText, label: t('Templates') },
                    { id: 'security', icon: Shield, label: t('Security') },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                
                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSave} className="max-w-2xl space-y-5">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-start gap-3">
                            <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-800">{t('Account Security')}</p>
                                <p className="text-xs text-yellow-700 mt-1">{t('Mobile number and Email address cannot be changed for security reasons.')}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Name')}</label>
                            <input type="text" value={profileData.businessName} onChange={e => setProfileData({...profileData, businessName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Type')}</label>
                                <select value={profileData.businessType} onChange={e => setProfileData({...profileData, businessType: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option>Retail</option>
                                    <option>Wholesale</option>
                                    <option>Service</option>
                                    <option>Manufacturing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Number of Locations')}</label>
                                <input type="number" value={profileData.locationCount} onChange={e => setProfileData({...profileData, locationCount: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Location / Address')}</label>
                            <input type="text" value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                        </div>
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" /> {t('Save Changes')}
                        </button>
                    </form>
                )}

                {/* --- APPEARANCE TAB --- */}
                {activeTab === 'appearance' && (
                    <div className="max-w-4xl">
                        {/* Theme Mode */}
                        <div className="mb-10">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-slate-500" /> {t('Interface Theme')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => setThemeMode('light')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${themeMode === 'light' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="w-full h-24 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col p-2 overflow-hidden">
                                        <div className="h-2 w-1/2 bg-slate-200 rounded mb-2"></div>
                                        <div className="flex-1 bg-slate-50 rounded"></div>
                                    </div>
                                    <span className={`font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-indigo-700' : 'text-slate-600'}`}>
                                        <Sun className="w-4 h-4" /> {t('Light Mode')}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => setThemeMode('dark')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${themeMode === 'dark' ? 'border-indigo-600 bg-slate-800' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="w-full h-24 bg-slate-900 rounded-lg border border-slate-700 shadow-sm flex flex-col p-2 overflow-hidden">
                                        <div className="h-2 w-1/2 bg-slate-700 rounded mb-2"></div>
                                        <div className="flex-1 bg-slate-800 rounded"></div>
                                    </div>
                                    <span className={`font-bold flex items-center gap-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-600'}`}>
                                        <Moon className="w-4 h-4" /> {t('Dark Mode')}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => setThemeMode('system')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${themeMode === 'system' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="w-full h-24 bg-gradient-to-r from-white to-slate-900 rounded-lg border border-slate-200 shadow-sm flex flex-col p-2 overflow-hidden opacity-80">
                                    </div>
                                    <span className={`font-bold flex items-center gap-2 ${themeMode === 'system' ? 'text-indigo-700' : 'text-slate-600'}`}>
                                        <Monitor className="w-4 h-4" /> {t('System Default')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Brand Color (Premium) */}
                        <div className="border-t border-slate-100 pt-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-slate-500" /> {t('Custom Brand Theme')}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">{t('Customize the primary color to match your brand identity.')}</p>
                                </div>
                                {!user?.isPremium && (
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200">
                                        <Crown className="w-3 h-3" /> {t('Premium Feature')}
                                    </span>
                                )}
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${!user?.isPremium ? 'opacity-60 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-3 block">{t('Preset Palettes')}</label>
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color.value}
                                                onClick={() => handleColorChange(color.value)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${brandColor === color.value ? 'border-slate-800 ring-1 ring-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: color.value }}></div>
                                                <span className="text-xs font-medium text-slate-700">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <label className="text-sm font-bold text-slate-700 mb-3 block">{t('Custom Hex Color')}</label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: brandColor }}></div>
                                        <input 
                                            type="text" 
                                            value={brandColor}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            className="uppercase font-mono border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 outline-none w-32"
                                            maxLength={7}
                                        />
                                        <input 
                                            type="color" 
                                            value={brandColor}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Live Preview Card */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-center">
                                    <div className="bg-white w-64 rounded-xl shadow-lg overflow-hidden">
                                        <div className="h-24 p-4 text-white flex flex-col justify-between" style={{ backgroundColor: brandColor }}>
                                            <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                                            <div>
                                                <div className="w-24 h-2 bg-white/80 rounded mb-1"></div>
                                                <div className="w-16 h-2 bg-white/50 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-8 rounded bg-slate-100"></div>
                                                <div className="w-8 h-8 rounded" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}></div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded"></div>
                                            <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                                            <button className="w-full py-2 rounded text-xs font-bold text-white mt-2" style={{ backgroundColor: brandColor }}>
                                                Preview Button
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- BUSINESS TAB --- */}
                {activeTab === 'business' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-4">
                                {['general', 'stores', 'tax', 'hours', 'notifications', 'localization'].map((sub) => (
                                    <button
                                        key={sub}
                                        onClick={() => setBusinessSubTab(sub as any)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${businessSubTab === sub ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {t(sub)}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setIsAddingBusiness(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> {t('Add Business')}
                            </button>
                        </div>

                        {/* Sub-Tab: General Profile */}
                        {businessSubTab === 'general' && (
                            <form onSubmit={handleBusinessSave} className="space-y-6 max-w-3xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Name')}</label>
                                            <input 
                                                type="text" 
                                                value={businessData.name || ''} 
                                                onChange={e => setBusinessData({...businessData, name: e.target.value})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Category')}</label>
                                            <select 
                                                value={businessData.settings?.category || ''} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, category: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value="Retail">Retail</option>
                                                <option value="Wholesale">Wholesale</option>
                                                <option value="Restaurant">Restaurant / Cafe</option>
                                                <option value="Pharmacy">Pharmacy</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Fashion">Fashion & Apparel</option>
                                                <option value="Service">Service Provider</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Timezone')}</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select 
                                                    value={businessData.settings?.timezone || 'UTC'} 
                                                    onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, timezone: e.target.value}})} 
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                                >
                                                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                                                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                                                    <option value="America/New_York">America/New_York (EST)</option>
                                                    <option value="Europe/London">Europe/London (GMT)</option>
                                                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Logo')}</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden relative bg-slate-50 hover:bg-white transition-colors group">
                                                {businessData.settings?.logo ? (
                                                    <img src={businessData.settings.logo} alt="Logo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-indigo-500" />
                                                )}
                                                <input type="file" accept="image/*" onChange={handleBusinessLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                <p>Upload your official logo.</p>
                                                <p>Recommended: 512x512px</p>
                                                {businessData.settings?.logo && (
                                                    <button type="button" onClick={() => setBusinessData({...businessData, settings: {...businessData.settings, logo: undefined}})} className="text-red-600 hover:underline mt-2 font-bold">Remove Logo</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-500" /> {t('Contact Information')}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Email Address')}</label>
                                            <input 
                                                type="email" 
                                                value={businessData.settings?.contactEmail || ''} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, contactEmail: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="info@business.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Phone Number')}</label>
                                            <input 
                                                type="text" 
                                                value={businessData.settings?.contactPhone || ''} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, contactPhone: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Website')}</label>
                                            <input 
                                                type="text" 
                                                value={businessData.settings?.website || ''} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, website: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="https://www.business.com"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Business Address')}</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <textarea 
                                                    value={businessData.location || ''} 
                                                    onChange={e => setBusinessData({...businessData, location: e.target.value})} 
                                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                                    placeholder="Enter full physical address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                                        <Save className="w-4 h-4" /> {t('Save Business Profile')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Sub-Tab: Stores & Branches */}
                        {businessSubTab === 'stores' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{t('Stores & Branches')}</h3>
                                        <p className="text-sm text-slate-500">Manage your physical outlets and warehouse locations.</p>
                                    </div>
                                    <button 
                                        onClick={() => { setEditingStore(null); setShowStoreModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> {t('Add New Store')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {stores.map(store => (
                                        <div key={store.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Store className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => { setEditingStore(store); setStoreFormData(store as any); setShowStoreModal(true); }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                                                    >
                                                        <PenTool className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteStore(store.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                {store.name}
                                                {store.isHeadOffice && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-bold">HQ</span>}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3" /> {store.location}
                                            </p>
                                            {store.phone && (
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3" /> {store.phone}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sub-Tab: Tax & Invoicing */}
                        {businessSubTab === 'tax' && (
                            <form onSubmit={handleBusinessSave} className="space-y-8 max-w-2xl">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Percent className="w-5 h-5 text-slate-500" /> {t('Tax Settings')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Tax Identification Number')}</label>
                                            <input 
                                                type="text" 
                                                value={businessData.settings?.taxNumber || ''} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, taxNumber: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="VAT / GST / TIN"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Default Tax Rate (%)')}</label>
                                            <input 
                                                type="number" 
                                                value={businessData.settings?.taxRate || 0} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, taxRate: parseFloat(e.target.value)}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-8">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-slate-500" /> {t('Invoice Settings')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Invoice Prefix')}</label>
                                            <input 
                                                type="text" 
                                                value={businessData.settings?.invoicePrefix || 'INV-'} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, invoicePrefix: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Default Currency')}</label>
                                            <select 
                                                value={businessData.settings?.currency || currency} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, currency: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                {Object.values(Currency).map(c => (
                                                    <option key={c} value={c}>{CURRENCY_SYMBOLS[c] || c} {c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Invoice Footer Text')}</label>
                                            <textarea 
                                                value={businessData.settings?.invoiceFooter || ''} 
                                                onChange={e => setBusinessData({...businessData, settings: {...businessData.settings, invoiceFooter: e.target.value}})} 
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                                placeholder="Terms and conditions, bank details, etc."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                        {t('Save Financial Settings')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Sub-Tab: Working Hours */}
                        {businessSubTab === 'hours' && (
                            <form onSubmit={handleBusinessSave} className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-slate-500" /> {t('Business Working Hours')}
                                    </h3>
                                    <div className="space-y-3">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                            const dayData = businessData.settings?.workingHours?.[day] || { open: '09:00', close: '17:00', closed: false };
                                            return (
                                                <div key={day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <span className="w-24 font-bold text-slate-700 capitalize">{day}</span>
                                                    <div className="flex items-center gap-4">
                                                        {!dayData.closed ? (
                                                            <>
                                                                <input 
                                                                    type="time" 
                                                                    value={dayData.open} 
                                                                    onChange={e => setBusinessData({
                                                                        ...businessData, 
                                                                        settings: {
                                                                            ...businessData.settings,
                                                                            workingHours: {
                                                                                ...businessData.settings?.workingHours,
                                                                                [day]: { ...dayData, open: e.target.value }
                                                                            }
                                                                        }
                                                                    })}
                                                                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                                                                />
                                                                <span className="text-slate-400">to</span>
                                                                <input 
                                                                    type="time" 
                                                                    value={dayData.close} 
                                                                    onChange={e => setBusinessData({
                                                                        ...businessData, 
                                                                        settings: {
                                                                            ...businessData.settings,
                                                                            workingHours: {
                                                                                ...businessData.settings?.workingHours,
                                                                                [day]: { ...dayData, close: e.target.value }
                                                                            }
                                                                        }
                                                                    })}
                                                                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                                                                />
                                                            </>
                                                        ) : (
                                                            <span className="text-red-500 font-bold text-sm uppercase px-10">Closed</span>
                                                        )}
                                                        <button 
                                                            type="button"
                                                            onClick={() => setBusinessData({
                                                                ...businessData, 
                                                                settings: {
                                                                    ...businessData.settings,
                                                                    workingHours: {
                                                                        ...businessData.settings?.workingHours,
                                                                        [day]: { ...dayData, closed: !dayData.closed }
                                                                    }
                                                                }
                                                            })}
                                                            className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${dayData.closed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
                                                        >
                                                            {dayData.closed ? 'Open' : 'Close'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                        {t('Save Working Hours')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Sub-Tab: Notifications & Templates */}
                        {businessSubTab === 'notifications' && (
                            <div className="space-y-8 max-w-3xl">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <MailIcon className="w-5 h-5 text-slate-500" /> {t('Email Templates')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['welcome', 'invoice', 'receipt'].map(type => (
                                            <div key={type} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-bold text-slate-700 capitalize">{type} Email</h4>
                                                    <button className="text-xs text-indigo-600 font-bold hover:underline">Edit Template</button>
                                                </div>
                                                <p className="text-xs text-slate-500">Sent automatically when {type === 'welcome' ? 'a new user joins' : `a ${type} is generated`}.</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-slate-500" /> {t('SMS Notification Setup')}
                                        </h3>
                                        <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer ${businessData.settings?.smsSettings?.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`} onClick={() => setBusinessData({...businessData, settings: {...businessData.settings, smsSettings: {...businessData.settings?.smsSettings, enabled: !businessData.settings?.smsSettings?.enabled}}})}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${businessData.settings?.smsSettings?.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                    
                                    <div className={`grid grid-cols-2 gap-4 ${!businessData.settings?.smsSettings?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('SMS Provider')}</label>
                                            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white">
                                                <option>Twilio</option>
                                                <option>Vonage</option>
                                                <option>MessageBird</option>
                                                <option>BulkSMS</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('API Key / Token')}</label>
                                            <input type="password" value="••••••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50" readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {businessSubTab === 'localization' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-slate-500" /> {t('Formatting & Localization')}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('App Language')}</label>
                                            <select 
                                                value={language} 
                                                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                {Object.entries(AppLanguage).map(([key, value]) => (
                                                    <option key={value} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Currency')}</label>
                                            <select 
                                                value={currency} 
                                                onChange={(e) => setCurrency(e.target.value as Currency)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                {Object.values(Currency).map(c => <option key={c} value={c}>{CURRENCY_SYMBOLS[c] || c} {c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('Decimal Places')}</label>
                                            <select 
                                                value={decimalPlaces} 
                                                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value={0}>0 (e.g. $100)</option>
                                                <option value={1}>1 (e.g. $100.0)</option>
                                                <option value={2}>2 (e.g. $100.00)</option>
                                                <option value={3}>3 (e.g. $100.000)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TEMPLATES TAB --- */}
                {activeTab === 'templates' && (
                    <div className="space-y-8">
                        {/* Select Design */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">{t('Select Invoice Design')}</h3>
                                    <p className="text-sm text-slate-500">This template will be applied to all your invoices.</p>
                                </div>
                                <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                                    Current: Template {invoiceTemplateId}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {TEMPLATES.map((tmpl) => {
                                    const unlocked = isUnlocked(tmpl.id);
                                    return (
                                        <div key={tmpl.id} onClick={() => handleTemplateClick(tmpl)} className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${invoiceTemplateId === tmpl.id ? 'ring-2 ring-indigo-600 ring-offset-2' : 'border border-slate-200'}`}>
                                            <div className="aspect-[3/4] bg-slate-50 relative">
                                                <MiniInvoice id={tmpl.id} />
                                                {!unlocked && (
                                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white transition-opacity group-hover:bg-slate-900/50">
                                                        <div className="p-3 bg-slate-900 rounded-full shadow-lg mb-2"><Lock className="w-5 h-5" /></div>
                                                        <span className="font-bold text-lg">{formatMoney(tmpl.price)}</span>
                                                        <span className="text-xs uppercase font-medium tracking-wide mt-1">Unlock</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`p-3 text-center text-sm font-medium ${invoiceTemplateId === tmpl.id ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700'}`}>{tmpl.name}</div>
                                            {invoiceTemplateId === tmpl.id && <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-sm z-10"><CheckCircle className="w-3 h-3" /></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Customize Design Section - LOCKED FOR NON-PREMIUM */}
                        <div className={`border-t border-slate-100 pt-8 relative ${!user?.isPremium ? 'opacity-60 pointer-events-none' : ''}`}>
                            {!user?.isPremium && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                     <div className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-3 border border-slate-700 animate-in zoom-in duration-300">
                                        <Crown className="w-5 h-5 text-yellow-400" /> 
                                        <span>Unlock Customization with Premium</span>
                                     </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <PenTool className="w-5 h-5 text-indigo-600" /> {t('Customize Design')}
                                </h3>
                                <button 
                                    onClick={() => setShowInvoicePreview(true)}
                                    className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors pointer-events-auto" // Preview remains clickable even if section locked? Usually not, but let's keep it consistent with the lock.
                                    disabled={!user?.isPremium}
                                >
                                    <Eye className="w-4 h-4" /> {t('Preview Invoice')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('Business Logo')}</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden relative bg-slate-50 hover:bg-white transition-colors group">
                                                {invoiceConfig.logo ? (
                                                    <img src={invoiceConfig.logo} alt="Logo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                                                )}
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                <p>Upload a clear PNG or JPG.</p>
                                                {invoiceConfig.logo && (
                                                    <button onClick={() => setInvoiceConfig({ ...invoiceConfig, logo: undefined })} className="text-red-600 hover:underline mt-1 text-xs font-bold">Remove Logo</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-200 transition-colors">
                                            <span className="text-sm font-medium text-slate-700">{t('Show Authorised Signature Line')}</span>
                                            <div onClick={(e) => { e.preventDefault(); setInvoiceConfig({...invoiceConfig, showSignature: !invoiceConfig.showSignature}); }} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${invoiceConfig.showSignature ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${invoiceConfig.showSignature ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-200 transition-colors">
                                            <span className="text-sm font-medium text-slate-700">{t('Show Business Seal / Stamp Placeholder')}</span>
                                            <div onClick={(e) => { e.preventDefault(); setInvoiceConfig({...invoiceConfig, showSeal: !invoiceConfig.showSeal}); }} className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${invoiceConfig.showSeal ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${invoiceConfig.showSeal ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Footer Note */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('Footer Note / Terms')}</label>
                                        <textarea 
                                            value={invoiceConfig.footerNote}
                                            onChange={(e) => setInvoiceConfig({...invoiceConfig, footerNote: e.target.value})}
                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                                            placeholder="e.g. Thank you for your business! Payment due in 30 days."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <div className="max-w-2xl space-y-8">
                        <form onSubmit={handlePasswordChange} className="space-y-4 border-b border-slate-100 pb-8">
                            <h3 className="font-bold text-slate-800">{t('Change Password')}</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('New Password')}</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required minLength={6} />
                            </div>
                            <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">{t('Update Password')}</button>
                        </form>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500"/> {t('Two-Factor Authentication')}</h3>
                                <p className="text-sm text-slate-500">{t('Enable 2FA for extra security. You will need to enter a code from your authenticator app when logging in.')}</p>
                            </div>
                            <button 
                                onClick={handleToggle2fa} 
                                className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${user?.twoFactorEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>

                        {/* Active Sessions */}
                        <div className="border-b border-slate-100 pb-8">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-indigo-600" /> {t('Active Sessions')}
                            </h3>
                            <div className="space-y-3">
                                {sessions.map(session => (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                {session.device.toLowerCase().includes('mobile') ? <Smartphone className="w-5 h-5 text-slate-600" /> : <Laptop className="w-5 h-5 text-slate-600" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{session.device} {session.isCurrent && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Current</span>}</p>
                                                <p className="text-xs text-slate-500">{session.location} • {session.ip}</p>
                                            </div>
                                        </div>
                                        {!session.isCurrent && (
                                            <button 
                                                onClick={() => terminateSession(session.id)}
                                                className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Terminate
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trusted Devices */}
                        <div className="border-b border-slate-100 pb-8">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-indigo-600" /> {t('Trusted Devices')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {devices.map(device => (
                                    <div key={device.id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                {device.type === 'MOBILE' ? <Smartphone className="w-5 h-5 text-slate-500" /> : <Laptop className="w-5 h-5 text-slate-500" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{device.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-medium">Last used: {new Date(device.lastUsed).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeDevice(device.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Login History */}
                        <div className="border-b border-slate-100 pb-8">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-indigo-600" /> {t('Login History')}
                            </h3>
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-bold text-slate-700">Time</th>
                                            <th className="px-4 py-3 font-bold text-slate-700">Device</th>
                                            <th className="px-4 py-3 font-bold text-slate-700">Method</th>
                                            <th className="px-4 py-3 font-bold text-slate-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loginHistory.map(entry => (
                                            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-600 text-xs">{new Date(entry.timestamp).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-slate-800 font-medium">{entry.device}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{entry.method}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${entry.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Security Alerts / Activity Log */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-indigo-600" /> {t('Security Alerts & Activity')}
                            </h3>
                            <div className="space-y-3">
                                {activityLogs.filter(log => log.module === 'Security' || log.module === 'Auth').slice(0, 5).map(log => (
                                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className={`p-1.5 rounded-full mt-0.5 ${log.action.includes('Login') ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            <Shield className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                            <p className="text-xs text-slate-500">{log.details || log.module}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {activityLogs.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 italic text-sm">
                                        No security activity recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            
            {/* Add/Edit Store Modal */}
            {showStoreModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingStore ? t('Edit Store') : t('Add New Store')}</h3>
                            <button onClick={() => setShowStoreModal(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleStoreSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Store Name')}</label>
                                <input 
                                    type="text" 
                                    value={storeFormData.name} 
                                    onChange={e => setStoreFormData({...storeFormData, name: e.target.value})} 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Downtown Branch"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Location / Address')}</label>
                                <input 
                                    type="text" 
                                    value={storeFormData.location} 
                                    onChange={e => setStoreFormData({...storeFormData, location: e.target.value})} 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="123 Street, City"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Phone Number')}</label>
                                <input 
                                    type="text" 
                                    value={storeFormData.phone} 
                                    onChange={e => setStoreFormData({...storeFormData, phone: e.target.value})} 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={storeFormData.isHeadOffice} 
                                    onChange={e => setStoreFormData({...storeFormData, isHeadOffice: e.target.checked})}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm font-medium text-slate-700">{t('Set as Head Office')}</span>
                            </label>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    {t('Cancel')}
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                    {editingStore ? t('Update Store') : t('Save Store')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Business Modal */}
            {isAddingBusiness && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{t('Add New Business')}</h3>
                            <button onClick={() => setIsAddingBusiness(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddBusiness} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('Business Name')}</label>
                                <input 
                                    type="text" 
                                    value={newBusinessName} 
                                    onChange={e => setNewBusinessName(e.target.value)} 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Enter business name"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                Adding a new business allows you to manage separate entities with their own stores, products, and ledgers.
                            </p>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddingBusiness(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    {t('Cancel')}
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                                    {t('Create Business')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2faSetup && twoFactorData && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Shield className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">Setup 2FA</h3>
                            </div>
                            <button onClick={() => setShow2faSetup(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400"/>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-4">Scan this QR code with your authenticator app (like Google Authenticator or Authy).</p>
                                <div className="bg-white p-4 border-2 border-slate-100 rounded-xl inline-block shadow-sm">
                                    <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-48 h-48" referrerPolicy="no-referrer" />
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Or enter this secret key manually</p>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                                    <code className="text-sm font-mono font-bold text-slate-700">{twoFactorData.secret}</code>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(twoFactorData.secret);
                                            alert("Secret key copied to clipboard!");
                                        }}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Enter the 6-digit code from your app</label>
                                <input 
                                    type="text" 
                                    value={twoFactorOtp} 
                                    onChange={e => setTwoFactorOtp(e.target.value)} 
                                    placeholder="000000"
                                    className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-slate-200 rounded-xl mb-6 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                    maxLength={6}
                                />
                                <button 
                                    onClick={handleVerifyAndEnable2fa} 
                                    disabled={isVerifying2fa || twoFactorOtp.length < 4}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    {isVerifying2fa ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Enable 2FA"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">{t('Verify Identity')}</h3>
                            <button onClick={() => setShowVerificationModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">We sent a 4-digit code to {user?.email}. Enter it below to change your password.</p>
                        <input 
                            type="text" 
                            value={verificationCode} 
                            onChange={e => setVerificationCode(e.target.value)} 
                            placeholder="e.g. 1234"
                            className="w-full text-center text-2xl tracking-widest font-bold py-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                            maxLength={4}
                        />
                        <button onClick={verifyAndChangePassword} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">Verify & Save</button>
                    </div>
                </div>
            )}

            {/* Purchase Modal */}
            {purchaseModal.show && purchaseModal.template && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
                            <div className="relative z-10 text-white text-center">
                                <Crown className="w-10 h-10 mx-auto mb-2 opacity-90" />
                                <h3 className="font-bold text-xl">{purchaseModal.template.name}</h3>
                            </div>
                            <button onClick={() => setPurchaseModal({ show: false, template: null })} className="absolute top-3 right-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-slate-500 text-sm mb-4">Unlock permanently.</p>
                            <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg text-2xl font-bold text-slate-800">{formatMoney(purchaseModal.template.price)}</div>
                            <button onClick={handlePurchase} disabled={isProcessing} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold mt-6 flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('Buy Now')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Preview Modal */}
            {showInvoicePreview && (
                <InvoiceTemplate 
                    data={dummyInvoice} 
                    onClose={() => setShowInvoicePreview(false)} 
                />
            )}
        </div>
    );
};

export default SettingsPage;
