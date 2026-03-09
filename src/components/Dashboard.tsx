
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingCart, DollarSign, Package, Wallet, CreditCard, 
  Zap, ShoppingBag, BookOpen, ClipboardList, FileText, Users, Box, 
  Printer, Megaphone, Globe, 
  Trash2, Menu, X, Bot, Settings, UserCircle, Video, ShieldCheck, Search, 
  ArrowRightLeft, Store, Shield, Crown, LogOut, RotateCcw, Briefcase, 
  Factory, ChevronLeft, ChevronRight, Home, Grid, MoreHorizontal, MessageSquare, ChevronDown, Image, Sparkles, Filter, Calendar, WifiOff, Cloud, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const Dashboard: React.FC = () => {
  const { formatMoney, t, promoSlides } = useSettings();
  const { user, switchBusiness } = useAuth();
  const { transactions, products, financialAccounts, staff } = useData(); 
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBusinessSwitcher, setShowBusinessSwitcher] = useState(false);
  
  // Date Filtering State
  const [filterMode, setFilterMode] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Offline/Backup Status
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success'>('idle');
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);

  useEffect(() => {
      const handleConnectionChange = () => {
          if (navigator.onLine) {
              setBackupStatus('success');
              setTimeout(() => setBackupStatus('idle'), 4000);
              setShowOfflinePopup(false);
          } else {
              checkOfflineStatus();
          }
      };

      const checkOfflineStatus = () => {
          if (user && !user.isPremium) {
              const initDate = new Date(user.initialLoginDate);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - initDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > 14) {
                  setShowOfflinePopup(true);
              }
          }
      };

      if (navigator.onLine) {
          setBackupStatus('success');
          setTimeout(() => setBackupStatus('idle'), 4000);
      } else {
          checkOfflineStatus();
      }

      window.addEventListener('online', handleConnectionChange);
      window.addEventListener('offline', handleConnectionChange);

      return () => {
          window.removeEventListener('online', handleConnectionChange);
          window.removeEventListener('offline', handleConnectionChange);
      };
  }, [user]);

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
      }, 5000);
      return () => clearInterval(timer);
  }, [promoSlides]);

  // --- Real-time Calculations ---
  const stats = useMemo(() => {
      const now = new Date(selectedDate);
      let sales = 0;
      let purchases = 0;
      let expense = 0;
      let cogs = 0; // Cost of Goods Sold

      // 1. Filter Transactions based on Mode
      const periodTransactions = transactions.filter(t => {
          if (t.isDeleted || !t.date) return false;
          const tDate = new Date(t.date);
          
          if (isNaN(tDate.getTime())) return false; // Skip invalid dates
          
          if (filterMode === 'day') {
              return tDate.toISOString().split('T')[0] === selectedDate;
          } else if (filterMode === 'month') {
              return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
          } else {
              return tDate.getFullYear() === now.getFullYear();
          }
      });

      // 2. Sum up Sales, Purchases, Expenses
      periodTransactions.forEach(t => {
          if (t.type === 'Sale') {
              sales += t.amount;
              // Calculate COGS for Profit
              if (t.items) {
                  t.items.forEach(item => {
                      const prod = products.find(p => p.id === item.productId);
                      const unitCost = prod ? prod.purchasePrice : (item.price * 0.7); 
                      cogs += (unitCost * item.qty);
                  });
              } else {
                  cogs += (t.amount * 0.75);
              }
          } else if (t.type === 'Purchase') {
              purchases += t.amount;
          } else if (t.type === 'Expense' || t.type === 'Salary') {
              expense += t.amount;
          }
      });

      // 3. Calculate Total Due
      let totalReceivable = 0;
      
      const customerBalances: Record<string, number> = {};
      transactions.forEach(t => {
          if (t.isDeleted) return;
          
          if (t.type === 'Sale') {
              if (t.paymentMethod === 'Due') {
                  customerBalances[t.entityName] = (customerBalances[t.entityName] || 0) + t.amount;
              } else if ((t.paymentMethod === 'Partial' || t.paymentMethod === 'Installment') && t.dueAmount) {
                  customerBalances[t.entityName] = (customerBalances[t.entityName] || 0) + t.dueAmount;
              }
          } else if (t.type === 'Due') { // Manual Due (Debit)
              customerBalances[t.entityName] = (customerBalances[t.entityName] || 0) + t.amount;
          } else if (t.type === 'Income') { // Collection
              customerBalances[t.entityName] = (customerBalances[t.entityName] || 0) - t.amount;
          } else if (t.type === 'Sales Return') { // Return
              customerBalances[t.entityName] = (customerBalances[t.entityName] || 0) - t.amount;
          }
      });

      Object.values(customerBalances).forEach(bal => {
          if (bal > 0) totalReceivable += bal;
      });

      const netProfit = sales - cogs - expense;

      return {
          sales,
          purchases,
          totalDue: totalReceivable, 
          netProfit
      };
  }, [transactions, products, selectedDate, filterMode]);

  const slide = promoSlides[currentSlide];
  const lastBackupTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const formattedDate = useMemo(() => {
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  }, [selectedDate]);

  const QuickActionCard = ({ icon: Icon, label, desc, onClick, colorClass }: any) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group w-full text-left relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-8 opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2 ${colorClass.replace('bg-', 'text-')}`}>
            <Icon className="w-24 h-24" />
        </div>
        <div className={`p-3 rounded-xl mb-3 ${colorClass} text-white shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{label}</h3>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </button>
  );

  const StatCard = ({ title, amount, icon: Icon, trend, trendVal, color }: any) => (
      <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className={`absolute -right-6 -top-6 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${color} transform rotate-12`}>
              <Icon className="w-24 h-24" />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-slate-50 ${color}`}>
                      <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{title}</span>
              </div>
              <h3 className="text-lg lg:text-3xl font-black text-slate-800 tracking-tight mb-1 lg:mb-2">{amount}</h3>
              <div className="flex items-center gap-1.5 lg:gap-2">
                  <span className={`text-[10px] lg:text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {trendVal}
                  </span>
                  <span className="text-[9px] lg:text-[10px] text-slate-400 font-medium truncate">{t('vs last week')}</span>
              </div>
          </div>
      </div>
  );

  const SalesPerformanceCard = () => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    
    // If owner, show top performer or team total vs team target
    // If employee, show personal target progress
    const isOwner = user?.role === 'Owner';
    const employeeStaff = !isOwner ? staff.find(s => s.name === user?.name) : null;
    
    const target = isOwner 
        ? staff.reduce((sum, s) => sum + (s.salesTarget || 0), 0)
        : (employeeStaff?.salesTarget || 0);

    const achieved = transactions
        .filter(t => t.type === 'Sale' && t.date?.startsWith(currentMonthPrefix) && (isOwner ? true : t.salesperson === user?.name))
        .reduce((sum, t) => sum + t.amount, 0);

    const percentage = target > 0 ? Math.min(100, (achieved / target) * 100) : 0;

    if (target === 0 && !isOwner) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{isOwner ? t('Team Sales Target') : t('My Sales Target')}</h3>
                        <p className="text-slate-400 text-[10px]">{t('Current Month Progress')}</p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${percentage >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {percentage.toFixed(1)}%
                </span>
            </div>
            
            <div className="space-y-3">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('Achieved')}</p>
                        <p className="text-sm font-bold text-slate-800">{formatMoney(achieved)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t('Target')}</p>
                        <p className="text-sm font-bold text-slate-600">{formatMoney(target)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8 relative pb-24 lg:pb-12">
      {/* System Status Popups */}
      {backupStatus === 'success' && (
          <div className="fixed top-20 right-6 bg-white border border-emerald-100 p-4 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-right duration-500">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                  <Cloud className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="text-sm font-bold text-slate-800">{t('System Backup')}</h4>
                  <p className="text-xs text-slate-500">{t('Data successfully synced.')}</p>
              </div>
              <button onClick={() => setBackupStatus('idle')} className="ml-2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
              </button>
          </div>
      )}

      {showOfflinePopup && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-red-600 p-8 text-white text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                          <WifiOff className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">{t('Offline Access Restricted')}</h2>
                      <p className="text-red-100 text-sm mt-2">{t('Connection Required')}</p>
                  </div>
                  <div className="p-8 text-center space-y-6">
                      <div className="p-4 bg-orange-50 text-orange-800 rounded-xl text-sm border border-orange-100 text-left">
                          <p className="font-bold flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4" /> {t('Subscription Notice')}
                          </p>
                          <p className="leading-relaxed">
                              {t('You have been using the free version for more than 14 days. Offline access is now limited to premium users.')}
                          </p>
                      </div>
                      <button 
                          onClick={() => setShowOfflinePopup(false)}
                          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                      >
                          {t('I Understand')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header Section */}
      <div className="mb-2">
          {/* Title & Date */}
          <div className="mb-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {user?.businessName || t('Dashboard')}
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {formattedDate}
              </p>
          </div>

          {/* Controls Container */}
          <div className="flex flex-col gap-3">
              {/* Date Filter Bar */}
              <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                  <div className="flex gap-1 p-1 bg-slate-50 rounded-xl shrink-0">
                      <button onClick={() => setFilterMode('day')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterMode === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('Day')}</button>
                      <button onClick={() => setFilterMode('month')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('Month')}</button>
                      <button onClick={() => setFilterMode('year')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterMode === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('Year')}</button>
                  </div>
                  <div className="h-8 w-px bg-slate-100 mx-1"></div>
                  <div className="flex-1">
                    <input 
                        type={filterMode === 'year' ? 'number' : filterMode === 'month' ? 'month' : 'date'}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 p-0 cursor-pointer text-center"
                    />
                  </div>
              </div>

              {/* Business Profile Card */}
              <div className="relative">
                <div 
                    onClick={() => setShowBusinessSwitcher(!showBusinessSwitcher)}
                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 shrink-0">
                        {user?.businessName?.charAt(0) || 'B'}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold text-slate-800 truncate">{user?.businessName || t('My Business')}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{t('Synced')} {lastBackupTime}</span>
                        </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBusinessSwitcher ? 'rotate-180' : ''}`} />
                </div>

                {showBusinessSwitcher && user?.businesses && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">{t('Switch Business')}</p>
                        <div className="space-y-1">
                            {user.businesses.map(biz => (
                                <button
                                    key={biz.id}
                                    onClick={() => {
                                        switchBusiness(biz.id);
                                        setShowBusinessSwitcher(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${user.businessName === biz.name ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${user.businessName === biz.name ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {biz.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">{biz.name}</p>
                                        <p className="text-[10px] opacity-70">{biz.type}</p>
                                    </div>
                                    {user.businessName === biz.name && <CheckCircle className="w-4 h-4 ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100">
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-indigo-600 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">{t('Add New Business')}</span>
                            </button>
                        </div>
                    </div>
                )}
              </div>
          </div>
      </div>

      {/* Metrics Row - 2 Columns on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <StatCard 
            title={filterMode === 'day' ? t("Today's Sales") : `${filterMode === 'month' ? 'Monthly' : 'Yearly'} Sales`} 
            amount={formatMoney(stats.sales)} 
            icon={TrendingUp} 
            trend="up" 
            trendVal="12%" 
            color="text-emerald-500"
          />
          <StatCard 
            title={filterMode === 'day' ? t("Today's Purchase") : `${filterMode === 'month' ? 'Monthly' : 'Yearly'} Purchase`}
            amount={formatMoney(stats.purchases)} 
            icon={ShoppingCart} 
            trend="down" 
            trendVal="2%" 
            color="text-blue-500"
          />
          <StatCard 
            title={t("Total Due (Receivable)")} 
            amount={formatMoney(stats.totalDue)} 
            icon={Wallet} 
            trend="up" 
            trendVal="5%" 
            color="text-orange-500"
          />
          <StatCard 
            title={t("Net Profit")} 
            amount={formatMoney(stats.netProfit)} 
            icon={DollarSign} 
            trend="up" 
            trendVal="8%" 
            color="text-indigo-500"
          />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Quick Actions & Operations */}
          <div className="xl:col-span-2 space-y-8">
              
              {/* Quick Actions Grid */}
              <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                      {t('Quick Actions')}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <QuickActionCard 
                        label={t('New Sale')} 
                        desc="Create Invoice" 
                        icon={ShoppingBag} 
                        onClick={() => navigate('/sale')}
                        colorClass="bg-indigo-600"
                      />
                      <QuickActionCard 
                        label={t('Purchase')} 
                        desc="Add Stock" 
                        icon={ShoppingCart} 
                        onClick={() => navigate('/purchase')} 
                        colorClass="bg-blue-600"
                      />
                      <QuickActionCard 
                        label={t('Add Product')} 
                        desc="Inventory" 
                        icon={Package} 
                        onClick={() => navigate('/products')} 
                        colorClass="bg-emerald-600"
                      />
                      <QuickActionCard 
                        label={t('Due Ledger')} 
                        desc="Collections" 
                        icon={BookOpen} 
                        onClick={() => navigate('/due-ledger')} 
                        colorClass="bg-rose-600"
                      />
                      <QuickActionCard 
                        label={t('Cash Box')} 
                        desc="Accounts & Cash" 
                        icon={Wallet} 
                        onClick={() => navigate('/cashbox')} 
                        colorClass="bg-amber-600"
                      />
                  </div>
              </div>

              {/* Promo Banner */}
              <div className={`w-full rounded-2xl overflow-hidden shadow-xl relative h-48 lg:h-56 transition-all duration-700 ${slide.color} group`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-0"></div>
                <div className="absolute inset-0 flex items-center justify-between p-8 text-white z-10">
                    <div className="max-w-[70%]">
                        <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block border border-white/20 uppercase tracking-wider">
                            {t('Featured')}
                        </span>
                        <h2 className="text-2xl lg:text-3xl font-black mb-2 leading-tight tracking-tight drop-shadow-sm">{slide.title}</h2>
                        <p className="text-white/90 font-medium mb-6 text-sm lg:text-base opacity-90 line-clamp-2 max-w-md">{slide.desc}</p>
                        <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
                            {t('Explore Now')} <ArrowRightLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <Crown className="w-48 h-48 lg:w-64 lg:h-64 text-white opacity-10 absolute -right-8 -bottom-12 rotate-12 transition-transform group-hover:scale-110 duration-700 blur-sm" />
                
                {/* Indicators */}
                <div className="absolute bottom-6 right-8 flex gap-2 z-20">
                    {promoSlides.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === currentSlide ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                    ))}
                </div>
              </div>

              {/* Recent Transactions Preview */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-lg">{t('Recent Activity')}</h3>
                      <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">{t('View All')}</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                      {transactions.slice(0, 5).map((t, i) => (
                          <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all ${t.type === 'Sale' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100'}`}>
                                  {t.type === 'Sale' ? <ShoppingBag className="w-5 h-5"/> : <FileText className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">{t.type} - {t.entityName}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{t.date} • {t.paymentMethod}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`block text-sm font-bold ${['Sale','Income'].includes(t.type) ? 'text-emerald-600' : 'text-slate-800'}`}>
                                      {['Sale','Income'].includes(t.type) ? '+' : '-'} {formatMoney(t.amount)}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{t.type}</span>
                              </div>
                          </div>
                      ))}
                      {transactions.length === 0 && (
                          <div className="p-8 text-center text-slate-400">{t('No recent transactions')}</div>
                      )}
                  </div>
              </div>
          </div>

          {/* Right Column: Status & Extras */}
          <div className="space-y-6">
              
              {/* AI Assistant Teaser */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl group cursor-pointer hover:shadow-2xl transition-all duration-300" onClick={() => navigate('/ai-chat')}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                              <Sparkles className="w-5 h-5 text-yellow-400" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">{t('AI Hub')}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t('Business Assistant')}</h3>
                      <p className="text-indigo-200 text-sm mb-6 leading-relaxed">{t('Ask Gemini to analyze your sales, generate marketing copy, or predict stock needs.')}</p>
                      <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                          <Bot className="w-4 h-4" /> {t('Open Chat')}
                      </button>
                  </div>
              </div>

              {/* Sales Performance Tracking */}
              <SalesPerformanceCard />

              {/* Subscription Status */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                                  <Crown className="w-5 h-5" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 text-sm">{t('Subscription')}</h3>
                                  <p className="text-slate-400 text-[10px]">{t('Valid until')} Dec 31, 2024</p>
                              </div>
                          </div>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase tracking-wider">Pro</span>
                      </div>
                      
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                  <span>{t('Monthly Usage')}</span>
                                  <span>75%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full w-3/4 shadow-sm"></div>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 text-center">1500 / 2000 {t('AI Requests used')}</p>
                          </div>
                          <button 
                            onClick={() => navigate('/subscription')}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                          >
                            <Crown className="w-4 h-4" /> {t('Manage Subscription')}
                          </button>
                      </div>
                  </div>
              </div>

              {/* Mini Quick Links */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">{t('Shortcuts')}</h3>
                  <div className="space-y-3">
                      <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group">
                          <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{t('Settings')}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => navigate('/employees')} className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group">
                          <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{t('Employees')}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => navigate('/reports')} className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group">
                          <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{t('Reports & Tax')}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
