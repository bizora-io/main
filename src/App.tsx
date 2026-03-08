
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, ShoppingBag, Zap, ClipboardList, FileText, 
  BookOpen, DollarSign, Users, Box, Package, Printer, Megaphone, Globe, 
  Trash2, Menu, X, Bot, Settings, UserCircle, Video, ShieldCheck, Search, 
  ArrowRightLeft, Store, Shield, Crown, LogOut, RotateCcw, Briefcase, CheckCircle,
  Factory, ChevronLeft, Home, Grid, MoreHorizontal, Wallet, MessageSquare, ChevronDown, Image, HeadphonesIcon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CustomerSupport from './components/CustomerSupport';
import ProductTransfer from './components/ProductTransfer';
import ProductList from './components/ProductList';
import StoreManagement from './components/StoreManagement';
import AdminPanel from './components/AdminPanel';
import Subscription from './components/Subscription';
import NotificationCenter from './components/NotificationCenter';
import Buy from './components/Buy';
import Sell from './components/Sell';
import SalesReturn from './components/SalesReturn';
import Cashbox from './components/Cashbox';
import QuickSale from './components/QuickSale';
import Communication from './components/Communication';
import RecycleBin from './components/RecycleBin';
import BusinessReports from './components/BusinessReports';
import StockReport from './components/StockReport';
import SettingsPage from './components/SettingsPage';
import AppAccess from './components/AppAccess';
import OnlineShop from './components/OnlineShop';
import Marketing from './components/Marketing';
import EmployeeManagement from './components/EmployeeManagement';
import Production from './components/Production';
import Customers from './components/Customers';
import { PurchaseLedger, SaleLedger, DueLedger, ExpenseLedger } from './components/Ledgers';
import { Auth } from './components/Auth';
import { AppLanguage, Currency, UserRole } from './types';
import { SettingsProvider, useSettings, CURRENCY_SYMBOLS } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { StoreProvider, useStores } from './contexts/StoreContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginModal } from './components/LoginModal';
import { PERMISSIONS, hasPermission } from './utils/permissions';

// --- Components for Navigation ---

const DesktopSidebarItem = ({ to, icon: Icon, label, active, onClick, collapsed }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative ${
        active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
    {!collapsed && <span className="font-medium text-sm tracking-wide">{label}</span>}
    {collapsed && (
        <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700 shadow-xl">
            {label}
        </div>
    )}
  </Link>
);

const MobileMenuItem = ({ to, icon: Icon, label, onClick }: any) => (
    <Link to={to} onClick={onClick} className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm active:scale-95 transition-transform h-24">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full mb-2">
            <Icon className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{label}</span>
    </Link>
);

const SectionHeader = ({ label, collapsed }: { label: string, collapsed?: boolean }) => {
    if (collapsed) return <div className="h-4"></div>;
    return (
        <div className="px-5 mt-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {label}
        </div>
    );
};

const ProtectedRoute = ({ requiredPermission, children }: { requiredPermission?: string, children: React.ReactNode }) => {
    const { user } = useAuth();
    const { t } = useSettings();
    
    if (!requiredPermission) return <>{children}</>;
    
    // Check if user has permission
    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';
    
    if (isAdmin || hasPermission(user?.permissions, requiredPermission)) {
        return <>{children}</>;
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600">
            <Shield className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('Access Denied')}</h2>
            <p>{t('You do not have permission to view this page.')}</p>
            <Link to="/" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                {t('Go Home')}
            </Link>
        </div>
    );
};

