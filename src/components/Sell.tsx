
import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useData, LedgerEntry, Product, Entity, Installment } from '../contexts/DataContext';
import { UserRole, Staff } from '../types';
import { 
  ShoppingBag, User, Plus, Trash2, Search, Barcode, Box, 
  ArrowRight, CheckCircle, X, ShoppingCart, Download, History,
  AlertTriangle, Users, Minus, Wallet, CreditCard, ChevronLeft,
  Settings, ShieldCheck, Hash, Tag, Truck, Calendar
} from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';

const Sell: React.FC = () => {
  const { t, formatMoney, currencySymbol } = useSettings();
  const { user } = useAuth();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<LedgerEntry[]>([]);
  const { transactions, products, customers, staff, updateProductStock, addEntity, addTransaction, promoCodes } = useData();

  const activeBusiness = useMemo(() => 
    user?.businesses?.find(b => b.name === user.businessName) || user?.businesses?.[0]
  , [user]);
  
  const bizSettings = activeBusiness?.settings;

  // --- View State ---
  const [activeView, setActiveView] = useState<'products' | 'checkout'>('products');
  
  // --- Transaction State ---
  const [cart, setCart] = useState<{
      id: string, name: string, stock: number, qty: number, price: number, 
      serialNumbers: string[], warranty?: string, image?: string, category?: string
  }[]>([]);
  
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Customer State
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerMobile, setCustomerMobile] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Payment State
  const [payments, setPayments] = useState<{method: string, amount: number}[]>([{method: 'Cash', amount: 0}]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [tax, setTax] = useState(0);
  const [miscLabel, setMiscLabel] = useState('');
  const [miscAmount, setMiscAmount] = useState(0);

  // Installment State
  const [installmentCount, setInstallmentCount] = useState(3);
  const [installmentFrequency, setInstallmentFrequency] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
  });

  // Order Details State
  const [salesperson, setSalesperson] = useState(() => {
    if (user?.role === UserRole.OWNER) return 'Counter';
    return user?.name || 'Counter';
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [orderTags, setOrderTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [autoSendInvoice, setAutoSendInvoice] = useState(false);

  // --- UI & Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<Entity[]>([]);
  
  // Modals
  const [duplicateMatch, setDuplicateMatch] = useState<Entity | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<LedgerEntry | null>(null);
  
  // Item Extras Modal
  const [extrasModal, setExtrasModal] = useState<{show: boolean, itemId: string | null}>({ show: false, itemId: null });
  const [tempWarranty, setTempWarranty] = useState('');
  const [tempSns, setTempSns] = useState<string[]>([]);

  const [previousDue, setPreviousDue] = useState(0);

  // --- Derived Data ---
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  // Calculate Previous Due when customer changes
  useEffect(() => {
      if (selectedCustomerId) {
          const customerTransactions = transactions.filter(t => 
              t.entityId === selectedCustomerId || t.entityName === customerName
          );
          
          const totalDue = customerTransactions
              .filter(t => (t.type === 'Sale' || t.type === 'Due') && (t.dueAmount || 0) > 0)
              .reduce((sum, t) => sum + (t.dueAmount || 0), 0);
          
          const totalPaid = customerTransactions
              .filter(t => t.type === 'Income')
              .reduce((sum, t) => sum + t.amount, 0);

          const totalReturned = customerTransactions
              .filter(t => t.type === 'Sales Return')
              .reduce((sum, t) => sum + t.amount, 0);

          // Net Due = (Sales Due + Opening Due) - (Payments + Returns)
          setPreviousDue(totalDue - totalPaid - totalReturned);
      } else {
          setPreviousDue(0);
      }
  }, [selectedCustomerId, customerName, transactions]);

  const filteredProducts = useMemo(() => {
      return products.filter(p => {
          if (p.isDeleted) return false;
          const searchLower = searchTerm.toLowerCase();
          const matchSearch = p.name.toLowerCase().includes(searchLower) || p.id.includes(searchLower);
          const matchCat = categoryFilter ? p.category === categoryFilter : true;
          return matchSearch && matchCat;
      });
  }, [products, searchTerm, categoryFilter]);

  const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
  
  // Apply coupon logic
  const couponDiscount = useMemo(() => {
    const promo = promoCodes.find(p => p.code.toUpperCase() === couponCode.toUpperCase() && p.status === 'active');
    if (promo) {
        return promo.type === 'percentage' ? (subtotal * promo.discount / 100) : promo.discount;
    }
    return 0;
  }, [couponCode, subtotal, promoCodes]);

  const totalDiscount = discount + couponDiscount;
  const grandTotal = Math.max(0, subtotal - totalDiscount + tax + miscAmount);
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const calculatedDue = grandTotal - totalPaid;

  // --- VALIDATION: Due Sale Enforcement ---
  const isDueError = (calculatedDue > 0) && (customerName.trim() === 'Walk-in Customer' || !customerName.trim());

  // --- Effects ---

  // Auto-suggest customers when typing
  useEffect(() => {
      if (!selectedCustomerId && customerName && customerName !== 'Walk-in Customer') {
          const lowerTerm = customerName.toLowerCase();
          const matches = customers.filter(c => 
              !c.isDeleted && 
              (c.name.toLowerCase().includes(lowerTerm) || c.mobile?.includes(lowerTerm))
          ).slice(0, 5);
          setCustomerSuggestions(matches);
      } else {
          setCustomerSuggestions([]);
      }
  }, [customerName, selectedCustomerId, customers]);

  // Apply default tax rate from business settings
  useEffect(() => {
      if (bizSettings?.taxRate && subtotal > 0) {
          const calculatedTax = (subtotal * bizSettings.taxRate) / 100;
          setTax(Number(calculatedTax.toFixed(2)));
      }
  }, [bizSettings?.taxRate, subtotal]);

  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth >= 768) {
              setActiveView('products'); 
          }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Handlers ---

  const addToCart = (product: Product) => {
      if (product.stock <= 0) return; 
      
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
          if (existing.qty + 1 > product.stock) {
              alert(`Insufficient stock! Max available: ${product.stock}`);
              return;
          }
          setCart(cart.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item));
      } else {
          setCart([...cart, { 
              ...product, 
              qty: 1, 
              price: product.salePrice,
              serialNumbers: [],
              warranty: product.warranty ? (product.warrantyPeriod || 'Yes') : undefined
          }]);
      }
  };

  const updateQty = (id: string, delta: number) => {
      const item = cart.find(i => i.id === id);
      if (!item) return;

      const newQty = item.qty + delta;
      if (newQty <= 0) {
          setCart(cart.filter(i => i.id !== id));
      } else if (newQty > item.stock) {
          alert(`Max stock: ${item.stock}`);
      } else {
          setCart(cart.map(i => i.id === id ? { ...i, qty: newQty } : i));
      }
  };

  const updateItemPrice = (id: string, newPrice: string) => {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) return;
      setCart(cart.map(item => item.id === id ? { ...item, price } : item));
  };

  const openExtrasModal = (itemId: string) => {
      const item = cart.find(i => i.id === itemId);
      if (item) {
          setTempWarranty(item.warranty || '');
          // Initialize SNs array to match quantity
          const currentSns = item.serialNumbers || [];
          const paddedSns = Array(item.qty).fill('').map((_, i) => currentSns[i] || '');
          setTempSns(paddedSns);
          setExtrasModal({ show: true, itemId });
      }
  };

  const saveExtras = () => {
      if (extrasModal.itemId) {
          setCart(cart.map(item => 
              item.id === extrasModal.itemId 
              ? { ...item, warranty: tempWarranty, serialNumbers: tempSns.filter(s => s.trim()) } 
              : item
          ));
      }
      setExtrasModal({ show: false, itemId: null });
  };

  const handleSnChange = (index: number, val: string) => {
      const newSns = [...tempSns];
      newSns[index] = val;
      setTempSns(newSns);
  };

  const handleCustomerSelect = (customer: Entity) => {
      setCustomerName(customer.name);
      setCustomerMobile(customer.mobile || '');
      setSelectedCustomerId(customer.id);
      setCustomerSuggestions([]);
      
      // Load history
      const history = transactions.filter(t => t.entityName === customer.name && t.type === 'Sale');
      setCustomerHistory(history);
  };

  const handleNameChange = (val: string) => {
      setCustomerName(val);
      setSelectedCustomerId(null); 
  };

  // --- CORE CHECKOUT LOGIC ---
  const handleCheckoutClick = () => {
      if (cart.length === 0) return;
      if (isDueError) return; 

      if (!selectedCustomerId && customerName.trim() !== 'Walk-in Customer') {
          const exactMatch = customers.find(c => c.name.toLowerCase() === customerName.trim().toLowerCase());
          if (exactMatch) {
              setDuplicateMatch(exactMatch);
              return;
          }
      }
      finalizeTransaction(selectedCustomerId, customerName, customerMobile);
  };

  const handleDuplicateResolution = (resolution: 'yes' | 'no') => {
      if (resolution === 'yes' && duplicateMatch) {
          finalizeTransaction(duplicateMatch.id, duplicateMatch.name, duplicateMatch.mobile || customerMobile);
      } else {
          setDuplicateMatch(null);
      }
  };

  const handleAddPayment = () => {
    const currentPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    // Default to paying off the entire outstanding amount (Current Bill + Previous Due)
    const remaining = (grandTotal + previousDue) - currentPaid;
    if (remaining <= 0) return;
    setPayments([...payments, { method: 'Cash', amount: remaining }]);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleUpdatePayment = (index: number, field: 'method' | 'amount', value: any) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const finalizeTransaction = (finalId: string | null, finalName: string, finalMobile: string) => {
        if (!finalId && finalName !== 'Walk-in Customer') {
            finalId = Date.now().toString();
            addEntity({
                id: finalId,
                name: finalName,
                mobile: finalMobile,
                type: 'Customer'
            });
        }

        const prefix = bizSettings?.invoicePrefix || 'INV';
        const timestamp = Date.now().toString().slice(-6);
        const reference = `${prefix}-${timestamp}`;

        let installments: Installment[] = [];
        if (payments.some(p => p.method === 'Installment') && calculatedDue > 0) {
            const amountPerInstallment = calculatedDue / installmentCount;
            installments = Array.from({ length: installmentCount }).map((_, i) => {
                const date = new Date(firstInstallmentDate);
                if (installmentFrequency === 'Monthly') {
                    date.setMonth(date.getMonth() + i);
                } else {
                    date.setDate(date.getDate() + (i * 7));
                }
                return {
                    id: `${Date.now()}-${i}`,
                    dueDate: date.toISOString().split('T')[0],
                    amount: parseFloat(amountPerInstallment.toFixed(2)),
                    status: 'Pending'
                };
            });
        }

        const transaction: LedgerEntry = {
            id: Date.now().toString(),
            date: invoiceDate,
            entityId: finalId || undefined,
            entityName: finalName,
            entityMobile: finalMobile,
            type: 'Sale',
            amount: grandTotal,
            paymentMethod: payments.length > 1 ? 'Partial' : (payments[0].method as any),
            amountPaid: totalPaid,
            dueAmount: calculatedDue,
            previousDue: previousDue,
            reference: reference,
            salesperson: salesperson,
            notes: orderNotes,
            deliveryInstructions: deliveryInstructions,
            tags: orderTags,
            installments: installments.length > 0 ? installments : undefined,
            items: cart.map(c => ({
              productId: c.id,
              name: c.name,
              qty: c.qty,
              price: c.price,
              total: c.qty * c.price,
              warranty: c.warranty,
              serialNumbers: c.serialNumbers
          })),
          details: { subtotal, discount: totalDiscount, tax, delivery: miscAmount },
          timeline: [
            { status: 'Order Created', date: new Date().toISOString(), user: user?.name, note: 'Sale processed via POS' }
          ]
      };

      cart.forEach(item => updateProductStock(item.id, item.qty, 'decrease'));
      addTransaction(transaction);
      
      setGeneratedInvoice(transaction);
      setShowInvoice(true);
      setDuplicateMatch(null);
      
      // Reset
      setCart([]);
      setCustomerName('Walk-in Customer');
      setCustomerMobile('');
      setSelectedCustomerId(null);
      setPayments([{method: 'Cash', amount: 0}]);
      setSalesperson(user?.name || '');
      setDiscount(0);
      setCouponCode('');
      setTax(0);
      setMiscLabel('');
      setMiscAmount(0);
      setAutoSendInvoice(false);
      setOrderNotes('');
      setDeliveryInstructions('');
      setOrderTags([]);
      setTagInput('');
      setActiveView('products');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
        
        {/* --- MAIN LAYOUT --- */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT: PRODUCT CATALOG */}
            <div className={`flex-1 flex flex-col bg-slate-50/50 transition-all duration-300 ${activeView === 'checkout' ? 'hidden md:flex' : 'flex'}`}>
                
                {/* Search & Filter Header */}
                <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-20 flex flex-col gap-3 shrink-0">
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder={t('Search products...')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                            <Barcode className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                        <button 
                            onClick={() => setCategoryFilter('')} 
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${!categoryFilter ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            {t('All Items')}
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setCategoryFilter(cat)} 
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${categoryFilter === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-2 md:p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-32 md:pb-4">
                        {filteredProducts.map(product => {
                            const inCart = cart.find(c => c.id === product.id);
                            return (
                                <div 
                                    key={product.id} 
                                    onClick={() => addToCart(product)}
                                    className={`group relative bg-white rounded-2xl p-3 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full active:scale-[0.98] ${inCart ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200'}`}
                                >
                                    {/* Stock Badge */}
                                    <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md ${product.stock <= 5 ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-700'}`}>
                                        {product.stock} {t('Stock Level')}
                                    </div>

                                    {/* Qty Badge */}
                                    {inCart && (
                                        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                                            {inCart.qty}
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className="aspect-square bg-slate-50 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                        {product.image ? (
                                            <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.name} />
                                        ) : (
                                            <Box className="w-10 h-10 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium mb-2 hidden md:block uppercase tracking-wider">{product.category}</p>
                                        
                                        <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('Price')}</span>
                                                <span className="font-bold text-base md:text-lg text-indigo-600 leading-none">{formatMoney(product.salePrice)}</span>
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT: CHECKOUT VIEW */}
            {/* Added md:z-auto to prevent high z-index on desktop */}
            <div className={`fixed inset-0 z-[70] bg-white flex flex-col transition-transform duration-300 transform md:relative md:translate-x-0 md:w-[420px] md:border-l md:border-slate-200 md:shadow-xl md:z-0 ${activeView === 'checkout' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                
                {/* Checkout Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
                    <button onClick={() => setActiveView('products')} className="md:hidden p-2 -ml-2 text-slate-500 active:bg-slate-50 rounded-lg">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-indigo-600" /> {t('Checkout')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                const csv = cart.map(i => `${i.name},${i.qty},${i.price}`).join('\n');
                                const blob = new Blob([`Name,Qty,Price\n${csv}`], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `cart_${Date.now()}.csv`;
                                a.click();
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Export Cart"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">{t('Clear')}</button>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {/* Customer & Payment Form */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4 shrink-0">
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('Customer Name')}</label>
                            <div className="flex items-center bg-white border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden shadow-sm transition-all hover:border-slate-400">
                                <div className="pl-3 text-slate-400"><User className="w-5 h-5" /></div>
                                <input 
                                    type="text"
                                    value={customerName}
                                    onFocus={() => customerName === 'Walk-in Customer' && setCustomerName('')}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    onBlur={() => !customerName.trim() && setCustomerName('Walk-in Customer')}
                                    className="w-full px-3 py-3 text-sm outline-none font-medium text-slate-900 placeholder:text-slate-400 bg-transparent"
                                    placeholder="Name or Mobile"
                                />
                                {selectedCustomerId && (
                                    <button 
                                        onClick={() => setShowHistoryModal(true)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg mr-1"
                                        title="Purchase History"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                )}
                                {selectedCustomerId && <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />}
                            </div>
                            {/* Suggestions */}
                            {customerSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 z-50 max-h-48 overflow-y-auto">
                                    {customerSuggestions.map(c => (
                                        <button key={c.id} onClick={() => handleCustomerSelect(c)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-50 last:border-0 flex justify-between items-center group">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">{c.name}</p>
                                                <p className="text-xs text-slate-500">{c.mobile}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                            {(customerName !== 'Walk-in Customer' || customerMobile) && (
                                <div className="space-y-2">
                                    <input 
                                        type="tel"
                                        value={customerMobile}
                                        onChange={e => setCustomerMobile(e.target.value)}
                                        placeholder={t('Phone Number')}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                    />
                                    {previousDue > 0 && (
                                        <div className="flex justify-between items-center px-3 py-2 bg-red-50 border border-red-100 rounded-lg animate-in fade-in">
                                            <span className="text-xs font-bold text-red-600 uppercase">{t('Previous Due')}</span>
                                            <span className="text-sm font-black text-red-700">{formatMoney(previousDue)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('Payments')}</label>
                                    <button 
                                        onClick={handleAddPayment}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> {t('Add Method')}
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {payments.map((p, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <select 
                                                value={p.method} 
                                                onChange={e => handleUpdatePayment(idx, 'method', e.target.value)}
                                                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-bold"
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="Mobile Banking">Mobile Banking</option>
                                                <option value="Gift Card">Gift Card</option>
                                                <option value="Due">Due / Credit</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Installment">Installment</option>
                                            </select>
                                            <div className="flex-[1.5] flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                                                <span className="pl-2 text-slate-500 text-[10px] font-bold">{currencySymbol}</span>
                                                <input 
                                                    type="number"
                                                    value={p.amount}
                                                    onChange={e => handleUpdatePayment(idx, 'amount', e.target.value ? parseFloat(e.target.value) : 0)}
                                                    className="w-full px-2 py-2 text-xs outline-none font-bold text-slate-900 bg-transparent"
                                                />
                                                {payments.length > 1 && (
                                                    <button onClick={() => handleRemovePayment(idx)} className="pr-2 text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    {/* Current Bill Due */}
                                    {calculatedDue > 0 && (
                                        <div className="flex justify-between items-center px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                                            <span className="text-[10px] font-bold text-amber-700 uppercase">{t('Current Due')}</span>
                                            <span className="text-sm font-black text-amber-700">{formatMoney(calculatedDue)}</span>
                                        </div>
                                    )}

                                    {/* Change / Overpayment */}
                                    {calculatedDue < 0 && (
                                        <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase">{t('Change / Overpayment')}</span>
                                            <span className="text-sm font-black text-emerald-700">{formatMoney(Math.abs(calculatedDue))}</span>
                                        </div>
                                    )}
                                    
                                    {/* Total Outstanding (Current + Previous) */}
                                    {(previousDue > 0 || calculatedDue !== 0) && (
                                        <div className={`flex justify-between items-center px-3 py-2 border rounded-lg ${previousDue + calculatedDue < 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
                                            <span className={`text-[10px] font-bold uppercase ${previousDue + calculatedDue < 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                {previousDue + calculatedDue < 0 ? t('Net Credit Balance') : t('Total Outstanding')}
                                            </span>
                                            <span className={`text-sm font-black ${previousDue + calculatedDue < 0 ? 'text-emerald-800' : 'text-slate-800'}`}>
                                                {formatMoney(Math.abs(previousDue + calculatedDue))}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Installment Configuration */}
                            {payments.some(p => p.method === 'Installment') && calculatedDue > 0 && (
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in">
                                    <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> {t('Installment Plan')}
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">{t('Number of Installments')}</label>
                                            <input 
                                                type="number" 
                                                min="2" 
                                                max="36"
                                                value={installmentCount}
                                                onChange={e => setInstallmentCount(Math.max(2, parseInt(e.target.value) || 2))}
                                                className="w-full p-2 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">{t('Frequency')}</label>
                                            <select 
                                                value={installmentFrequency}
                                                onChange={e => setInstallmentFrequency(e.target.value as any)}
                                                className="w-full p-2 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                            >
                                                <option value="Monthly">Monthly</option>
                                                <option value="Weekly">Weekly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">{t('First Payment Date')}</label>
                                        <input 
                                            type="date" 
                                            value={firstInstallmentDate}
                                            onChange={e => setFirstInstallmentDate(e.target.value)}
                                            className="w-full p-2 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        />
                                    </div>

                                    {/* Schedule Preview */}
                                    <div className="mt-3 bg-white rounded-lg border border-indigo-100 overflow-hidden">
                                        <div className="bg-indigo-100 px-3 py-2 text-[10px] font-bold text-indigo-800 uppercase flex justify-between">
                                            <span>Date</span>
                                            <span>Amount</span>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto">
                                            {Array.from({ length: installmentCount }).map((_, i) => {
                                                const date = new Date(firstInstallmentDate);
                                                if (installmentFrequency === 'Monthly') {
                                                    date.setMonth(date.getMonth() + i);
                                                } else {
                                                    date.setDate(date.getDate() + (i * 7));
                                                }
                                                const amount = (calculatedDue / installmentCount).toFixed(2);
                                                return (
                                                    <div key={i} className="flex justify-between px-3 py-2 text-xs border-b border-slate-50 last:border-0 text-slate-600">
                                                        <span>{date.toLocaleDateString()}</span>
                                                        <span className="font-mono font-bold">{formatMoney(parseFloat(amount))}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                        {isDueError && (
                            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2 font-bold animate-in slide-in-from-top-1 border border-red-100">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {t('Due/Partial sale এর জন্য কাস্টমার সিলেক্ট করা বাধ্যতামূলক')}
                            </div>
                        )}
                    </div>

                    {/* Cart Items & Order Details */}
                    <div className="p-4 space-y-4 bg-white flex-1">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <ShoppingBag className="w-16 h-16 mb-4 stroke-1" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-indigo-300 transition-colors">
                                    {/* Header */}
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</span>
                                        <div className="text-right">
                                             <span className="font-black text-indigo-600 block">{formatMoney(item.price * item.qty)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Controls */}
                                    <div className="flex items-center gap-2">
                                        {/* Qty */}
                                        <div className="flex items-center bg-slate-100 rounded-lg p-1 h-8">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-full flex items-center justify-center text-slate-600 hover:bg-white rounded active:scale-95 transition-transform"><Minus className="w-3 h-3"/></button>
                                            <span className="w-6 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-full flex items-center justify-center text-slate-600 hover:bg-white rounded active:scale-95 transition-transform"><Plus className="w-3 h-3"/></button>
                                        </div>

                                        {/* Price Edit */}
                                        <div className="flex-1 flex items-center border border-slate-200 rounded-lg px-2 h-8 bg-white focus-within:ring-1 focus-within:ring-indigo-500">
                                            <span className="text-[10px] text-slate-400 mr-1">{currencySymbol}</span>
                                            <input 
                                                type="number" 
                                                className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                                                value={item.price}
                                                onChange={e => updateItemPrice(item.id, e.target.value)}
                                            />
                                        </div>
                                        
                                        {/* Extras Menu */}
                                        <button 
                                            onClick={() => openExtrasModal(item.id)}
                                            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors active:scale-95 ${
                                                (item.serialNumbers?.length > 0 || item.warranty) 
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                            }`}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Tags display */}
                                    {(item.serialNumbers.length > 0 || item.warranty) && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {item.warranty && <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {item.warranty}</span>}
                                            {item.serialNumbers.length > 0 && <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1"><Hash className="w-3 h-3"/> {item.serialNumbers.length} SN</span>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Order Notes & Tags (Moved from footer to scrollable area) */}
                    {cart.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Order Details')}</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('Salesperson')}</label>
                                    <select 
                                        value={salesperson} 
                                        onChange={e => setSalesperson(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:bg-white transition-all"
                                    >
                                        <option value="Counter">Counter</option>
                                        {staff.filter(s => s.status === 'Active').map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('Order Notes')}</label>
                                    <input 
                                        type="text" 
                                        value={orderNotes} 
                                        onChange={e => setOrderNotes(e.target.value)} 
                                        placeholder={t('Any special notes...')} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('Delivery Instructions')}</label>
                                    <input 
                                        type="text" 
                                        value={deliveryInstructions} 
                                        onChange={e => setDeliveryInstructions(e.target.value)} 
                                        placeholder={t('Delivery Instructions')} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t('Tags')}</label>
                                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[40px]">
                                    {orderTags.map(tag => (
                                        <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                            {tag}
                                            <button onClick={() => setOrderTags(orderTags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text" 
                                        value={tagInput} 
                                        onChange={e => setTagInput(e.target.value)} 
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                setOrderTags([...orderTags, tagInput.trim()]);
                                                setTagInput('');
                                            }
                                        }}
                                        placeholder={t('Add Tag...')} 
                                        className="bg-transparent border-none rounded px-1 py-0.5 text-[10px] text-slate-800 outline-none w-24"
                                    />
                                </div>
                            </div>

                            {/* Auto Send Invoice Toggle */}
                            <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${autoSendInvoice ? 'bg-indigo-600' : 'bg-slate-300'}`} onClick={() => setAutoSendInvoice(!autoSendInvoice)}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${autoSendInvoice ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Auto Send Invoice</span>
                                </div>
                                {autoSendInvoice && (
                                    <span className="text-[10px] text-indigo-600 font-bold bg-white px-2 py-1 rounded-full shadow-sm border border-indigo-100 uppercase tracking-tight">SMS/Email</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Totals (Sticky) */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] pb-safe z-10 shrink-0">
                    <div className="space-y-3 mb-4 text-sm">
                        <div className="flex justify-between text-slate-600"><span>{t('Subtotal')}</span><span>{formatMoney(subtotal)}</span></div>
                        
                        {/* Discount & Tax */}
                        <div className="flex gap-4">
                            <div className="flex-1 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200 focus-within:border-indigo-300">
                                <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase">{t('Discount')}</span>
                                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value)||0)} className="w-full bg-transparent text-right outline-none text-slate-900 font-bold text-xs" placeholder="0" />
                            </div>
                            <div className="flex-1 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200 focus-within:border-indigo-300">
                                <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase">{t('Coupon')}</span>
                                <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="w-full bg-transparent text-right outline-none text-slate-900 font-bold text-xs uppercase" placeholder="CODE" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200 focus-within:border-indigo-300">
                                <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase">{t('Tax')}</span>
                                <input type="number" value={tax} onChange={e => setTax(parseFloat(e.target.value)||0)} className="w-full bg-transparent text-right outline-none text-slate-900 font-bold text-xs" placeholder="0" />
                            </div>
                            {/* Extra / Delivery Charge */}
                            <div className="flex-1 flex gap-1">
                                <input 
                                    type="text" 
                                    value={miscLabel} 
                                    onChange={e => setMiscLabel(e.target.value)} 
                                    placeholder={t('Delivery')} 
                                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-300"
                                />
                                <div className={`w-1/2 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border transition-colors ${miscLabel ? 'border-indigo-300 bg-white' : 'border-slate-200 opacity-60'}`}>
                                    <input 
                                        type="number" 
                                        value={miscAmount} 
                                        onChange={e => setMiscAmount(parseFloat(e.target.value)||0)} 
                                        disabled={!miscLabel}
                                        className="w-full bg-transparent text-right outline-none text-slate-900 font-bold text-xs" 
                                        placeholder="0" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="font-bold text-lg text-slate-800">{t('Total Payable')}</span>
                            <span className="font-black text-2xl text-indigo-600">{formatMoney(grandTotal + previousDue)}</span>
                        </div>
                        {(calculatedDue + previousDue) > 0 && (
                            <div className="flex justify-between items-center text-red-600">
                                <span className="font-bold text-sm">{t('Total Due')}</span>
                                <span className="font-bold text-sm">{formatMoney(calculatedDue + previousDue)}</span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            handleCheckoutClick();
                            if (autoSendInvoice) {
                                // Mock sending invoice
                                console.log("Auto sending invoice to customer...");
                                alert("Invoice automatically sent to customer!");
                            }
                        }}
                        disabled={cart.length === 0 || isDueError}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {t('Confirm Sale')} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* --- MOBILE STICKY BAR (Only on Product View) --- */}
        {cart.length > 0 && activeView === 'products' && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] z-50 pb-safe flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{cart.reduce((a,b)=>a+b.qty,0)} Items</p>
                    <p className="text-xl font-black text-slate-900">{formatMoney(subtotal)}</p>
                </div>
                <button 
                    onClick={() => setActiveView('checkout')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                >
                    {t('Checkout')} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* --- EXTRAS MODAL (SN & Warranty) --- */}
        {extrasModal.show && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{t('Item Details')}</h3>
                        <button onClick={() => setExtrasModal({show: false, itemId: null})}><X className="w-5 h-5 text-slate-400"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Warranty */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Warranty')}</label>
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                                <span className="bg-slate-50 p-2 border-r border-slate-200 text-slate-500"><ShieldCheck className="w-4 h-4"/></span>
                                <input 
                                    type="text" 
                                    value={tempWarranty}
                                    onChange={e => setTempWarranty(e.target.value)}
                                    placeholder="e.g. 1 Year"
                                    className="w-full p-2 text-sm outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Serial Numbers */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serial Numbers</label>
                            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 max-h-40 overflow-y-auto space-y-2">
                                {tempSns.map((sn, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-slate-400 w-4">#{idx+1}</span>
                                        <input 
                                            type="text"
                                            value={sn}
                                            onChange={e => handleSnChange(idx, e.target.value)}
                                            placeholder={`SN for item ${idx+1}`}
                                            className="flex-1 text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500 text-slate-800"
                                        />
                                    </div>
                                ))}
                                {tempSns.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Add items to cart to enable SN entry.</p>}
                            </div>
                        </div>

                        <button 
                            onClick={saveExtras}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            {t('Save Details')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- DUPLICATE CUSTOMER MODAL --- */}
        {duplicateMatch && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                    <div className="bg-amber-50 p-6 flex flex-col items-center text-center border-b border-amber-100">
                        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Duplicate Customer</h3>
                        <p className="text-sm text-slate-600 mt-2 font-medium">"This customer name already exists. Is it the same person?"</p>
                        <div className="mt-3 bg-white p-3 rounded-lg border border-amber-200 w-full text-left">
                            <p className="text-xs text-slate-500 uppercase font-bold">Existing Record:</p>
                            <p className="font-bold text-slate-800">{duplicateMatch.name}</p>
                            <p className="text-xs text-slate-500">Mobile: {duplicateMatch.mobile || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                        <button 
                            onClick={() => handleDuplicateResolution('yes')}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            YES - Use Existing
                        </button>
                        <button 
                            onClick={() => handleDuplicateResolution('no')}
                            className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            NO - Change Name
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Customer History Modal */}
        {showHistoryModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">{customerName}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('Purchase History')}</p>
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {customerHistory.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>{t('No purchase history found')}</p>
                            </div>
                        ) : (
                            customerHistory.map(tx => (
                                <div key={tx.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{tx.id.slice(-6)}</span>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{tx.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-800">{formatMoney(tx.amount)}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.dueAmount && tx.dueAmount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {tx.dueAmount && tx.dueAmount > 0 ? t('Due') : t('Paid')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {tx.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs text-slate-600">
                                                <span>{item.name} x {item.qty}</span>
                                                <span className="font-medium">{formatMoney(item.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && generatedInvoice && (
            <InvoiceTemplate data={generatedInvoice} onClose={() => setShowInvoice(false)} />
        )}
    </div>
  );
};

export default Sell;
