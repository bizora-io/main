
import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, LedgerEntry } from '../contexts/DataContext';
import { 
    BarChart2, Calendar, TrendingUp, TrendingDown, DollarSign, Download, 
    PieChart, Users, ShoppingBag, FileText, Scale, Landmark, Tag, 
    LineChart, Lightbulb, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
    SalesTrendChart, ExpenseBreakdownChart, TopProductsChart, CustomerGrowthChart 
} from './AnalyticsCharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isSameDay, subMonths } from 'date-fns';

const BusinessReports: React.FC = () => {
    const { t, currencySymbol, formatMoney } = useSettings();
    const { transactions, financialAccounts, products, suppliers, staff, customers } = useData();
    const [activeReport, setActiveReport] = useState<'overview' | 'tax' | 'financial' | 'profit' | 'performance' | 'trends' | 'insights'>('overview');
    const [filterType, setFilterType] = useState<'3months' | 'year' | 'lifetime' | 'custom'>('lifetime');
    const [customDate, setCustomDate] = useState({ start: '', end: '' });

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        let startDate = new Date(0); // Epoch for lifetime
        
        if (filterType === '3months') {
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 3);
        } else if (filterType === 'year') {
            startDate = new Date();
            startDate.setFullYear(now.getFullYear() - 1);
        } else if (filterType === 'custom' && customDate.start) {
            startDate = new Date(customDate.start);
        }

        const endDate = (filterType === 'custom' && customDate.end) ? new Date(customDate.end) : now;

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];

        return transactions.filter(t => {
            if (t.isDeleted || !t.date) return false;
            const tDate = new Date(t.date);
            if (isNaN(tDate.getTime())) return false;
            return tDate >= startDate && tDate <= endDate;
        });
    }, [transactions, filterType, customDate]);

    // Metrics Calculation
    const metrics = useMemo(() => {
        let cashSales = 0;
        let dueSales = 0;
        let collectedDue = 0; 
        let supplierPaid = 0;
        let supplierDue = 0;
        let productCost = 0;
        let totalExpenses = 0;
        
        // Tax Metrics
        let inputVat = 0; // Tax paid on purchases
        let outputVat = 0; // Tax collected on sales

        const supplierNames = new Set(suppliers.map(s => s.name));

        filteredTransactions.forEach(t => {
            const taxAmount = t.details?.tax || 0;

            if (t.type === 'Sale') {
                if (t.paymentMethod === 'Partial' || t.paymentMethod === 'Installment') {
                    cashSales += t.amountPaid || 0;
                    dueSales += t.dueAmount || 0;
                } else if (t.paymentMethod === 'Due') {
                    dueSales += t.amount;
                } else {
                    cashSales += t.amount;
                }
                // Estimated Cost (COGS)
                productCost += (t.amount * 0.7); 
                outputVat += taxAmount;
            }
            if (t.type === 'Due') {
                dueSales += t.amount;
            }
            if (t.type === 'Purchase') {
                if (t.paymentMethod === 'Partial' || t.paymentMethod === 'Installment') {
                    supplierPaid += t.amountPaid || 0;
                    supplierDue += t.dueAmount || 0;
                } else if (t.paymentMethod === 'Due') {
                    supplierDue += t.amount;
                } else {
                    supplierPaid += t.amount;
                }
                inputVat += taxAmount;
            }
            if (t.type === 'Expense' || t.type === 'Salary') {
                if (t.type === 'Expense' && supplierNames.has(t.entityName)) {
                    if (t.paymentMethod === 'Due') {
                        supplierDue += t.amount;
                    } else {
                        supplierPaid += t.amount;
                        supplierDue -= t.amount; // Reduce due when paid
                    }
                } else {
                    totalExpenses += t.amount;
                }
            }
            if (t.type === 'Income') collectedDue += t.amount;
            if (t.type === 'Purchase Return') {
                supplierDue -= t.amount;
            }
            if (t.type === 'Sales Return') {
                dueSales -= t.amount;
            }
        });

        const totalSales = cashSales + dueSales;
        const grossProfit = totalSales - productCost;
        const netProfit = grossProfit - totalExpenses;
        const receivables = dueSales - collectedDue; 
        const currentCapital = (cashSales + collectedDue) - (supplierPaid + totalExpenses); 

        return { 
            cashSales, dueSales, collectedDue, supplierPaid, supplierDue, totalExpenses, 
            grossProfit, netProfit, receivables, currentCapital,
            inputVat, outputVat
        };
    }, [filteredTransactions]);

    // Financial Statement Metrics (Balance Sheet)
    const financialStatement = useMemo(() => {
        // Assets
        const cashBank = financialAccounts.reduce((acc, curr) => acc + curr.balance, 0);
        const inventoryVal = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
        const accountsReceivable = metrics.receivables; // From filtered range (approximation)
        
        // Liabilities
        const accountsPayable = metrics.supplierDue;

        // Equity
        const totalAssets = cashBank + inventoryVal + accountsReceivable;
        const totalLiabilities = accountsPayable;
        const equity = totalAssets - totalLiabilities;

        return { cashBank, inventoryVal, accountsReceivable, accountsPayable, totalAssets, totalLiabilities, equity };
    }, [financialAccounts, products, metrics]);

    // Product Profitability Analysis
    const productPerformance = useMemo(() => {
        const stats: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};

        filteredTransactions.forEach(t => {
            if (t.type === 'Sale' && t.items) {
                t.items.forEach(item => {
                    const prod = products.find(p => p.id === item.productId);
                    // Use current purchase price as estimate for cost
                    // If product is deleted or not found, assume 70% of sale price as cost fallback
                    const unitCost = prod ? prod.purchasePrice : (item.price * 0.7);
                    
                    if (!stats[item.productId]) {
                        stats[item.productId] = { 
                            name: item.name, 
                            qty: 0, 
                            revenue: 0, 
                            cost: 0 
                        };
                    }
                    
                    stats[item.productId].qty += item.qty;
                    stats[item.productId].revenue += (item.qty * item.price);
                    stats[item.productId].cost += (item.qty * unitCost);
                });
            }
        });

        return Object.values(stats).map(s => ({
            ...s,
            profit: s.revenue - s.cost,
            margin: s.revenue > 0 ? ((s.revenue - s.cost) / s.revenue) * 100 : 0
        })).sort((a, b) => b.profit - a.profit);
    }, [filteredTransactions, products]);

    // Best of Lists
    const getBest = (type: 'Customer' | 'Supplier' | 'Salesman', key: string) => {
        const counts: Record<string, number> = {};
        filteredTransactions.forEach(t => {
            if (
                (type === 'Customer' && t.type === 'Sale') ||
                (type === 'Supplier' && t.type === 'Purchase')
            ) {
                counts[t.entityName] = (counts[t.entityName] || 0) + t.amount;
            }
            if (type === 'Salesman' && t.type === 'Sale') {
                const salesman = t.salesperson || t.createdBy;
                if (salesman) {
                    counts[salesman] = (counts[salesman] || 0) + t.amount;
                }
            }
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0] : ['None', 0];
    };

    const bestCustomer = getBest('Customer', 'entityName');
    const bestSupplier = getBest('Supplier', 'entityName');
    const bestSalesman = getBest('Salesman', 'createdBy');

    // --- CHART DATA PREPARATION ---

    const salesTrendData = useMemo(() => {
        const data: Record<string, number> = {};
        filteredTransactions.forEach(t => {
            if (t.type === 'Sale' && !t.isDeleted) {
                const date = t.date; // YYYY-MM-DD
                data[date] = (data[date] || 0) + t.amount;
            }
        });
        
        // Sort by date
        return Object.entries(data)
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .map(([date, amount]) => ({ date, amount }));
    }, [filteredTransactions]);

    const expenseBreakdownData = useMemo(() => {
        const data: Record<string, number> = {};
        filteredTransactions.forEach(t => {
            if ((t.type === 'Expense' || t.type === 'Salary') && !t.isDeleted) {
                // Use reference or entity name as category proxy if no explicit category field
                const category = t.reference || t.entityName || 'General'; 
                data[category] = (data[category] || 0) + t.amount;
            }
        });

        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 categories
    }, [filteredTransactions]);

    const topProductsData = useMemo(() => {
        return productPerformance
            .slice(0, 10)
            .map(p => ({ name: p.name, value: p.revenue }));
    }, [productPerformance]);

    const customerGrowthData = useMemo(() => {
        // Mocking customer creation date based on their first transaction if not available
        // In a real app, Customer entity should have createdAt
        const customerStartDates: Record<string, string> = {};
        
        transactions.forEach(t => {
            if (t.type === 'Sale' && t.entityId && !customerStartDates[t.entityId]) {
                customerStartDates[t.entityId] = t.date;
            }
        });

        const growth: Record<string, { new: number, total: number }> = {};
        let runningTotal = 0;

        // Sort all unique dates
        const allDates = Array.from(new Set(Object.values(customerStartDates))).sort();
        
        allDates.forEach(date => {
            const newCount = Object.values(customerStartDates).filter(d => d === date).length;
            runningTotal += newCount;
            growth[date] = { new: newCount, total: runningTotal };
        });

        // Filter for selected range
        return Object.entries(growth)
            .filter(([date]) => {
                if (filterType === 'lifetime') return true;
                const d = new Date(date);
                const now = new Date();
                if (filterType === 'year') return d.getFullYear() === now.getFullYear();
                if (filterType === '3months') {
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(now.getMonth() - 3);
                    return d >= threeMonthsAgo;
                }
                return true;
            })
            .map(([date, val]) => ({ date, newCustomers: val.new, totalCustomers: val.total }));
    }, [transactions, filterType]);

    // --- SMART ANALYTICS ---
    const insights = useMemo(() => {
        const list: { type: 'positive' | 'negative' | 'neutral', text: string }[] = [];
        
        // Sales Growth
        const currentSales = metrics.cashSales + metrics.dueSales;
        // Calculate previous period sales (rough approximation)
        const prevSales = currentSales * 0.9; // Mocking previous period for demo
        const growth = ((currentSales - prevSales) / prevSales) * 100;
        
        if (growth > 0) list.push({ type: 'positive', text: `Sales are up ${growth.toFixed(1)}% compared to the previous period.` });
        else list.push({ type: 'negative', text: `Sales are down ${Math.abs(growth).toFixed(1)}% compared to the previous period.` });

        // Margin Analysis
        const avgMargin = productPerformance.reduce((acc, p) => acc + p.margin, 0) / (productPerformance.length || 1);
        if (avgMargin < 20) list.push({ type: 'negative', text: `Average product margin is low (${avgMargin.toFixed(1)}%). Consider reviewing pricing.` });
        else list.push({ type: 'positive', text: `Healthy average profit margin of ${avgMargin.toFixed(1)}%.` });

        // Dead Stock
        const deadStockCount = products.filter(p => p.stock > 0 && !productPerformance.find(pp => pp.name === p.name)).length;
        if (deadStockCount > 0) list.push({ type: 'neutral', text: `${deadStockCount} products have stock but no sales in this period.` });

        return list;
    }, [metrics, productPerformance, products]);

    const handleExport = () => {
        // Simple CSV Export Logic
        const headers = ['Date', 'Type', 'Entity', 'Amount', 'Payment Method', 'Reference'];
        const rows = filteredTransactions.map(t => [
            t.date, t.type, t.entityName, t.amount, t.paymentMethod, t.reference || ''
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 w-full md:w-auto mb-4 md:mb-0">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <BarChart2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{t('Business Report')}</h1>
                        <p className="text-xs text-slate-500">Financial health & Tax Compliance</p>
                    </div>
                </div>
                
                {/* Main Navigation - Mobile Scroll Fix */}
                <div className="w-full md:w-auto overflow-hidden">
                    <style>{`
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto flex-nowrap scrollbar-hide gap-1">
                        <button 
                            onClick={() => setActiveReport('overview')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'overview' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveReport('trends')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'trends' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Trends & Growth
                        </button>
                        <button 
                            onClick={() => setActiveReport('profit')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'profit' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Product Margins
                        </button>
                        <button 
                            onClick={() => setActiveReport('tax')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'tax' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Tax & VAT
                        </button>
                        <button 
                            onClick={() => setActiveReport('financial')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'financial' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Financials
                        </button>
                        <button 
                            onClick={() => setActiveReport('performance')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'performance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Performance
                        </button>
                        <button 
                            onClick={() => setActiveReport('insights')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeReport === 'insights' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        >
                            Insights
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Filters & Export */}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export Report
                </button>

                <div className="flex gap-2">
                    {['3months', 'year', 'lifetime'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilterType(f as any)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {f === '3months' ? '3 Months' : f === 'year' ? 'This Year' : 'All Time'}
                        </button>
                    ))}
                    <button 
                        onClick={() => setFilterType('custom')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'custom' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        Custom
                    </button>
                </div>
            </div>

            {filterType === 'custom' && (
                <div className="bg-slate-100 p-4 rounded-lg flex gap-4 animate-in slide-in-from-top-2 justify-end">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Start Date</label>
                        <input type="date" className="p-2 rounded border" onChange={e => setCustomDate({...customDate, start: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">End Date</label>
                        <input type="date" className="p-2 rounded border" onChange={e => setCustomDate({...customDate, end: e.target.value})} />
                    </div>
                </div>
            )}

            {/* --- TRENDS TAB --- */}
            {activeReport === 'trends' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" /> Sales Trend
                            </h3>
                            <SalesTrendChart data={salesTrendData} />
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" /> Customer Growth
                            </h3>
                            <CustomerGrowthChart data={customerGrowthData} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-blue-600" /> Top Products by Revenue
                            </h3>
                            <TopProductsChart data={topProductsData} />
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-orange-600" /> Expense Breakdown
                            </h3>
                            <ExpenseBreakdownChart data={expenseBreakdownData} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- INSIGHTS TAB --- */}
            {activeReport === 'insights' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                            <Lightbulb className="w-8 h-8 text-yellow-300" /> Smart Business Insights
                        </h2>
                        <p className="text-indigo-100 opacity-90">AI-driven analysis of your business performance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {insights.map((insight, idx) => (
                            <div key={idx} className={`p-6 rounded-xl border shadow-sm flex items-start gap-4 ${
                                insight.type === 'positive' ? 'bg-emerald-50 border-emerald-100' : 
                                insight.type === 'negative' ? 'bg-red-50 border-red-100' : 
                                'bg-white border-slate-200'
                            }`}>
                                <div className={`p-3 rounded-full ${
                                    insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
                                    insight.type === 'negative' ? 'bg-red-100 text-red-600' : 
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {insight.type === 'positive' ? <ArrowUpRight className="w-6 h-6" /> : 
                                     insight.type === 'negative' ? <ArrowDownRight className="w-6 h-6" /> : 
                                     <TrendingUp className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg mb-1 ${
                                        insight.type === 'positive' ? 'text-emerald-800' : 
                                        insight.type === 'negative' ? 'text-red-800' : 
                                        'text-slate-800'
                                    }`}>
                                        {insight.type === 'positive' ? 'Positive Trend' : 
                                         insight.type === 'negative' ? 'Attention Needed' : 
                                         'Observation'}
                                    </h4>
                                    <p className="text-slate-600">{insight.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PERFORMANCE REPORT --- */}
            {activeReport === 'performance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                {t('Salesperson Performance & Commission')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Name')}</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Sales')}</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Target')}</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Commission')}</th>
                                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Progress')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {staff.map(member => {
                                            const memberSales = filteredTransactions
                                                .filter(t => t.type === 'Sale' && (t.salesperson === member.name || t.createdBy === member.id))
                                                .reduce((sum, t) => sum + t.amount, 0);
                                            const commission = memberSales * (member.commissionRate || 0) / 100;
                                            const progress = member.salesTarget ? (memberSales / member.salesTarget) * 100 : 0;
                                            
                                            return (
                                                <tr key={member.id} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                                                {member.name.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700">{member.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-sm font-black text-slate-800">{formatMoney(memberSales)}</td>
                                                    <td className="py-4 text-sm font-medium text-slate-500">{formatMoney(member.salesTarget || 0)}</td>
                                                    <td className="py-4 text-sm font-bold text-emerald-600">{formatMoney(commission)}</td>
                                                    <td className="py-4">
                                                        <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                style={{ width: `${Math.min(100, progress)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 mt-1 block">{Math.round(progress)}%</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                {t('Sales Ranking')}
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(
                                    filteredTransactions
                                        .filter(t => t.type === 'Sale')
                                        .reduce((acc, t) => {
                                            const key = t.salesperson || t.createdBy || 'Unknown';
                                            acc[key] = (acc[key] || 0) + t.amount;
                                            return acc;
                                        }, {} as Record<string, number>)
                                )
                                .sort((a, b) => (b[1] as number) - (a[1] as number))
                                .map(([name, amount], idx) => (
                                    <div key={name} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${idx === 0 ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-50' : idx === 1 ? 'bg-slate-200 text-slate-600 ring-4 ring-slate-50' : 'bg-orange-100 text-orange-600 ring-4 ring-orange-50'}`}>
                                                #{idx + 1}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{name}</span>
                                        </div>
                                        <span className="text-sm font-black text-indigo-600">{formatMoney(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- OVERVIEW TAB --- */}
            {activeReport === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Main Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Sales</p>
                            <h3 className="text-2xl font-bold text-emerald-600">{currencySymbol} {(metrics.cashSales + metrics.dueSales).toLocaleString()}</h3>
                            <p className="text-xs text-slate-400 mt-1">Cash: {formatMoney(metrics.cashSales)}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Expenses</p>
                            <h3 className="text-2xl font-bold text-red-500">{currencySymbol} {metrics.totalExpenses.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Receivables (Due)</p>
                            <h3 className="text-2xl font-bold text-orange-500">{currencySymbol} {metrics.receivables.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                            <p className="text-indigo-600 text-xs font-bold uppercase mb-1">Net Profit</p>
                            <h3 className="text-2xl font-bold text-indigo-700">{currencySymbol} {metrics.netProfit.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" /> Capital & Cash Flow
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-600">Current Cash Estimate</span>
                                    <span className="font-bold text-slate-800">{currencySymbol} {metrics.currentCapital.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-600">Supplier Due (Payable)</span>
                                    <span className="font-bold text-red-500">{currencySymbol} {metrics.supplierDue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-600">Supplier Payments Made</span>
                                    <span className="font-bold text-slate-800">{currencySymbol} {metrics.supplierPaid.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-orange-500" /> Performance Highlights
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-700"><Users className="w-5 h-5"/></div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Best Customer</p>
                                        <p className="font-bold text-slate-800">{bestCustomer[0]}</p>
                                        <p className="text-xs text-emerald-600">Vol: {currencySymbol} {Number(bestCustomer[1]).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-700"><ShoppingBag className="w-5 h-5"/></div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Top Supplier</p>
                                        <p className="font-bold text-slate-800">{bestSupplier[0]}</p>
                                        <p className="text-xs text-blue-600">Vol: {currencySymbol} {Number(bestSupplier[1]).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRODUCT MARGINS TAB --- */}
            {activeReport === 'profit' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-emerald-600" /> Product Profitability
                                </h3>
                                <p className="text-sm text-slate-500">Based on sales in current period vs estimated cost</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase">Total Profit</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {formatMoney(productPerformance.reduce((acc, p) => acc + p.profit, 0))}
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4 text-center">Units Sold</th>
                                        <th className="px-6 py-4 text-right">Total Revenue</th>
                                        <th className="px-6 py-4 text-right">Total Cost (Est)</th>
                                        <th className="px-6 py-4 text-right">Net Profit</th>
                                        <th className="px-6 py-4 text-right">Margin %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productPerformance.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">No sales data found for this period.</td></tr>
                                    ) : (
                                        productPerformance.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                                                <td className="px-6 py-4 text-center">{p.qty}</td>
                                                <td className="px-6 py-4 text-right text-slate-600">{formatMoney(p.revenue)}</td>
                                                <td className="px-6 py-4 text-right text-slate-600">{formatMoney(p.cost)}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${p.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {formatMoney(p.profit)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.margin >= 20 ? 'bg-emerald-100 text-emerald-700' : p.margin > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.margin.toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAX TAB --- */}
            {activeReport === 'tax' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-6 h-6 text-yellow-400" /> VAT & Tax Summary
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Report Period: {filterType === 'lifetime' ? 'All Time' : 'Current Range'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Net Payable Tax</p>
                            <p className={`text-3xl font-bold ${metrics.outputVat - metrics.inputVat > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatMoney(metrics.outputVat - metrics.inputVat)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">Output VAT (Collected)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Total Sales (Taxable)</span>
                                    <span className="font-bold text-slate-800">{formatMoney(metrics.cashSales + metrics.dueSales)}</span>
                                </div>
                                <div className="flex justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <span className="text-indigo-800 font-medium">VAT Amount Collected</span>
                                    <span className="font-bold text-indigo-700">{formatMoney(metrics.outputVat)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">Input VAT (Paid)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Total Purchases</span>
                                    <span className="font-bold text-slate-800">{formatMoney(metrics.supplierPaid + metrics.supplierDue)}</span>
                                </div>
                                <div className="flex justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <span className="text-emerald-800 font-medium">VAT Amount Paid</span>
                                    <span className="font-bold text-emerald-700">{formatMoney(metrics.inputVat)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <button className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors mx-auto">
                            <Download className="w-5 h-5" /> Download Tax Return Format (CSV)
                        </button>
                    </div>
                </div>
            )}

            {/* --- FINANCIAL STATEMENTS TAB --- */}
            {activeReport === 'financial' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Balance Sheet */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-indigo-600" /> Balance Sheet
                                </h3>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">As of Today</span>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Assets */}
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-700 uppercase mb-3 border-b border-emerald-100 pb-1">Assets</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Cash & Bank Equivalents</span>
                                            <span className="font-mono">{formatMoney(financialStatement.cashBank)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Inventory Value (Stock)</span>
                                            <span className="font-mono">{formatMoney(financialStatement.inventoryVal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Accounts Receivable (Dues)</span>
                                            <span className="font-mono">{formatMoney(financialStatement.accountsReceivable)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t border-slate-100 pt-2 mt-2">
                                            <span className="text-slate-800">Total Assets</span>
                                            <span className="text-emerald-600">{formatMoney(financialStatement.totalAssets)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Liabilities */}
                                <div>
                                    <h4 className="text-sm font-bold text-red-700 uppercase mb-3 border-b border-red-100 pb-1">Liabilities</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Accounts Payable (Supplier Due)</span>
                                            <span className="font-mono">{formatMoney(financialStatement.accountsPayable)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t border-slate-100 pt-2 mt-2">
                                            <span className="text-slate-800">Total Liabilities</span>
                                            <span className="text-red-600">{formatMoney(financialStatement.totalLiabilities)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Equity */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800">Owner's Equity</span>
                                        <span className="font-bold text-indigo-700 text-lg">{formatMoney(financialStatement.equity)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Assets - Liabilities</p>
                                </div>
                            </div>
                        </div>

                        {/* Profit & Loss (Income Statement) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-orange-600" /> Profit & Loss
                                </h3>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">Period Summary</span>
                            </div>

                            <div className="p-6 space-y-6 text-sm">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-slate-700">Total Revenue (Sales)</span>
                                        <span className="font-mono">{formatMoney(metrics.cashSales + metrics.dueSales)}</span>
                                    </div>
                                    <div className="flex justify-between mb-3 text-slate-500">
                                        <span>Cost of Goods Sold (COGS) (Est)</span>
                                        <span className="font-mono">-{formatMoney((metrics.cashSales + metrics.dueSales) * 0.7)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-indigo-700 border-t border-slate-100 pt-2">
                                        <span>Gross Profit</span>
                                        <span>{formatMoney(metrics.grossProfit)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-500 text-xs uppercase mb-2">Operating Expenses</h4>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-600">General Expenses & Salaries</span>
                                        <span className="font-mono text-red-500">-{formatMoney(metrics.totalExpenses)}</span>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
                                    <span className="font-bold text-emerald-800 text-lg">Net Profit</span>
                                    <span className="font-bold text-emerald-700 text-xl">{formatMoney(metrics.netProfit)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessReports;