// --- Business Switcher Component ---
const BusinessSwitcher = () => {
    const { user, switchBusiness } = useAuth();
    const { t } = useSettings();
    
    if (!user?.businesses || user.businesses.length <= 1) return null;

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold whitespace-nowrap max-w-[60px] sm:max-w-[120px] truncate">
                    {user.businessName}
                </span>
                <ChevronDown className="w-3 h-3" />
            </button>
            
            <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-[70] animate-in fade-in slide-in-from-top-2">
                <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">{t('Switch Business')}</p>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {user.businesses.map(biz => (
                            <button
                                key={biz.id}
                                onClick={() => switchBusiness(biz.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 ${user.businessName === biz.name ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <div className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${user.businessName === biz.name ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {biz.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate">{biz.name}</p>
                                    <p className="text-[10px] opacity-70 truncate font-normal">{biz.type}</p>
                                </div>
                                {user.businessName === biz.name && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Store Switcher Component ---
const StoreSwitcher = () => {
    const { stores, activeStore, switchStore } = useStores();
    const { t } = useSettings();
    
    return (
        <div className="relative group">
            <button className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200">
                <Store className="w-4 h-4" />
                <span className="text-xs font-bold whitespace-nowrap max-w-[80px] sm:max-w-[150px] truncate">
                    {activeStore === 'HEAD_OFFICE' ? t('Head Office (All)') : activeStore.name}
                </span>
                <ChevronDown className="w-3 h-3" />
            </button>
            
            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-[70] animate-in fade-in slide-in-from-top-2">
                <div className="p-2">
                    <button 
                        onClick={() => switchStore('HEAD_OFFICE')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeStore === 'HEAD_OFFICE' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Building className="w-4 h-4" /> {t('Head Office (All)')}
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    <div className="max-h-60 overflow-y-auto">
                        {stores.map(store => (
                            <button
                                key={store.id}
                                onClick={() => switchStore(store.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeStore !== 'HEAD_OFFICE' && activeStore.id === store.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="truncate">{store.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="my-1 border-t border-slate-100"></div>
                    <Link to="/stores" className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-2">
                        <Settings className="w-3 h-3" /> {t('Manage Stores')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Import Building icon locally for StoreSwitcher
import { Building } from 'lucide-react';

// --- NEW COMPONENTS ---

const PlaceholderPage = ({ title }: { title: string }) => {
  const { t } = useSettings();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Settings className="w-10 h-10 opacity-20" />
      </div>

      <h2 className="text-2xl font-bold text-slate-600 mb-2">{title}</h2>

      <p>{t("This module is currently under development.")}</p>
    </div>
  );
};

// --- Main Layout Component ---

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, currency, setCurrency, t } = useSettings();
  const { user, logout, switchBusiness } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';
  const check = (perm: string) => isAdmin || hasPermission(user?.permissions, perm);

  const getPageTitle = (path: string) => {
    const routeKeyMap: Record<string, string> = {
      '/': 'Home',
      '/sale': 'Sell',
      '/purchase': 'Buy',
      '/stock': 'Stock Report',
      '/products': 'Product List',
      '/stores': 'Store Management',
      '/employees': 'Employees',
      '/communication': 'Communication',
      '/marketing': 'Marketing',
      '/reports': 'Reports & Tax',
      '/shop': 'Online Shop',
      '/support': 'Customer Support',
      '/bin': 'Recycle Bin',
      '/settings': 'Settings',
      '/transfer': 'Product Transfer',
      '/production': 'Production',
      '/due-ledger': 'Due Ledger',
      '/sale-ledger': 'Sale Ledger',
      '/purchase-ledger': 'Purchase Ledger',
      '/expense-ledger': 'Expense Ledger',
      '/cashbox': 'Accounts & Cash',
      '/quick-sale': 'Quick Sale',
      '/sales-return': 'Sales Return',
      '/admin': 'Admin Panel',
      '/subscription': 'Subscription',
      '/access': 'Access Control'
    };
    
    if (routeKeyMap[path]) return t(routeKeyMap[path]);

    // Fallback for unknown routes
    if (path === '/') return t('Home');
    const cleanPath = path.substring(1).replace('-', ' ');
    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  };

  const isSaaSUser = user?.role === UserRole.SAAS_OWNER || user?.role === UserRole.SAAS_ADMIN;

  const NavList = ({ collapsed }: { collapsed?: boolean }) => {
    if (isSaaSUser) {
        return (
            <div className="pb-20">
                <SectionHeader label={t('SaaS Platform')} collapsed={collapsed} />
                <DesktopSidebarItem to="/admin" icon={LayoutDashboard} label={t('Dashboard')} active={location.pathname === '/admin' && (!location.search || location.search.includes('tab=dashboard'))} collapsed={collapsed} />
                {check(PERMISSIONS.SAAS.subFeatures.MANAGE_BUSINESSES.key) && <DesktopSidebarItem to="/admin?tab=businesses" icon={Store} label={t('Businesses')} active={location.search.includes('tab=businesses')} collapsed={collapsed} />}
                {check(PERMISSIONS.SAAS.subFeatures.MANAGE_USERS.key) && <DesktopSidebarItem to="/admin?tab=users" icon={Users} label={t('Users')} active={location.search.includes('tab=users')} collapsed={collapsed} />}
                {check(PERMISSIONS.SAAS.subFeatures.SUBSCRIPTIONS.key) && <DesktopSidebarItem to="/admin?tab=subscriptions" icon={Crown} label={t('Subscriptions')} active={location.search.includes('tab=subscriptions')} collapsed={collapsed} />}
                {check(PERMISSIONS.SAAS.subFeatures.SUPPORT.key) && <DesktopSidebarItem to="/admin?tab=support" icon={HeadphonesIcon} label={t('Support')} active={location.search.includes('tab=support')} collapsed={collapsed} />}
                {check(PERMISSIONS.SAAS.subFeatures.SETTINGS.key) && <DesktopSidebarItem to="/settings" icon={Settings} label={t('System Settings')} active={location.pathname === '/settings'} collapsed={collapsed} />}
            </div>
        );
    }

    return (
    <div className="pb-20">
      <DesktopSidebarItem to="/" icon={LayoutDashboard} label={t('Home')} active={location.pathname === '/'} collapsed={collapsed} />
      
      <SectionHeader label={t('Operations')} collapsed={collapsed} />
      {check(PERMISSIONS.POS.subFeatures.SELL.key) && <DesktopSidebarItem to="/sale" icon={ShoppingBag} label={t('Sell')} active={location.pathname === '/sale'} collapsed={collapsed} />}
      {check(PERMISSIONS.INVENTORY.subFeatures.PURCHASE.key) && <DesktopSidebarItem to="/purchase" icon={ShoppingCart} label={t('Buy')} active={location.pathname === '/purchase'} collapsed={collapsed} />}
      {check(PERMISSIONS.POS.subFeatures.QUICK_SALE.key) && <DesktopSidebarItem to="/quick-sale" icon={Zap} label={t('Quick Sale')} active={location.pathname === '/quick-sale'} collapsed={collapsed} />}
      {check(PERMISSIONS.POS.subFeatures.RETURNS.key) && <DesktopSidebarItem to="/sales-return" icon={RotateCcw} label={t('Returns')} active={location.pathname === '/sales-return'} collapsed={collapsed} />}
      
      <SectionHeader label={t('Finance')} collapsed={collapsed} />
      {check(PERMISSIONS.FINANCE.subFeatures.VIEW_CASHBOX.key) && <DesktopSidebarItem to="/cashbox" icon={Wallet} label={t('Accounts & Cash')} active={location.pathname === '/cashbox'} collapsed={collapsed} />}
      {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <DesktopSidebarItem to="/sale-ledger" icon={FileText} label={t('Sale Ledger')} active={location.pathname === '/sale-ledger'} collapsed={collapsed} />}
      {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <DesktopSidebarItem to="/purchase-ledger" icon={ClipboardList} label={t('Purchase Ledger')} active={location.pathname === '/purchase-ledger'} collapsed={collapsed} />}
      {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <DesktopSidebarItem to="/due-ledger" icon={BookOpen} label={t('Due Ledger')} active={location.pathname === '/due-ledger'} collapsed={collapsed} />}
      {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <DesktopSidebarItem to="/expense-ledger" icon={DollarSign} label={t('Expense Ledger')} active={location.pathname === '/expense-ledger'} collapsed={collapsed} />}
      
      <SectionHeader label={t('Management')} collapsed={collapsed} />
      {check(PERMISSIONS.CRM.subFeatures.VIEW_CUSTOMERS.key) && <DesktopSidebarItem to="/customers" icon={Users} label={t('Customers')} active={location.pathname === '/customers'} collapsed={collapsed} />}
      {check(PERMISSIONS.INVENTORY.subFeatures.VIEW_STOCK.key) && <DesktopSidebarItem to="/stock" icon={Package} label={t('Stock Report')} active={location.pathname === '/stock'} collapsed={collapsed} />}
      {check(PERMISSIONS.INVENTORY.subFeatures.VIEW_STOCK.key) && <DesktopSidebarItem to="/products" icon={Box} label={t('Product List')} active={location.pathname === '/products'} collapsed={collapsed} />}
      {check(PERMISSIONS.INVENTORY.subFeatures.PRODUCTION.key) && <DesktopSidebarItem to="/production" icon={Factory} label={t('Production')} active={location.pathname === '/production'} collapsed={collapsed} />}
      {check(PERMISSIONS.INVENTORY.subFeatures.TRANSFER.key) && <DesktopSidebarItem to="/transfer" icon={ArrowRightLeft} label={t('Product Transfer')} active={location.pathname === '/transfer'} collapsed={collapsed} />}
      {check(PERMISSIONS.ADMIN.subFeatures.MANAGE_STORES.key) && <DesktopSidebarItem to="/stores" icon={Store} label={t('Store Management')} active={location.pathname === '/stores'} collapsed={collapsed} />}
      {check(PERMISSIONS.HR.subFeatures.MANAGE_STAFF.key) && <DesktopSidebarItem to="/employees" icon={Briefcase} label={t('Employees')} active={location.pathname === '/employees'} collapsed={collapsed} />}
      {check(PERMISSIONS.ADMIN.subFeatures.ACCESS_CONTROL.key) && <DesktopSidebarItem to="/access" icon={ShieldCheck} label={t('Access Control')} active={location.pathname === '/access'} collapsed={collapsed} />}
      {check(PERMISSIONS.ADMIN.subFeatures.SUBSCRIPTION.key) && <DesktopSidebarItem to="/subscription" icon={Crown} label={t('Subscription')} active={location.pathname === '/subscription'} collapsed={collapsed} />}
      
      <SectionHeader label={t('Tools')} collapsed={collapsed} />
      {check(PERMISSIONS.CRM.subFeatures.COMMUNICATION.key) && <DesktopSidebarItem to="/communication" icon={MessageSquare} label={t('Communication')} active={location.pathname === '/communication'} collapsed={collapsed} />}
      {check(PERMISSIONS.CRM.subFeatures.MARKETING.key) && <DesktopSidebarItem to="/marketing" icon={Megaphone} label={t('Marketing')} active={location.pathname === '/marketing'} collapsed={collapsed} />}
      {check(PERMISSIONS.REPORTS.subFeatures.VIEW_REPORTS.key) && <DesktopSidebarItem to="/reports" icon={Briefcase} label={t('Reports & Tax')} active={location.pathname === '/reports'} collapsed={collapsed} />}
      {check(PERMISSIONS.ONLINE_SHOP.subFeatures.MANAGE_SHOP.key) && <DesktopSidebarItem to="/shop" icon={Globe} label={t('Online Shop')} active={location.pathname === '/shop'} collapsed={collapsed} />}
      {check(PERMISSIONS.CRM.subFeatures.SUPPORT.key) && <DesktopSidebarItem to="/support" icon={HeadphonesIcon} label={t('Support')} active={location.pathname === '/support'} collapsed={collapsed} />}
      {check(PERMISSIONS.ADMIN.subFeatures.RECYCLE_BIN.key) && <DesktopSidebarItem to="/bin" icon={Trash2} label={t('Recycle Bin')} active={location.pathname === '/bin'} collapsed={collapsed} />}
      {check(PERMISSIONS.ADMIN.subFeatures.SETTINGS.key) && <DesktopSidebarItem to="/settings" icon={Settings} label={t('Settings')} active={location.pathname === '/settings'} collapsed={collapsed} />}
    </div>
  );
  };

  const isPOSPage = ['/sale', '/purchase', '/quick-sale', '/sales-return'].includes(location.pathname);

  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className={`hidden lg:flex flex-col bg-[#0f172a] text-white transition-all duration-300 ease-in-out border-r border-slate-800 z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className={`h-16 flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center'} border-b border-slate-800/50`}>
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/30">B</div>
               {sidebarOpen && <h1 className="text-lg font-bold tracking-tight text-slate-100">Bizora</h1>}
           </div>
           {sidebarOpen && (
               <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                   <ChevronLeft className="w-5 h-5" />
               </button>
           )}
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4">
          <NavList collapsed={!sidebarOpen} />
        </nav>

        <div className="p-3 border-t border-slate-800 bg-[#0f172a]">
           <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-2' : 'justify-center'} transition-all`}>
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-600">
                 <UserCircle className="w-5 h-5 text-slate-300" />
              </div>
              {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-semibold text-white truncate">{user?.businessName || 'Business'}</p>
                     <p className="text-[10px] text-slate-400 truncate">{user?.role || 'User'}</p>
                  </div>
              )}
              {sidebarOpen && (
                  <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-1" title={t('Logout')}>
                     <LogOut className="w-4 h-4" />
                  </button>
              )}
           </div>
        </div>
      </aside>

      {/* --- MOBILE FULL MENU DRAWER --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 flex justify-between items-center bg-white border-b border-slate-200">
                <h2 className="font-bold text-lg text-slate-800">{t('All Applications')}</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-32">
                
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">{t('Main')}</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <MobileMenuItem to="/" icon={LayoutDashboard} label={t('Home')} onClick={() => setMobileMenuOpen(false)} />
                    {check(PERMISSIONS.POS.subFeatures.SELL.key) && <MobileMenuItem to="/sale" icon={ShoppingBag} label={t('Sell')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.INVENTORY.subFeatures.PURCHASE.key) && <MobileMenuItem to="/purchase" icon={ShoppingCart} label={t('Buy')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.POS.subFeatures.QUICK_SALE.key) && <MobileMenuItem to="/quick-sale" icon={Zap} label={t('Quick Sale')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.POS.subFeatures.RETURNS.key) && <MobileMenuItem to="/sales-return" icon={RotateCcw} label={t('Returns')} onClick={() => setMobileMenuOpen(false)} />}
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">{t('Finance')}</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {check(PERMISSIONS.FINANCE.subFeatures.VIEW_CASHBOX.key) && <MobileMenuItem to="/cashbox" icon={Wallet} label={t('Accounts')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <MobileMenuItem to="/sale-ledger" icon={FileText} label={t('Sale Ledger')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <MobileMenuItem to="/purchase-ledger" icon={ClipboardList} label={t('Buy Ledger')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <MobileMenuItem to="/due-ledger" icon={BookOpen} label={t('Due Ledger')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key) && <MobileMenuItem to="/expense-ledger" icon={DollarSign} label={t('Expense')} onClick={() => setMobileMenuOpen(false)} />}
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">{t('Management')}</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {check(PERMISSIONS.CRM.subFeatures.VIEW_CUSTOMERS.key) && <MobileMenuItem to="/customers" icon={Users} label={t('Customers')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.INVENTORY.subFeatures.VIEW_STOCK.key) && <MobileMenuItem to="/stock" icon={Package} label={t('Stock Report')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.INVENTORY.subFeatures.VIEW_STOCK.key) && <MobileMenuItem to="/products" icon={Box} label={t('Product List')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.INVENTORY.subFeatures.PRODUCTION.key) && <MobileMenuItem to="/production" icon={Factory} label={t('Production')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.INVENTORY.subFeatures.TRANSFER.key) && <MobileMenuItem to="/transfer" icon={ArrowRightLeft} label={t('Transfer')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.ADMIN.subFeatures.MANAGE_STORES.key) && <MobileMenuItem to="/stores" icon={Store} label={t('Store Mgmt')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.HR.subFeatures.MANAGE_STAFF.key) && <MobileMenuItem to="/employees" icon={Users} label={t('Employees')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.ADMIN.subFeatures.ACCESS_CONTROL.key) && <MobileMenuItem to="/access" icon={ShieldCheck} label={t('Access')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.ADMIN.subFeatures.SUBSCRIPTION.key) && <MobileMenuItem to="/subscription" icon={Crown} label={t('Subscription')} onClick={() => setMobileMenuOpen(false)} />}
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">{t('Tools')}</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {check(PERMISSIONS.CRM.subFeatures.COMMUNICATION.key) && <MobileMenuItem to="/communication" icon={MessageSquare} label={t('Communication')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.CRM.subFeatures.MARKETING.key) && <MobileMenuItem to="/marketing" icon={Megaphone} label={t('Marketing')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.REPORTS.subFeatures.VIEW_REPORTS.key) && <MobileMenuItem to="/reports" icon={Briefcase} label={t('Reports')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.ONLINE_SHOP.subFeatures.MANAGE_SHOP.key) && <MobileMenuItem to="/shop" icon={Globe} label={t('Online Shop')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.CRM.subFeatures.SUPPORT.key) && <MobileMenuItem to="/support" icon={HeadphonesIcon} label={t('Support')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.ADMIN.subFeatures.RECYCLE_BIN.key) && <MobileMenuItem to="/bin" icon={Trash2} label={t('Recycle Bin')} onClick={() => setMobileMenuOpen(false)} />}
                    {check(PERMISSIONS.ADMIN.subFeatures.SETTINGS.key) && <MobileMenuItem to="/settings" icon={Settings} label={t('Settings')} onClick={() => setMobileMenuOpen(false)} />}
                </div>
                
                {user?.businesses && user.businesses.length > 1 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">{t('Switch Business')}</h3>
                        <div className="space-y-2">
                            {user.businesses.map(biz => (
                                <button
                                    key={biz.id}
                                    onClick={() => {
                                        switchBusiness(biz.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${user.businessName === biz.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-700'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${user.businessName === biz.name ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                        {biz.name.charAt(0)}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{biz.name}</p>
                                        <p className={`text-[10px] truncate ${user.businessName === biz.name ? 'text-white/70' : 'text-slate-500'}`}>{biz.type}</p>
                                    </div>
                                    {user.businessName === biz.name && <CheckCircle className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <button onClick={logout} className="w-full py-3 text-red-600 font-bold bg-red-50 rounded-xl mt-4 mb-safe border border-red-100">
                    {t('Logout')}
                </button>
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative">
        
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-[60]">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="hidden lg:flex p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                    <Menu className="w-5 h-5"/>
                </button>
            )}
            {/* Mobile Logo in Header */}
            <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">B</div>
                <h2 className="hidden sm:block text-lg font-bold text-slate-800">Bizora</h2>
            </div>
            
            <h2 className="hidden lg:block text-lg font-bold text-slate-800 tracking-tight capitalize">{getPageTitle(location.pathname)}</h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Business Switcher */}
            <BusinessSwitcher />

            {/* Store Switcher */}
            <StoreSwitcher />

            {/* Language/Currency for Desktop */}
            <div className="hidden md:flex items-center gap-2">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    className="bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none hover:border-slate-300"
                >
                    {Object.entries(AppLanguage).map(([key, value]) => (
                      <option key={value} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
                    ))}
                </select>
                <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none hover:border-slate-300"
                >
                    {Object.values(Currency).map(c => <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>)}
                </select>
            </div>

            <NotificationCenter />
            
            <Link to="/settings" className="hidden lg:flex p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative group">
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </Link>
          </div>
        </header>

        {/* Scrollable View */}
        <main className={`flex-1 overflow-y-auto scroll-smooth ${isPOSPage ? 'p-0 pb-0' : 'p-4 lg:p-8 pb-32 lg:pb-8'}`}>
          <div className={`${isPOSPage ? 'h-full' : 'max-w-[1600px] mx-auto w-full'}`}>
            {children}
          </div>
        </main>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        {!isPOSPage && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-[70px] flex items-center justify-between px-2 z-40 pb-safe shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                <Link to="/" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Home className="w-5 h-5" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium truncate w-full text-center">{t('Home')}</span>
                </Link>
                <Link to="/sale" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 ${location.pathname === '/sale' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <ShoppingBag className="w-5 h-5" strokeWidth={location.pathname === '/sale' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium truncate w-full text-center">{t('Sale')}</span>
                </Link>
                <Link to="/due-ledger" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 ${location.pathname === '/due-ledger' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <BookOpen className="w-5 h-5" strokeWidth={location.pathname === '/due-ledger' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium truncate w-full text-center">{t('Due')}</span>
                </Link>
                
                {/* FAB */}
                <div className="relative -top-5 flex-1 flex justify-center min-w-0">
                    <Link to="/quick-sale" className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-300 border-4 border-slate-50 text-white transform active:scale-95 transition-transform">
                        <Zap className="w-6 h-6" />
                    </Link>
                </div>

                <Link to="/products" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 ${location.pathname === '/products' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Package className="w-5 h-5" strokeWidth={location.pathname === '/products' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium truncate w-full text-center">{t('Stock Report')}</span>
                </Link>
                
                {/* Account Button */}
                <Link to="/cashbox" className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 ${location.pathname === '/cashbox' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Wallet className="w-5 h-5" strokeWidth={location.pathname === '/cashbox' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium truncate w-full text-center">{t('Accounts & Cash')}</span>
                </Link>

                <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 text-slate-400">
                    <Grid className="w-5 h-5" />
                    <span className="text-[9px] font-medium truncate w-full text-center">{t('Menu')}</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

// ...
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { setCurrency } = useSettings();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
        const user = localStorage.getItem('nexus_user');
        if (!user) {
            setShowLoginModal(true);
        }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.businesses && user.businessName) {
      const activeBusiness = user.businesses.find(b => b.name === user.businessName);
      if (activeBusiness?.settings?.currency) {
        setCurrency(activeBusiness.settings.currency as Currency);
      }
    }
  }, [isAuthenticated, user?.businessName, user?.businesses, setCurrency]);

  if (!isAuthenticated) {
    return (
        <>
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            <Auth />
        </>
    );
  }

  const isSaaSUser = user?.role === UserRole.SAAS_OWNER || user?.role === UserRole.SAAS_ADMIN;

  return (
    <Router>
      <Layout>
        <Routes>
           {/* SaaS Routes */}
           <Route path="/admin" element={
            <ProtectedRoute requiredPermission={PERMISSIONS.SAAS.subFeatures.DASHBOARD.key}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Redirect SaaS users to admin dashboard */}
          <Route path="/" element={
            isSaaSUser ? <Navigate to="/admin" replace /> : <Dashboard />
          } />

          {/* Business Routes - Only accessible to non-SaaS users */}
          {!isSaaSUser && (
            <>
              <Route path="/sale" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.POS.subFeatures.SELL.key}>
                  <Sell />
                </ProtectedRoute>
              } />
              <Route path="/purchase" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.INVENTORY.subFeatures.PURCHASE.key}>
                  <Buy />
                </ProtectedRoute>
              } />
              <Route path="/quick-sale" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.POS.subFeatures.QUICK_SALE.key}>
                  <QuickSale />
                </ProtectedRoute>
              } />
              <Route path="/sales-return" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.POS.subFeatures.RETURNS.key}>
                  <SalesReturn />
                </ProtectedRoute>
              } />
              <Route path="/cashbox" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE.subFeatures.VIEW_CASHBOX.key}>
                  <Cashbox />
                </ProtectedRoute>
              } />
              <Route path="/sale-ledger" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key}>
                  <SaleLedger />
                </ProtectedRoute>
              } />
              <Route path="/purchase-ledger" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key}>
                  <PurchaseLedger />
                </ProtectedRoute>
              } />
              <Route path="/due-ledger" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key}>
                  <DueLedger />
                </ProtectedRoute>
              } />
              <Route path="/expense-ledger" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.FINANCE.subFeatures.VIEW_LEDGERS.key}>
                  <ExpenseLedger />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.CRM.subFeatures.VIEW_CUSTOMERS.key}>
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="/stock" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.INVENTORY.subFeatures.VIEW_STOCK.key}>
                  <StockReport />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.INVENTORY.subFeatures.VIEW_STOCK.key}>
                  <ProductList />
                </ProtectedRoute>
              } />
              <Route path="/production" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.INVENTORY.subFeatures.PRODUCTION.key}>
                  <Production />
                </ProtectedRoute>
              } />
              <Route path="/transfer" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.INVENTORY.subFeatures.TRANSFER.key}>
                  <ProductTransfer />
                </ProtectedRoute>
              } />
              <Route path="/stores" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN.subFeatures.MANAGE_STORES.key}>
                  <StoreManagement />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.HR.subFeatures.MANAGE_STAFF.key}>
                  <EmployeeManagement />
                </ProtectedRoute>
              } />
              <Route path="/access" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN.subFeatures.ACCESS_CONTROL.key}>
                  <AppAccess />
                </ProtectedRoute>
              } />
              <Route path="/communication" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.CRM.subFeatures.COMMUNICATION.key}>
                  <Communication />
                </ProtectedRoute>
              } />
              <Route path="/marketing" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.CRM.subFeatures.MARKETING.key}>
                  <Marketing />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.REPORTS.subFeatures.VIEW_REPORTS.key}>
                  <BusinessReports />
                </ProtectedRoute>
              } />
              <Route path="/shop" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.ONLINE_SHOP.subFeatures.MANAGE_SHOP.key}>
                  <OnlineShop />
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.CRM.subFeatures.SUPPORT.key}>
                  <CustomerSupport />
                </ProtectedRoute>
              } />
              <Route path="/bin" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN.subFeatures.RECYCLE_BIN.key}>
                  <RecycleBin />
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute requiredPermission={PERMISSIONS.ADMIN.subFeatures.SUBSCRIPTION.key}>
                  <Subscription />
                </ProtectedRoute>
              } />
              <Route path="/training" element={<PlaceholderPage title="App Training" />} />
              <Route path="/printer" element={<PlaceholderPage title="Printer Config" />} />
            </>
          )}

          {/* Shared Routes */}
          <Route path="/settings" element={
            <ProtectedRoute requiredPermission={
              isSaaSUser 
                ? PERMISSIONS.SAAS.subFeatures.SETTINGS.key 
                : PERMISSIONS.ADMIN.subFeatures.SETTINGS.key
            }>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <AuthProvider>
          <StoreProvider>
            <DataProvider>
              <AppContent />
            </DataProvider>
          </StoreProvider>
        </AuthProvider>
      </NotificationProvider>
    </SettingsProvider>
  );
};

export default App;
