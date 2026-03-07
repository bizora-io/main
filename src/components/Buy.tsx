
import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useData, LedgerEntry, Product, Entity } from '../contexts/DataContext';
import { 
  ShoppingCart, User, Calendar, Plus, Trash2, Search, Barcode, Box, 
  ArrowRight, CheckCircle, X, Clock, Hash, ChevronLeft, Wallet, 
  CreditCard, Minus, Settings, Truck, Users
} from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';

const Buy: React.FC = () => {
  const { t, currencySymbol, formatMoney } = useSettings();
  const { user } = useAuth();
  const { products, suppliers, updateProductStock, processPurchase, addEntity, addTransaction } = useData();
  
  const activeBusiness = useMemo(() => 
    user?.businesses?.find(b => b.name === user.businessName) || user?.businesses?.[0]
  , [user]);
  
  const bizSettings = activeBusiness?.settings;
  
  // --- View State ---
  const [activeView, setActiveView] = useState<'products' | 'cart'>('products');

  // --- Transaction State ---
  const [cart, setCart] = useState<{
      id: string, name: string, stock: number, qty: number, price: number, expiryDate?: string,
      serialNumbers: string[], warranty?: string, image?: string, category?: string
  }[]>([]);

  // Date State (Auto Today)
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Supplier State
  const [supplierName, setSupplierName] = useState(''); 
  const [supplierMobile, setSupplierMobile] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<Entity[]>([]);
  
  // Payment State
  const [paymentType, setPaymentType] = useState<'Cash' | 'Due'>('Cash');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [miscLabel, setMiscLabel] = useState(''); 
  const [miscAmount, setMiscAmount] = useState(0);

  // --- UI & Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modals
  const [duplicateMatch, setDuplicateMatch] = useState<Entity | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<LedgerEntry | null>(null);
  
  // Item Extras Modals
  const [expireModal, setExpireModal] = useState<{show: boolean, itemId: string | null}>({ show: false, itemId: null });
  const [tempExpiry, setTempExpiry] = useState('');

  const [snModal, setSnModal] = useState<{show: boolean, itemId: string | null}>({ show: false, itemId: null });
  const [tempSns, setTempSns] = useState<string[]>([]);

  // --- Derived Data ---
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

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
  const grandTotal = Math.max(0, subtotal - discount + tax + miscAmount);

  // --- Effects ---

  // Auto-suggest suppliers when typing
  useEffect(() => {
      if (!selectedSupplierId && supplierName) {
          const lowerTerm = supplierName.toLowerCase();
          const matches = suppliers.filter(s => 
              !s.isDeleted && 
              (s.name.toLowerCase().includes(lowerTerm) || s.mobile?.includes(lowerTerm))
          ).slice(0, 5);
          setSupplierSuggestions(matches);
      } else {
          setSupplierSuggestions([]);
      }
  }, [supplierName, selectedSupplierId, suppliers]);

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

  const addToCart = (product: typeof products[0]) => {
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
          setCart(cart.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item));
      } else {
          setCart([...cart, { 
              ...product,
              qty: 1, 
              price: product.purchasePrice,
              serialNumbers: [],
              warranty: product.warranty ? (product.warrantyPeriod || 'Yes') : undefined
          }]);
      }
  };

  const updateCartItem = (id: string, field: 'qty' | 'price', value: number) => {
      setCart(cart.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeCartItem = (id: string) => {
      setCart(cart.filter(item => item.id !== id));
  };

  // Expiry Logic
  const openExpireModal = (id: string) => {
     setExpireModal({ show: true, itemId: id });
     const item = cart.find(i => i.id === id);
     setTempExpiry(item?.expiryDate || '');
  };

  const saveExpiry = () => {
      if (expireModal.itemId) {
          setCart(cart.map(item => item.id === expireModal.itemId ? { ...item, expiryDate: tempExpiry } : item));
      }
      setExpireModal({ show: false, itemId: null });
      setTempExpiry('');
  };

  // Serial Number Logic
  const openSnModal = (id: string) => {
      const item = cart.find(i => i.id === id);
      if (item) {
          const currentSns = item.serialNumbers || [];
          const needed = item.qty;
          const padded = Array(needed).fill('').map((_, i) => currentSns[i] || '');
          setTempSns(padded);
          setSnModal({ show: true, itemId: id });
      }
  };

  const handleSnChange = (index: number, val: string) => {
      const newSns = [...tempSns];
      newSns[index] = val;
      setTempSns(newSns);
  };

  const saveSns = () => {
      if (snModal.itemId) {
          setCart(cart.map(item => item.id === snModal.itemId ? { ...item, serialNumbers: tempSns.filter(s => s.trim() !== '') } : item));
      }
      setSnModal({ show: false, itemId: null });
  };

  // Supplier Logic
  const handleSupplierSelect = (supplier: Entity) => {
      setSupplierName(supplier.name);
      setSupplierMobile(supplier.mobile || '');
      setSelectedSupplierId(supplier.id);
      setSupplierSuggestions([]);
  };

  const handleNameChange = (val: string) => {
      setSupplierName(val);
      setSelectedSupplierId(null);
  };

  // --- CORE CHECKOUT LOGIC ---
  const handleCheckoutClick = () => {
      if (cart.length === 0) return;
      if (cart.some(item => item.qty <= 0)) {
          alert("Please ensure all items have a quantity greater than 0.");
          return;
      }
      if (!supplierName.trim()) {
          alert("Supplier name is mandatory.");
          return;
      }

      if (!selectedSupplierId) {
          const exactMatch = suppliers.find(s => s.name.toLowerCase() === supplierName.trim().toLowerCase());
          if (exactMatch) {
              setDuplicateMatch(exactMatch);
              return;
          }
      }
      finalizeTransaction(selectedSupplierId, supplierName, supplierMobile);
  };

  const handleDuplicateResolution = (resolution: 'yes' | 'no') => {
      if (resolution === 'yes' && duplicateMatch) {
          finalizeTransaction(duplicateMatch.id, duplicateMatch.name, duplicateMatch.mobile || supplierMobile);
      } else {
          setDuplicateMatch(null);
      }
  };

  const finalizeTransaction = (finalId: string | null, finalName: string, finalMobile: string) => {
      // 1. Add Supplier if new
      if (!finalId) {
          finalId = Date.now().toString();
          addEntity({
              id: finalId,
              name: finalName,
              mobile: finalMobile,
              address: '', // Could add address field if needed
              type: 'Supplier'
          });
      }

      // 2. Update Stock & Calculate Average Purchase Price
      cart.forEach(item => {
          processPurchase(item.id, item.qty, item.price);
      });

      // 3. Create Transaction Object
      const prefix = bizSettings?.invoicePrefix || 'PUR';
      const timestamp = Date.now().toString().slice(-6);
      const reference = `${prefix}-${timestamp}`;

      const transaction: LedgerEntry = {
          id: Date.now().toString(),
          date: purchaseDate,
          entityName: finalName,
          entityMobile: finalMobile,
          type: 'Purchase',
          amount: grandTotal,
          paymentMethod: paymentType,
          reference: reference,
          items: cart.map(c => ({
              productId: c.id,
              name: c.name,
              qty: c.qty,
              price: c.price,
              total: c.qty * c.price,
              serialNumbers: c.serialNumbers,
              warranty: c.warranty,
              expiryDate: c.expiryDate,
              batchNumber: c.id
          })),
          details: {
              subtotal,
              tax,
              discount,
              delivery: miscAmount
          }
      };

      addTransaction(transaction);
      setGeneratedInvoice(transaction);
      setShowInvoice(true);
      setDuplicateMatch(null);
      
      // Reset
      setCart([]);
      setSupplierName('');
      setSupplierMobile('');
      setSelectedSupplierId(null);
      setPaymentType('Cash');
      setDiscount(0);
      setTax(0);
      setMiscLabel('');
      setMiscAmount(0);
      setActiveView('products');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Product Selection Grid */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 transition-all duration-300 ${activeView === 'cart' ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Search Header */}
            <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-20 flex flex-col gap-3 shrink-0">
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder={t('Search products...')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
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
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${categoryFilter === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
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
                                className={`group relative bg-white rounded-2xl p-3 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full active:scale-[0.98] ${inCart ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-200'}`}
                            >
                                {/* Stock Badge */}
                                <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md ${product.stock <= 5 ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-700'}`}>
                                    {product.stock} {t('Stock Level')}
                                </div>

                                {/* Qty Badge */}
                                {inCart && (
                                    <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                                        {inCart.qty}
                                    </div>
                                )}
                                
                                {/* Image */}
                                <div className="aspect-square bg-slate-50 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                    {product.image ? (
                                        <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.name} />
                                    ) : (
                                        <Box className="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mb-2 hidden md:block uppercase tracking-wider">{product.category}</p>
                                    
                                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('Purchase Price')}</span>
                                            <span className="font-bold text-base md:text-lg text-blue-600 leading-none">{formatMoney(product.purchasePrice)}</span>
                                        </div>
                                        <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
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

        {/* Right Pane: Cart & Invoice */}
        {/* Added md:z-auto to prevent high z-index on desktop */}
        <div className={`fixed inset-0 z-[70] bg-white flex flex-col transition-transform duration-300 transform md:relative md:translate-x-0 md:w-[420px] md:border-l md:border-slate-200 md:shadow-xl md:z-0 ${activeView === 'cart' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            {/* Invoice Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
                <button onClick={() => setActiveView('products')} className="md:hidden p-2 -ml-2 text-slate-500 active:bg-slate-50 rounded-lg">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600"/> {t('Purchase Cart')}
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                </h3>
                <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">{t('Clear')}</button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                {/* Supplier & Payment Form */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4 shrink-0">
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t('Supplier Name')}</label>
                        <div className="flex items-center bg-white border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden shadow-sm transition-all hover:border-slate-400">
                            <div className="pl-3 text-slate-400"><User className="w-5 h-5" /></div>
                            <input 
                                type="text"
                                value={supplierName}
                                onFocus={() => supplierName === '' && setSupplierName('')}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className="w-full px-3 py-3 text-sm outline-none font-medium text-slate-900 placeholder:text-slate-400 bg-transparent"
                                placeholder="Search or enter name"
                            />
                            {selectedSupplierId && <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />}
                        </div>
                        {/* Suggestions */}
                        {supplierSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 z-50 max-h-48 overflow-y-auto">
                                {supplierSuggestions.map(s => (
                                    <button key={s.id} onClick={() => handleSupplierSelect(s)} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 flex justify-between items-center group">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{s.name}</p>
                                            <p className="text-xs text-slate-500">{s.mobile}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                             <input 
                                type="tel"
                                value={supplierMobile}
                                onChange={e => setSupplierMobile(e.target.value)}
                                placeholder={t('Phone Number')}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                            />
                        </div>
                        <div className="flex-1">
                             <input 
                                type="date"
                                value={purchaseDate}
                                onChange={e => setPurchaseDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button onClick={() => setPaymentType('Cash')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentType === 'Cash' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <Wallet className="w-4 h-4" /> {t('Cash')}
                        </button>
                        <button onClick={() => setPaymentType('Due')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${paymentType === 'Due' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <CreditCard className="w-4 h-4" /> {t('Due')}
                        </button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="p-4 space-y-3 bg-white flex-1">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <ShoppingCart className="w-16 h-16 mb-4 stroke-1" />
                        <p>Purchase cart is empty</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-300 transition-colors relative group">
                            <button 
                                onClick={() => removeCartItem(item.id)}
                                className="absolute -top-2 -right-2 p-1 bg-white text-red-500 rounded-full border border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {/* Header */}
                            <div className="flex justify-between mb-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center text-slate-400 flex-shrink-0">
                                        <Box className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</span>
                                        <span className="text-[10px] text-slate-400">Stock: {item.stock}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                     <span className="font-black text-blue-600 block">{formatMoney(item.price * item.qty)}</span>
                                </div>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                {/* Qty */}
                                <div className="flex items-center bg-slate-100 rounded-lg p-1 h-8">
                                    <button onClick={() => updateCartItem(item.id, 'qty', Math.max(0, item.qty - 1))} className="w-6 h-full flex items-center justify-center text-slate-600 hover:bg-white rounded active:scale-95 transition-transform"><Minus className="w-3 h-3"/></button>
                                    <span className="w-8 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                                    <button onClick={() => updateCartItem(item.id, 'qty', item.qty + 1)} className="w-6 h-full flex items-center justify-center text-slate-600 hover:bg-white rounded active:scale-95 transition-transform"><Plus className="w-3 h-3"/></button>
                                </div>

                                {/* Price Edit */}
                                <div className="flex-1 flex items-center border border-slate-200 rounded-lg px-2 h-8 bg-white focus-within:ring-1 focus-within:ring-blue-500">
                                    <span className="text-[10px] text-slate-400 mr-1">{currencySymbol}</span>
                                    <input 
                                        type="number" 
                                        className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                                        value={item.price}
                                        onChange={e => updateCartItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Item Actions/Tags */}
                            <div className="mt-2 flex gap-2">
                                <button 
                                    onClick={() => openSnModal(item.id)}
                                    className={`px-2 py-1 rounded text-[10px] border flex items-center gap-1 transition-colors ${item.serialNumbers.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Hash className="w-3 h-3" /> {item.serialNumbers.length > 0 ? `${item.serialNumbers.length} SN` : 'SN'}
                                </button>
                                <button 
                                    onClick={() => openExpireModal(item.id)}
                                    className={`px-2 py-1 rounded text-[10px] border flex items-center gap-1 transition-colors ${item.expiryDate ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Clock className="w-3 h-3" /> {item.expiryDate ? 'Exp Set' : 'Exp'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Footer Totals (Sticky) */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] pb-safe z-10 shrink-0">
                <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between text-slate-600"><span>{t('Subtotal')}</span><span>{formatMoney(subtotal)}</span></div>
                    
                    {/* Discount & Tax */}
                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200 focus-within:border-blue-300">
                            <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase">{t('Discount')}</span>
                            <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value)||0)} className="w-full bg-transparent text-right outline-none text-slate-900 font-bold text-xs" placeholder="0" />
                        </div>
                        <div className="flex-1 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200 focus-within:border-blue-300">
                            <span className="text-[10px] font-bold text-slate-500 mr-2 uppercase">{t('Tax')}</span>
                            <input type="number" value={tax} onChange={e => setTax(parseFloat(e.target.value)||0)} className="w-full bg-transparent text-right outline-none text-slate-900 font-bold text-xs" placeholder="0" />
                        </div>
                    </div>

                    {/* Extra / Delivery Charge */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={miscLabel} 
                            onChange={e => setMiscLabel(e.target.value)} 
                            placeholder={t('Delivery Charge')} 
                            className="flex-[2] bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-300"
                        />
                        <div className={`flex-1 flex items-center bg-slate-50 rounded-lg px-2 py-1.5 border transition-colors ${miscLabel ? 'border-blue-300 bg-white' : 'border-slate-200 opacity-60'}`}>
                            <Truck className="w-3 h-3 text-slate-400 mr-2" />
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

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <span className="font-bold text-lg text-slate-800">{t('Total Payable')}</span>
                        <span className="font-black text-2xl text-blue-600">{formatMoney(grandTotal)}</span>
                    </div>
                </div>
                <button 
                    onClick={handleCheckoutClick}
                    disabled={cart.length === 0}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                    {t('Confirm Purchase')} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      {/* --- MOBILE STICKY BAR --- */}
      {cart.length > 0 && activeView === 'products' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] z-50 pb-safe flex items-center justify-between animate-in slide-in-from-bottom-2">
              <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{cart.reduce((a,b)=>a+b.qty,0)} Items</p>
                  <p className="text-xl font-black text-slate-900">{formatMoney(subtotal)}</p>
              </div>
              <button 
                  onClick={() => setActiveView('cart')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                  {t('Checkout')} <ArrowRight className="w-5 h-5" />
              </button>
          </div>
      )}

      {/* Expire Date Modal */}
      {expireModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in duration-200">
                  <h3 className="font-bold text-slate-800 mb-4">Set Expiry Date</h3>
                  <input 
                    type="date" 
                    value={tempExpiry} 
                    onChange={e => setTempExpiry(e.target.value)}
                    className="w-full border p-3 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                  />
                  <div className="flex gap-2">
                      <button onClick={() => setExpireModal({show: false, itemId: null})} className="flex-1 py-2.5 border rounded-lg font-medium text-slate-600 hover:bg-slate-50">{t('Cancel')}</button>
                      <button onClick={saveExpiry} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t('Save')}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Serial Number Modal */}
      {snModal.show && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in duration-200">
                  <h3 className="font-bold text-slate-800 mb-4">Add Serial Numbers</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1">
                      {tempSns.map((sn, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 w-6 font-mono">#{idx+1}</span>
                              <input 
                                value={sn}
                                onChange={e => handleSnChange(idx, e.target.value)}
                                className="flex-1 border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                                placeholder={`Serial Number ${idx+1}`}
                              />
                          </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setSnModal({show: false, itemId: null})} className="flex-1 py-2.5 border rounded-lg font-medium text-slate-600 hover:bg-slate-50">{t('Cancel')}</button>
                      <button onClick={saveSns} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t('Save')}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Duplicate Supplier Modal */}
      {duplicateMatch && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                    <div className="bg-amber-50 p-6 flex flex-col items-center text-center border-b border-amber-100">
                        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Duplicate Supplier</h3>
                        <p className="text-sm text-slate-600 mt-2 font-medium">"This supplier name already exists. Is it the same entity?"</p>
                        <div className="mt-3 bg-white p-3 rounded-lg border border-amber-200 w-full text-left">
                            <p className="text-xs text-slate-500 uppercase font-bold">Existing Record:</p>
                            <p className="font-bold text-slate-800">{duplicateMatch.name}</p>
                            <p className="text-xs text-slate-500">Mobile: {duplicateMatch.mobile || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                        <button 
                            onClick={() => handleDuplicateResolution('yes')}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            YES - Use Existing
                        </button>
                        <button 
                            onClick={() => handleDuplicateResolution('no')}
                            className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            NO - Create New
                        </button>
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

export default Buy;
