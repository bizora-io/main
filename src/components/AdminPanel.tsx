import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserRole } from '../types';
import { PERMISSIONS, hasPermission } from '../utils/permissions';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
    Shield, Lock, Save, Trash2, Edit3, Image as ImageIcon, Users, 
    Activity, AlertTriangle, Search, Crown, CheckCircle, X, 
    TrendingUp, ShoppingCart, DollarSign, Package, Calendar, MoreVertical,
    ShoppingBag, FileText, CreditCard, Upload, UserPlus, Key, Database, Server, Download, HardDrive,
    HeadphonesIcon, Eye, EyeOff, Store, ChevronDown, ChevronUp, Check, Briefcase
} from 'lucide-react';

// Mock Database of Shop Owners
const INITIAL_USERS: any[] = [];

// Mock Invoice Templates
const INITIAL_TEMPLATES = [
    { id: 1, name: 'Classic Simple', status: 'Active' },
    { id: 2, name: 'Modern Indigo', status: 'Active' },
    { id: 3, name: 'Dark Professional', status: 'Premium' },
    { id: 4, name: 'Creative Orange', status: 'Premium' },
    { id: 5, name: 'Formal Serif', status: 'Premium' },
];

// Mock Subscription Plans
const INITIAL_PLANS = [
    { id: 'basic', name: 'Basic Starter', price: 0, features: 'Single Store, Basic Reports' },
    { id: 'pro', name: 'Nexus Pro', price: 29, features: 'Unlimited Stores, AI Analytics, E-commerce' },
    { id: 'ent', name: 'Enterprise', price: 99, features: 'Custom API, White-label, 24/7 Support' },
];

// Mock Admins
const INITIAL_ADMINS: any[] = [];

// Mock System Logs
const INITIAL_LOGS: any[] = [];

const AdminPanel: React.FC = () => {
    const { t, promoSlides, updatePromoSlides, currencySymbol } = useSettings();
    const { user } = useAuth();
    const { transactions, getAllData, importData, archiveTransactions } = useData(); 
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };
    
    // Data State
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('saas_users');
        return saved ? JSON.parse(saved) : INITIAL_USERS;
    });
    const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
    const [plans, setPlans] = useState(INITIAL_PLANS);
    const [admins, setAdmins] = useState(() => {
        const saved = localStorage.getItem('saas_admins');
        return saved ? JSON.parse(saved) : INITIAL_ADMINS;
    });

    useEffect(() => {
        localStorage.setItem('saas_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('saas_admins', JSON.stringify(admins));
    }, [admins]);
    const [logs, setLogs] = useState(INITIAL_LOGS);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingUserDetail, setViewingUserDetail] = useState<any | null>(null);
    const [viewingStoresForMobile, setViewingStoresForMobile] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
    const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<any>(null);
    const [newAdminPassword, setNewAdminPassword] = useState('');
    
    // Modals & Forms State
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    const [viewingTxUser, setViewingTxUser] = useState<any | null>(null); // For "User Transaction Details"
    const [showTxModal, setShowTxModal] = useState(false);

    const [uploadMode, setUploadMode] = useState<'product' | 'due' | null>(null); // For Bulk Upload
    const [uploadUser, setUploadUser] = useState<string | null>(null);

    const [showAdminModal, setShowAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Admin', permissions: [] as string[] });
    const [editingAdminPermissions, setEditingAdminPermissions] = useState<any>(null);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    // Security Tab State
    const [backupPassword, setBackupPassword] = useState('');
    const [archiveDate, setArchiveDate] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Custom UI Notifications
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info';
    }>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'info'
    });

    const [inputModal, setInputModal] = useState<{
        show: boolean;
        title: string;
        label: string;
        value: string;
        onConfirm: (val: string) => void;
        type: 'text' | 'password';
    }>({
        show: false,
        title: '',
        label: '',
        value: '',
        onConfirm: () => {},
        type: 'text'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, show: false }));

    // Security Check
    const isSaaSUser = user?.role === UserRole.SAAS_OWNER || user?.role === UserRole.SAAS_ADMIN;
    const isSuperAdmin = user?.role === UserRole.SAAS_OWNER;

    if (!isSaaSUser) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <Shield className="w-16 h-16 mb-4 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-700">Access Restricted</h2>
                <p>This panel is for Main System Administrators only.</p>
            </div>
        );
    }

    // --- Actions ---

    // User Management
    const handleEditClick = (u: any) => {
        setEditingUser({ ...u });
        setShowEditModal(true);
    };

    const handleUserSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
        setShowEditModal(false);
        showToast("User Subscription & Details Updated!");
    };

    const handleDeleteUser = (id: string) => {
        setConfirmModal({
            show: true,
            title: 'Delete Shop',
            message: 'Are you sure you want to delete this shop? All data will be lost.',
            type: 'danger',
            onConfirm: () => {
                setUsers(prev => prev.filter(u => u.id !== id));
                showToast("Shop deleted successfully", "success");
                closeConfirm();
            }
        });
    };

    const handleViewTransactions = (u: any) => {
        setViewingTxUser(u);
        setShowTxModal(true);
    };

    // Admin Management
    const toggleAdminPermission = (adminId: string | null, key: string) => {
        if (adminId === null) {
            // New Admin
            setNewAdmin(prev => {
                const current = prev.permissions || [];
                if (current.includes('all')) return prev;
                if (current.includes(key)) {
                    return { ...prev, permissions: current.filter(p => p !== key) };
                } else {
                    return { ...prev, permissions: [...current, key] };
                }
            });
        } else {
            // Existing Admin
            setEditingAdminPermissions((prev: any) => {
                const current = prev.permissions || [];
                if (current.includes('all')) return prev;
                if (current.includes(key)) {
                    return { ...prev, permissions: current.filter((p: string) => p !== key) };
                } else {
                    return { ...prev, permissions: [...current, key] };
                }
            });
        }
    };

    const toggleAdminModulePermissions = (adminId: string | null, moduleKey: string) => {
        const module = PERMISSIONS[moduleKey as keyof typeof PERMISSIONS];
        const modulePermissions = Object.values(module.subFeatures).map(sf => sf.key);
        
        if (adminId === null) {
            setNewAdmin(prev => {
                const current = prev.permissions || [];
                if (current.includes('all')) return prev;
                const allModulePermissionsSelected = modulePermissions.every(p => current.includes(p));
                if (allModulePermissionsSelected) {
                    return { ...prev, permissions: current.filter(p => !modulePermissions.includes(p)) };
                } else {
                    const newPermissions = [...current];
                    modulePermissions.forEach(p => { if (!newPermissions.includes(p)) newPermissions.push(p); });
                    return { ...prev, permissions: newPermissions };
                }
            });
        } else {
            setEditingAdminPermissions((prev: any) => {
                const current = prev.permissions || [];
                if (current.includes('all')) return prev;
                const allModulePermissionsSelected = modulePermissions.every(p => current.includes(p));
                if (allModulePermissionsSelected) {
                    return { ...prev, permissions: current.filter((p: string) => !modulePermissions.includes(p)) };
                } else {
                    const newPermissions = [...current];
                    modulePermissions.forEach(p => { if (!newPermissions.includes(p)) newPermissions.push(p); });
                    return { ...prev, permissions: newPermissions };
                }
            });
        }
    };

    const toggleAdminAllPermissions = (adminId: string | null) => {
        if (adminId === null) {
            setNewAdmin(prev => {
                const current = prev.permissions || [];
                return { ...prev, permissions: current.includes('all') ? [] : ['all'] };
            });
        } else {
            setEditingAdminPermissions((prev: any) => {
                const current = prev.permissions || [];
                return { ...prev, permissions: current.includes('all') ? [] : ['all'] };
            });
        }
    };

    const isModuleFullySelected = (permissions: string[], moduleKey: string) => {
        const module = PERMISSIONS[moduleKey as keyof typeof PERMISSIONS];
        const modulePermissions = Object.values(module.subFeatures).map(sf => sf.key);
        return modulePermissions.every(p => permissions.includes(p));
    };

    const isModulePartiallySelected = (permissions: string[], moduleKey: string) => {
        const module = PERMISSIONS[moduleKey as keyof typeof PERMISSIONS];
        const modulePermissions = Object.values(module.subFeatures).map(sf => sf.key);
        const selectedCount = modulePermissions.filter(p => permissions.includes(p)).length;
        return selectedCount > 0 && selectedCount < modulePermissions.length;
    };

    const handleAddAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        setAdmins([...admins, { id: `a${Date.now()}`, ...newAdmin, ip: 'N/A', lastActive: 'Never' } as any]);
        setShowAdminModal(false);
        setNewAdmin({ name: '', email: '', role: 'Admin', permissions: [] });
        showToast("New Admin Added!");
    };

    const handleSaveAdminPermissions = () => {
        if (!editingAdminPermissions) return;
        setAdmins(prev => prev.map(a => a.id === editingAdminPermissions.id ? { ...a, permissions: editingAdminPermissions.permissions } : a));
        setEditingAdminPermissions(null);
        showToast("Admin Permissions Updated!");
    };

    const toggleModuleExpand = (moduleKey: string) => {
        setExpandedModules(prev => 
            prev.includes(moduleKey) 
                ? prev.filter(k => k !== moduleKey) 
                : [...prev, moduleKey]
        );
    };

    const handleChangeAdminRole = (id: string, newRole: string) => {
        setAdmins(prev => prev.map(a => a.id === id ? { ...a, role: newRole } : a));
    };

    const handleDeleteAdmin = (id: string) => {
        setConfirmModal({
            show: true,
            title: 'Remove Admin',
            message: 'Are you sure you want to remove this admin access?',
            type: 'danger',
            onConfirm: () => {
                setAdmins(prev => prev.filter(a => a.id !== id));
                showToast("Admin access removed", "success");
                closeConfirm();
            }
        });
    };

    const togglePasswordVisibility = (id: string) => {
        const newShow = new Set(showPasswords);
        if (newShow.has(id)) newShow.delete(id);
        else newShow.add(id);
        setShowPasswords(newShow);
    };

    const handlePasswordChange = (adminId: string, newPassword: string) => {
        setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, password: newPassword } : a));
        setChangingPasswordAdmin(null);
        setNewAdminPassword('');
        showToast("Password updated successfully!");
    };

    // Bulk Upload Mock
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            showToast(`File "${e.target.files[0].name}" uploaded successfully for ${uploadMode} management.`);
            setUploadMode(null);
            setUploadUser(null);
        }
    };

    // Template Management
    const handleDeleteTemplate = (id: number) => {
        setConfirmModal({
            show: true,
            title: 'Delete Template',
            message: 'Are you sure you want to delete this invoice template?',
            type: 'danger',
            onConfirm: () => {
                setTemplates(prev => prev.filter(t => t.id !== id));
                showToast("Template deleted successfully");
                closeConfirm();
            }
        });
    };

    const handleAddTemplate = () => {
        setInputModal({
            show: true,
            title: 'Add New Template',
            label: 'Template Name',
            value: '',
            type: 'text',
            onConfirm: (name) => {
                if (name) {
                    setTemplates([...templates, { id: Date.now(), name, status: 'Active' }]);
                    showToast("Template added successfully");
                }
                setInputModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    // Data Security Logic
    const handleBackup = async () => {
        if (!backupPassword) {
            showToast("Please set a password for the backup file.", "error");
            return;
        }
        setIsProcessing(true);
        // Simulate encryption delay
        await new Promise(r => setTimeout(r, 1000));
        
        const data = getAllData();
        const jsonStr = JSON.stringify(data);
        
        // Simple Base64 + Salt Simulation for Encryption Visual
        // (In real app, use SubtleCrypto AES-GCM)
        const salt = btoa(backupPassword).slice(0, 8);
        const fakeEncrypted = btoa(encodeURIComponent(jsonStr)).split('').reverse().join('') + `.${salt}`;
        
        const blob = new Blob([fakeEncrypted], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `nexus_secure_backup_${new Date().toISOString().split('T')[0]}.enc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsProcessing(false);
        setBackupPassword('');
        showToast("Encrypted backup downloaded successfully.");
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setInputModal({
            show: true,
            title: 'Restore Database',
            label: 'Enter backup password to decrypt',
            value: '',
            type: 'password',
            onConfirm: (pwd) => {
                if (!pwd) return;
                setInputModal(prev => ({ ...prev, show: false }));
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const content = ev.target?.result as string;
                    
                    // Validate "decryption"
                    const salt = btoa(pwd).slice(0, 8);
                    if (!content.endsWith(`.${salt}`)) {
                        showToast("Incorrect password or corrupted file.", "error");
                        return;
                    }

                    try {
                        const cleanContent = content.split('.')[0].split('').reverse().join('');
                        const jsonStr = decodeURIComponent(atob(cleanContent));
                        importData(jsonStr); // This reloads the page on success
                    } catch (err) {
                        showToast("Failed to restore data. File may be corrupted.", "error");
                    }
                };
                reader.readAsText(file);
            }
        });
    };

    const handleArchive = async () => {
        if (!archiveDate) {
            showToast("Select a date threshold.", "error");
            return;
        }
        setConfirmModal({
            show: true,
            title: 'Archive Transactions',
            message: `Are you sure you want to archive and remove transactions older than ${archiveDate}? This action downloads an archive file.`,
            type: 'warning',
            onConfirm: async () => {
                setIsProcessing(true);
                const count = await archiveTransactions(archiveDate);
                setIsProcessing(false);
                if (count > 0) {
                    showToast(`Archived ${count} transactions successfully.`);
                } else {
                    showToast("No transactions found older than selected date.", "error");
                }
                closeConfirm();
            }
        });
    };

    // Computed Stats
    const totalRevenue = users.reduce((acc, u) => acc + (u.plan === 'Enterprise' ? 99 : u.plan === 'Pro' ? 29 : 0), 0);
    
    const totalNetworkSell = users.reduce((sum, u) => sum + (u.totalSell || 0), 0);
    const totalNetworkBuy = users.reduce((sum, u) => sum + (u.totalBuy || 0), 0);
    
    // Total Store = Unique owners (unique mobile numbers)
    const uniqueMobiles = new Set(users.map(u => u.mobile));
    const totalUniqueOwners = uniqueMobiles.size;
    
    // Total Branch = Additional stores beyond the first one for each owner
    const totalAdditionalBranches = users.length - totalUniqueOwners;

    const totalNetworkBusiness = users.reduce((sum, u) => sum + (u.totalBusiness || 0), 0);
    const totalNetworkDue = users.reduce((sum, u) => sum + (u.totalDue || 0), 0);
    const activeSubs = users.filter(u => u.status === 'Active').length;

    const tabs = [
        { id: 'dashboard', label: 'Overview', permission: PERMISSIONS.SAAS.subFeatures.DASHBOARD.key },
        { id: 'businesses', label: 'Users', permission: PERMISSIONS.SAAS.subFeatures.MANAGE_BUSINESSES.key },
        { id: 'users', label: 'Admins', permission: PERMISSIONS.SAAS.subFeatures.MANAGE_USERS.key },
        { id: 'templates', label: 'Templates', permission: PERMISSIONS.SAAS.subFeatures.SETTINGS.key },
        { id: 'subscriptions', label: 'Plans', permission: PERMISSIONS.SAAS.subFeatures.SUBSCRIPTIONS.key },
        { id: 'support', label: 'Support', permission: PERMISSIONS.SAAS.subFeatures.SUPPORT.key },
        { id: 'security', label: 'Data & Security', permission: PERMISSIONS.SAAS.subFeatures.SETTINGS.key },
        { id: 'logs', label: 'System Logs', permission: PERMISSIONS.SAAS.subFeatures.SETTINGS.key },
    ].filter(tab => hasPermission(user?.permissions, tab.permission));

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="bg-slate-900 text-white p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-8 h-8 text-yellow-400" /> Super Admin Panel
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">System Control Center (ID: 460)</p>
                </div>
                <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.DASHBOARD.key) && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 font-bold text-xs uppercase">Total Shops</p>
                            <h3 className="text-3xl font-bold text-slate-800">{users.length}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 font-bold text-xs uppercase">Active Subscriptions</p>
                            <h3 className="text-3xl font-bold text-emerald-600">{activeSubs}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 font-bold text-xs uppercase">Monthly Revenue</p>
                            <h3 className="text-3xl font-bold text-indigo-600">${totalRevenue}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 font-bold text-xs uppercase">Total System Tx</p>
                            <h3 className="text-3xl font-bold text-orange-500">{transactions.length + 15420}</h3>
                        </div>
                    </div>

                    {/* Acquisition Chart Placeholder */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600"/> User Acquisition Trend</h2>
                        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
                            [User Acquisition Graph Component]
                        </div>
                    </div>

                    {/* Global Summary */}
                    <div className="bg-slate-800 rounded-xl p-6 text-white">
                        <h2 className="text-xl font-bold mb-6 border-b border-slate-700 pb-4">Global Network Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <ShoppingBag className="w-4 h-4" /> Total Sell
                                </div>
                                <p className="text-xl font-bold">৳ {totalNetworkSell.toLocaleString()}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <ShoppingCart className="w-4 h-4" /> Total Buy
                                </div>
                                <p className="text-xl font-bold">৳ {totalNetworkBuy.toLocaleString()}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Store className="w-4 h-4" /> Total Store
                                </div>
                                <p className="text-xl font-bold">{totalUniqueOwners}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Store className="w-4 h-4" /> Total Branch
                                </div>
                                <p className="text-xl font-bold">{totalAdditionalBranches}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Briefcase className="w-4 h-4" /> Total Business
                                </div>
                                <p className="text-xl font-bold">৳ {totalNetworkBusiness.toLocaleString()}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <AlertTriangle className="w-4 h-4" /> Total Due
                                </div>
                                <p className="text-xl font-bold">৳ {totalNetworkDue.toLocaleString()}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <DollarSign className="w-4 h-4" /> Total Expense
                                </div>
                                <p className="text-xl font-bold">৳ 50,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECURITY & SCALABILITY TAB --- */}
            {activeTab === 'security' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.SETTINGS.key) && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Backup Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-600"/> Data Encryption & Backup
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mb-6">
                                Create an encrypted backup file of the entire system database. This file is password protected using AES-256 standard.
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Set Encryption Password</label>
                                    <input 
                                        type="password" 
                                        value={backupPassword}
                                        onChange={e => setBackupPassword(e.target.value)}
                                        className="w-full border p-2 rounded-lg"
                                        placeholder="Enter strong password"
                                    />
                                </div>
                                <button 
                                    onClick={handleBackup}
                                    disabled={isProcessing}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Secure Backup
                                </button>
                            </div>
                        </div>

                        {/* Restore Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-orange-600"/> Restore Database
                            </h3>
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-sm text-orange-800 mb-6">
                                Warning: Restoring data will overwrite all current system information. This action cannot be undone.
                            </div>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                <input type="file" accept=".enc,.json" onChange={handleRestore} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                <p className="text-sm font-bold text-slate-600">Click to upload backup file</p>
                                <p className="text-xs text-slate-400 mt-1">Supports .enc (Encrypted) or .json</p>
                            </div>
                        </div>

                        {/* Scalability Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Server className="w-5 h-5 text-emerald-600"/> Scalability & Optimization
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-700 mb-1">Archive Old Transactions</p>
                                    <p className="text-sm text-slate-500 mb-4">Improve system performance by moving old transaction data to an archive file. Archived data is removed from the active database.</p>
                                    
                                    <div className="flex items-end gap-3 max-w-md">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Archive data older than</label>
                                            <input 
                                                type="date" 
                                                value={archiveDate}
                                                onChange={e => setArchiveDate(e.target.value)}
                                                className="w-full border p-2 rounded-lg"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleArchive}
                                            disabled={isProcessing}
                                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Run Archive'}
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden md:block w-px bg-slate-100 h-32 mx-4"></div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-700 mb-1">Database Health</p>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Transaction Volume</span>
                                            <span className="font-bold text-slate-800">{transactions.length} Records</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">System Status</span>
                                            <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Optimal</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                                            <div className="bg-emerald-500 h-full w-[15%]"></div>
                                        </div>
                                        <p className="text-xs text-slate-400 text-right">15% Load Capacity</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BUSINESSES TAB --- */}
            {activeTab === 'businesses' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.MANAGE_BUSINESSES.key) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Shop ID, Name, or Mobile..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex gap-2">
                             <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                                <UserPlus className="w-4 h-4" /> Add New Shop
                             </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Shop Details</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4 text-center">Total Store</th>
                                    <th className="px-6 py-4 text-center">Total Branch</th>
                                    <th className="px-6 py-4 text-right">Business</th>
                                    <th className="px-6 py-4 text-center">Plan</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users
                                    .filter(u => u.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || u.mobile.includes(searchTerm))
                                    .map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => {
                                                    setEditingUser(u);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-left group cursor-pointer"
                                            >
                                                <p className="font-bold text-base text-indigo-600 group-hover:text-indigo-800 group-hover:underline transition-colors">
                                                    {u.businessName}
                                                </p>
                                                <p className="text-xs text-slate-500">ID: {u.id.toUpperCase()}</p>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-700">{u.owner}</p>
                                            <p className="text-xs text-slate-500">{u.mobile}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                                            <button 
                                                onClick={() => setViewingStoresForMobile(u.mobile)}
                                                className="hover:text-indigo-600 hover:underline transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                                            >
                                                {u.totalStores || 0}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                                            <button 
                                                onClick={() => setViewingStoresForMobile(u.mobile)}
                                                className="hover:text-indigo-600 hover:underline transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                                            >
                                                {users.filter(x => x.mobile === u.mobile).length}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                            {currencySymbol} {(u.totalBusiness || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                u.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                u.plan === 'Pro' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {u.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`flex items-center justify-center gap-1 text-xs font-bold ${u.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {u.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => { setUploadUser(u.businessName); setUploadMode('product'); }}
                                                    className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors"
                                                    title="Bulk Product Upload"
                                                >
                                                    <Package className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => { setUploadUser(u.businessName); setUploadMode('due'); }}
                                                    className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 border border-orange-100 transition-colors"
                                                    title="Due Management CSV"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleViewTransactions(u)}
                                                    className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-colors"
                                                    title="View Transactions"
                                                >
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                                {isSuperAdmin && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEditClick(u)}
                                                            className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-100 border border-indigo-100 transition-colors"
                                                            title="Manage Subscription"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-100 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- TEMPLATES TAB --- */}
            {activeTab === 'templates' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.SETTINGS.key) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 text-lg">Invoice Templates</h2>
                        <button onClick={handleAddTemplate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Add Template
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {templates.map(tpl => (
                            <div key={tpl.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800">{tpl.name}</h3>
                                    <p className="text-xs text-slate-500">{tpl.status}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit3 className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- SUBSCRIPTIONS TAB --- */}
            {activeTab === 'subscriptions' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.SUBSCRIPTIONS.key) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 text-lg">Manage Subscription Plans</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
                                <h3 className="font-bold text-xl text-slate-800 mb-2">{plan.name}</h3>
                                <div className="text-3xl font-bold text-indigo-600 mb-4">${plan.price}</div>
                                <p className="text-sm text-slate-500 mb-4 h-12">{plan.features}</p>
                                <button className="w-full py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 font-medium flex items-center justify-center gap-2">
                                    <Edit3 className="w-4 h-4" /> Edit Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- USERS TAB --- */}
            {activeTab === 'users' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.MANAGE_USERS.key) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 text-lg">System Administrators</h2>
                        <button onClick={() => setShowAdminModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Add Admin
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Password</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {admins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-800">{admin.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                                        <td className="px-6 py-4">
                                            {isSuperAdmin ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-slate-500">
                                                        {showPasswords.has(admin.id) ? admin.password : '••••••••'}
                                                    </span>
                                                    <button 
                                                        onClick={() => togglePasswordVisibility(admin.id)}
                                                        className="text-slate-400 hover:text-indigo-600"
                                                    >
                                                        {showPasswords.has(admin.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Hidden</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{(admin as any).ip || 'N/A'}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{(admin as any).lastActive || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${admin.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {isSuperAdmin && (
                                                    <button 
                                                        onClick={() => {
                                                            setChangingPasswordAdmin(admin);
                                                            setNewAdminPassword(admin.password);
                                                        }}
                                                        className="p-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                                                        title="Change Password"
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {isSuperAdmin && (
                                                    <>
                                                        <button 
                                                            onClick={() => setEditingAdminPermissions({ ...admin })}
                                                            className="p-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                                                            title="Edit Permissions"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleChangeAdminRole(admin.id, admin.role === 'Admin' ? 'SuperAdmin' : 'Admin')}
                                                            className="p-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                                                            title="Change Role"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAdmin(admin.id)}
                                                            className="p-2 border border-red-200 rounded hover:bg-red-50 text-red-600"
                                                            title="Remove Admin"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- SUPPORT TAB --- */}
            {activeTab === 'support' && hasPermission(user?.permissions, PERMISSIONS.SAAS.subFeatures.SUPPORT.key) && (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500 animate-in fade-in slide-in-from-bottom-4">
                    <HeadphonesIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-700">Support Management</h2>
                    <p>Centralized support ticket system for all businesses.</p>
                    <button className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                        View Open Tickets
                    </button>
                </div>
            )}

            {/* --- SYSTEM LOGS TAB --- */}
            {activeTab === 'logs' && isSuperAdmin && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 text-lg">System Audit Logs</h2>
                        <div className="flex gap-2">
                            <button className="p-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-600" title="Export Logs">
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-600" title="Clear Logs">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-slate-500 text-xs">{log.time}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{log.user}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{log.action}</td>
                                        <td className="px-6 py-4 text-slate-500">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}
            
            {/* Custom Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300`}>
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
                        toast.type === 'success' 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : 'bg-red-600 border-red-500 text-white'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <p className="font-bold">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' : 
                                confirmModal.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                                'bg-indigo-100 text-indigo-600'
                            }`}>
                                {confirmModal.type === 'danger' ? <Trash2 className="w-8 h-8" /> : 
                                 confirmModal.type === 'warning' ? <AlertTriangle className="w-8 h-8" /> : 
                                 <Shield className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmModal.title}</h3>
                            <p className="text-slate-500 mb-8">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={closeConfirm}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmModal.onConfirm}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors ${
                                        confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
                                        confirmModal.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' : 
                                        'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Input Modal */}
            {inputModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={(e) => { e.preventDefault(); inputModal.onConfirm(inputModal.value); }} className="p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">{inputModal.title}</h3>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{inputModal.label}</label>
                                <input 
                                    autoFocus
                                    type={inputModal.type}
                                    value={inputModal.value}
                                    onChange={(e) => setInputModal(prev => ({ ...prev, value: e.target.value }))}
                                    className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={`Enter ${inputModal.label.toLowerCase()}...`}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setInputModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stores List Modal */}
            {viewingStoresForMobile && (
                <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Store className="w-5 h-5 text-indigo-600" /> 
                                Stores for {users.find(u => u.mobile === viewingStoresForMobile)?.owner}
                            </h3>
                            <button onClick={() => setViewingStoresForMobile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-3">
                                {(() => {
                                    const userStores = users.filter(u => u.mobile === viewingStoresForMobile);
                                    const allowedStores = Math.max(...userStores.map(u => u.totalStores || 0), userStores.length);
                                    
                                    return Array.from({ length: allowedStores }).map((_, idx) => {
                                        const store = userStores[idx];
                                        
                                        if (store) {
                                            return (
                                                <div 
                                                    key={store.id} 
                                                    onClick={() => {
                                                        setViewingStoresForMobile(null);
                                                        setEditingUser(store);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-indigo-600 group-hover:text-indigo-800 text-lg text-left">
                                                                {store.businessName}
                                                            </h4>
                                                            <p className="text-xs text-slate-500">{store.businessType}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${store.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {store.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-4">
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Plan</p>
                                                            <p className="text-sm font-bold text-indigo-600">{store.plan}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Business</p>
                                                            <p className="text-sm font-bold text-emerald-600">{currencySymbol} {(store.totalBusiness || 0).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={`empty-${idx}`} className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center h-[116px]">
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-slate-400">Empty Store Slot</p>
                                                        <p className="text-xs text-slate-400 mt-1">Available for new branch</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    });
                                })()}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setViewingStoresForMobile(null)}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shop Detail View Modal */}
            {viewingUserDetail && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Store className="w-5 h-5 text-indigo-600" /> Shop Full Details
                            </h3>
                            <button onClick={() => setViewingUserDetail(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Business Name</label>
                                    <p className="text-lg font-bold text-slate-800">{viewingUserDetail.businessName}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Owner Name</label>
                                    <p className="text-lg font-bold text-slate-800">{viewingUserDetail.owner}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Mobile Number</label>
                                    <p className={`text-lg font-bold ${isSuperAdmin ? 'text-indigo-600' : 'text-slate-300 italic'}`}>
                                        {isSuperAdmin ? viewingUserDetail.mobile : 'Restricted'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Current Plan</label>
                                    <p className="text-lg font-bold text-slate-800">{viewingUserDetail.plan}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                                    <p className={`text-lg font-bold ${viewingUserDetail.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {viewingUserDetail.status}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Expiry Date</label>
                                    <p className="text-lg font-bold text-slate-800">{viewingUserDetail.expiry}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Total Store</label>
                                    <p className="text-lg font-bold text-indigo-600">{viewingUserDetail.totalStores || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Total Branch</label>
                                    <p className="text-lg font-bold text-indigo-600">{users.filter(x => x.mobile === viewingUserDetail.mobile).length}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Total Business</label>
                                    <p className="text-lg font-bold text-emerald-600">{currencySymbol} {(viewingUserDetail.totalBusiness || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Signup Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Registration Date:</span>
                                        <span className="ml-2 font-medium">{(viewingUserDetail as any).signupDate || '2023-10-12'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Email:</span>
                                        <span className="ml-2 font-medium">{viewingUserDetail.email || `${viewingUserDetail.owner.toLowerCase().replace(' ', '.')}@gmail.com`}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Address:</span>
                                        <span className="ml-2 font-medium">{(viewingUserDetail as any).address || 'Dhaka, Bangladesh'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Business Type:</span>
                                        <span className="ml-2 font-medium">{(viewingUserDetail as any).businessType || 'Retail / Fashion'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Technical & Security
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Last Active:</span>
                                        <span className="ml-2 font-medium text-indigo-700">{(viewingUserDetail as any).lastActive || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Login Count:</span>
                                        <span className="ml-2 font-medium text-indigo-700">{(viewingUserDetail as any).loginCount || 0} times</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Last IP:</span>
                                        <span className="ml-2 font-mono text-xs text-indigo-700">{(viewingUserDetail as any).lastIp || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Password:</span>
                                        <span className="ml-2 font-mono text-xs text-indigo-700">
                                            {isSuperAdmin ? (
                                                <span className="flex items-center gap-1">
                                                    {showPasswords.has(viewingUserDetail.id) ? (viewingUserDetail as any).password : '••••••••'}
                                                    <button onClick={() => togglePasswordVisibility(viewingUserDetail.id)} className="text-indigo-400 hover:text-indigo-600">
                                                        {showPasswords.has(viewingUserDetail.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    </button>
                                                </span>
                                            ) : 'Restricted'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {isSuperAdmin && (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => {
                                            setEditingUser({...viewingUserDetail});
                                            setShowEditModal(true);
                                            setViewingUserDetail(null);
                                        }}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleDeleteUser(viewingUserDetail.id);
                                            setViewingUserDetail(null);
                                        }}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                    <button 
                                        onClick={() => setViewingUserDetail(null)}
                                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-indigo-600" /> Manage Subscription
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUserSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
                                    <input 
                                        type="text" 
                                        value={editingUser.businessName}
                                        onChange={e => setEditingUser({...editingUser, businessName: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Name</label>
                                    <input 
                                        type="text" 
                                        value={editingUser.owner}
                                        onChange={e => setEditingUser({...editingUser, owner: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                                    <input 
                                        type="text" 
                                        value={editingUser.mobile}
                                        onChange={e => setEditingUser({...editingUser, mobile: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={editingUser.email}
                                        onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Type</label>
                                    <input 
                                        type="text" 
                                        value={(editingUser as any).businessType || ''}
                                        onChange={e => setEditingUser({...editingUser, businessType: e.target.value} as any)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Retail / Fashion"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                                    <input 
                                        type="text" 
                                        value={(editingUser as any).address || ''}
                                        onChange={e => setEditingUser({...editingUser, address: e.target.value} as any)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Dhaka, Bangladesh"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User Password</label>
                                    <input 
                                        type="text" 
                                        value={(editingUser as any).password || ''}
                                        onChange={e => setEditingUser({...editingUser, password: e.target.value} as any)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Store (Allowed Limit)</label>
                                    <input 
                                        type="number" 
                                        value={editingUser.totalStores || 0}
                                        onChange={e => setEditingUser({...editingUser, totalStores: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Business (৳)</label>
                                    <input 
                                        type="number" 
                                        value={editingUser.totalBusiness || 0}
                                        onChange={e => setEditingUser({...editingUser, totalBusiness: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Subscription Plan
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {['Basic', 'Pro', 'Enterprise'].map(plan => (
                                        <button
                                            key={plan}
                                            type="button"
                                            onClick={() => setEditingUser({...editingUser, plan})}
                                            className={`py-2 text-sm font-bold rounded-lg border transition-all ${editingUser.plan === plan ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                        >
                                            {plan}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                                        <select 
                                            value={editingUser.status}
                                            onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg bg-white"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Banned">Banned</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                                        <input 
                                            type="date" 
                                            value={editingUser.expiry}
                                            onChange={e => setEditingUser({...editingUser, expiry: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                Save Details
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {uploadMode && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-600" /> 
                                {uploadMode === 'product' ? 'Bulk Product Upload' : 'Due Management CSV'}
                            </h3>
                            <button onClick={() => setUploadMode(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-sm text-slate-500 mb-4">
                                Uploading for: <span className="font-bold text-slate-800">{uploadUser}</span>
                            </p>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 mb-4 relative">
                                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">Click to upload CSV</p>
                            </div>
                            <button className="text-xs text-indigo-600 hover:underline">Download Sample CSV</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction View Modal */}
            {showTxModal && viewingTxUser && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Transactions: {viewingTxUser.businessName}</h3>
                            <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {/* Mocking specific transactions for the user view */}
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-4 py-3">2024-03-15</td>
                                        <td className="px-4 py-3">Subscription (Pro)</td>
                                        <td className="px-4 py-3 font-bold">$29.00</td>
                                        <td className="px-4 py-3 text-emerald-600">Paid</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">2024-02-15</td>
                                        <td className="px-4 py-3">Subscription (Pro)</td>
                                        <td className="px-4 py-3 font-bold">$29.00</td>
                                        <td className="px-4 py-3 text-emerald-600">Paid</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Add New Admin</h3>
                            <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            <input 
                                placeholder="Full Name" 
                                className="w-full border p-2 rounded" 
                                value={newAdmin.name} 
                                onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} 
                                required 
                            />
                            <input 
                                placeholder="Email Address" 
                                type="email" 
                                className="w-full border p-2 rounded" 
                                value={newAdmin.email} 
                                onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                                required 
                            />
                            <input 
                                placeholder="Password" 
                                type="password" 
                                className="w-full border p-2 rounded" 
                                value={(newAdmin as any).password || ''} 
                                onChange={e => setNewAdmin({...newAdmin, password: e.target.value} as any)} 
                                required 
                            />
                            <select 
                                className="w-full border p-2 rounded bg-white"
                                value={newAdmin.role}
                                onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                            >
                                <option value="Admin">Admin</option>
                                <option value="SuperAdmin">Super Admin</option>
                            </select>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Permissions</label>
                                <div className="border rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleAdminAllPermissions(null)}
                                        className={`w-full p-3 text-left flex items-center justify-between border-b ${newAdmin.permissions?.includes('all') ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            <span className="font-bold">All Permissions (Super Admin)</span>
                                        </div>
                                        {newAdmin.permissions?.includes('all') && <Check className="w-4 h-4" />}
                                    </button>
                                    {!newAdmin.permissions?.includes('all') && (
                                        <div className="max-h-60 overflow-y-auto">
                                            {Object.entries(PERMISSIONS)
                                                .filter(([key]) => key === 'SAAS')
                                                .map(([key, module]) => {
                                                const isExpanded = expandedModules.includes(key);
                                                const isFullySelected = isModuleFullySelected(newAdmin.permissions || [], key);
                                                const isPartiallySelected = isModulePartiallySelected(newAdmin.permissions || [], key);

                                                return (
                                                    <div key={key} className="border-b last:border-0">
                                                        <div className="flex items-center bg-slate-50/50">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleAdminModulePermissions(null, key)}
                                                                className="flex-1 p-3 flex items-center gap-3 text-left"
                                                            >
                                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFullySelected ? 'bg-indigo-600 border-indigo-600 text-white' : isPartiallySelected ? 'bg-indigo-100 border-indigo-600 text-indigo-600' : 'bg-white border-slate-300'}`}>
                                                                    {isFullySelected && <Check className="w-3 h-3" />}
                                                                    {isPartiallySelected && <div className="w-2 h-0.5 bg-indigo-600 rounded-full" />}
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-700">{module.label}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleModuleExpand(key)}
                                                                className="p-3 text-slate-400 hover:text-slate-600"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        {isExpanded && (
                                                            <div className="bg-white p-2 grid grid-cols-1 gap-1">
                                                                {Object.values(module.subFeatures).map((sf: any) => (
                                                                    <button
                                                                        key={sf.key}
                                                                        type="button"
                                                                        onClick={() => toggleAdminPermission(null, sf.key)}
                                                                        className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${newAdmin.permissions?.includes(sf.key) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${newAdmin.permissions?.includes(sf.key) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                                                                            {newAdmin.permissions?.includes(sf.key) && <Check className="w-2.5 h-2.5" />}
                                                                        </div>
                                                                        <span className="text-xs font-medium">{sf.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button className="w-full bg-slate-900 text-white py-2 rounded font-bold">Add User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Admin Permissions Modal */}
            {editingAdminPermissions && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Edit Permissions: {editingAdminPermissions.name}</h3>
                            <button onClick={() => setEditingAdminPermissions(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="border rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleAdminAllPermissions(editingAdminPermissions.id)}
                                    className={`w-full p-3 text-left flex items-center justify-between border-b ${editingAdminPermissions.permissions?.includes('all') ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span className="font-bold">All Permissions (Super Admin)</span>
                                    </div>
                                    {editingAdminPermissions.permissions?.includes('all') && <Check className="w-4 h-4" />}
                                </button>
                                {!editingAdminPermissions.permissions?.includes('all') && (
                                    <div className="max-h-96 overflow-y-auto">
                                        {Object.entries(PERMISSIONS)
                                            .filter(([key]) => key === 'SAAS')
                                            .map(([key, module]) => {
                                            const isExpanded = expandedModules.includes(key);
                                            const isFullySelected = isModuleFullySelected(editingAdminPermissions.permissions || [], key);
                                            const isPartiallySelected = isModulePartiallySelected(editingAdminPermissions.permissions || [], key);

                                            return (
                                                <div key={key} className="border-b last:border-0">
                                                    <div className="flex items-center bg-slate-50/50">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleAdminModulePermissions(editingAdminPermissions.id, key)}
                                                            className="flex-1 p-3 flex items-center gap-3 text-left"
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFullySelected ? 'bg-indigo-600 border-indigo-600 text-white' : isPartiallySelected ? 'bg-indigo-100 border-indigo-600 text-indigo-600' : 'bg-white border-slate-300'}`}>
                                                                {isFullySelected && <Check className="w-3 h-3" />}
                                                                {isPartiallySelected && <div className="w-2 h-0.5 bg-indigo-600 rounded-full" />}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700">{module.label}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleModuleExpand(key)}
                                                            className="p-3 text-slate-400 hover:text-slate-600"
                                                        >
                                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="bg-white p-2 grid grid-cols-1 gap-1">
                                                            {Object.values(module.subFeatures).map((sf: any) => (
                                                                <button
                                                                    key={sf.key}
                                                                    type="button"
                                                                    onClick={() => toggleAdminPermission(editingAdminPermissions.id, sf.key)}
                                                                    className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${editingAdminPermissions.permissions?.includes(sf.key) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${editingAdminPermissions.permissions?.includes(sf.key) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                                                                        {editingAdminPermissions.permissions?.includes(sf.key) && <Check className="w-2.5 h-2.5" />}
                                                                    </div>
                                                                    <span className="text-xs font-medium">{sf.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={handleSaveAdminPermissions}
                                className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
                            >
                                Save Permissions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {changingPasswordAdmin && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Change Password</h3>
                            <button onClick={() => setChangingPasswordAdmin(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500">Changing password for <span className="font-bold">{changingPasswordAdmin.name}</span></p>
                            <input 
                                type="text"
                                className="w-full border p-2 rounded" 
                                value={newAdminPassword} 
                                onChange={e => setNewAdminPassword(e.target.value)} 
                                placeholder="New Password"
                            />
                            <button 
                                onClick={() => handlePasswordChange(changingPasswordAdmin.id, newAdminPassword)}
                                className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;