import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, Product, LedgerEntry } from '../contexts/DataContext';
import { Package, AlertCircle, Clock, CheckSquare, Square, Save, X, ShieldCheck, AlertTriangle, Calculator, DollarSign, StickyNote, Plus, Trash2, Layers, History, Edit2, ArrowRightLeft, Filter, ArrowRight, Minus, FileText, Hash, Search } from 'lucide-react';

interface StockMovement {
    transactionId: string;
    date: string;
    type: string;
    productName: string;
    productId: string;
    quantity: number;
    price: number;
    reference?: string;
    // New fields for history
    stockBefore: number;
    stockAfter: number;
    batchNumber?: string;
    expiryDate?: string;
}

const StockReport: React.FC = () => {
    const { t, formatMoney, currencySymbol } = useSettings();
    const { products, transactions, updateProductStock, addTransaction, updateTransaction, deleteItem } = useData();
    const [activeTab, setActiveTab] = useState<'all' | 'stock' | 'expired' | 'warranty' | 'history'>('all');
    
    // Bulk Action State for Low Stock
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkQty, setBulkQty] = useState<number>(0);

    // History Filter State
    const [historyFilter, setHistoryFilter] = useState<'All' | 'Buy' | 'Sell' | 'Adjustment'>('All');
    const [historySearch, setHistorySearch] = useState('');
    const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
    const [editQty, setEditQty] = useState<number>(0);
    const [viewTransaction, setViewTransaction] = useState<LedgerEntry | null>(null);

    // Notes State
    const [notes, setNotes] = useState<{id: string, text: string, date: string}[]>(() => {
        const saved = localStorage.getItem('stock_notes');
        return saved ? JSON.parse(saved) : [];
    });
    const [newNote, setNewNote] = useState('');

    // Persist Notes
    useEffect(() => {
        localStorage.setItem('stock_notes', JSON.stringify(notes));
    }, [notes]);

    // --- Derived Data ---

    // 0. Summary Calculations
    const { totalProducts, inventoryValue } = useMemo(() => {
        const activeProducts = products.filter(p => !p.isDeleted);
        return {
            totalProducts: activeProducts.length,
            inventoryValue: activeProducts.reduce((sum, p) => sum + (p.purchasePrice * p.stock), 0)
        };
    }, [products]);

    // 1. All Products List
    const allProductList = useMemo(() => 
        products.filter(p => !p.isDeleted).sort((a, b) => a.name.localeCompare(b.name)),
    [products]);

    // 2. Low Stock List
    const lowStockList = useMemo(() => 
        products.filter(p => !p.isDeleted && p.stock <= (p.minStockLevel || 5)).sort((a, b) => a.stock - b.stock), 
    [products]);

    // 3. Expired / Expiring List (Within 90 Days)
    const expiredList = useMemo(() => {
        const today = new Date();
        const future90 = new Date();
        future90.setDate(today.getDate() + 90);

        return products.filter(p => {
            if (p.isDeleted || !p.expiryDate) return false;
            const exp = new Date(p.expiryDate);
            if (isNaN(exp.getTime())) return false;
            // Check if expired OR expiring within 90 days
            return exp <= future90; 
        }).map(p => {
            const exp = new Date(p.expiryDate!);
            const diffTime = exp.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...p, diffDays, isExpired: diffDays < 0 };
        }).sort((a, b) => a.diffDays - b.diffDays);
    }, [products]);

    // 4. Warranty List
    const warrantyList = useMemo(() => 
        products.filter(p => !p.isDeleted && p.warranty), 
    [products]);

    // 5. Stock Movement History with Snapshot Logic
    const stockMovements = useMemo(() => {
        // 1. Flatten all item movements from transactions
        const rawMoves: any[] = [];
        transactions.forEach(t => {
            if (t.isDeleted) return;
            if (['Sale', 'Purchase', 'Sales Return', 'Purchase Return', 'Stock Adjustment'].includes(t.type)) {
                t.items?.forEach(item => {
                    rawMoves.push({
                        transactionId: t.id,
                        date: t.date, 
                        type: t.type,
                        productName: item.name,
                        productId: item.productId,
                        quantity: item.qty,
                        price: item.price,
                        reference: t.reference,
                        batchNumber: item.batchNumber,
                        expiryDate: item.expiryDate
                    });
                });
            }
        });

        // 2. Sort Newest -> Oldest
        rawMoves.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            
            const timeA = isNaN(dateA) ? 0 : dateA;
            const timeB = isNaN(dateB) ? 0 : dateB;
            
            if (timeA !== timeB) return timeB - timeA; // Descending
            return parseInt(b.transactionId) - parseInt(a.transactionId); // Fallback to ID
        });

        // 3. Calculate Snapshots Backwards
        // Create a map of current stock to start with
        const tempStockMap: Record<string, number> = {};
        products.forEach(p => tempStockMap[p.id] = p.stock);

        const calculatedMoves: StockMovement[] = rawMoves.map(move => {
            const currentStock = tempStockMap[move.productId] || 0;
            let change = 0;

            if (move.type === 'Stock Adjustment') {
                // Check if decrease based on reference, otherwise assume increase
                const isDecrease = move.reference && move.reference.toLowerCase().includes('decrease');
                change = isDecrease ? -move.quantity : move.quantity;
            } else {
                // Purchase/Sales Return = Added (+)
                // Sale/Purchase Return = Removed (-)
                const isIncoming = ['Purchase', 'Sales Return'].includes(move.type);
                change = isIncoming ? move.quantity : -move.quantity;
            }

            // Calculation:
            // Stock After Transaction = Current Stock (in this iteration of calculation)
            // Stock Before Transaction = Stock After - Change
            
            const stockAfter = currentStock;
            const stockBefore = currentStock - change;

            // Update the map for the *next* iteration (which is an older transaction)
            tempStockMap[move.productId] = stockBefore;

            return {
                ...move,
                stockBefore,
                stockAfter
            };
        });

        return calculatedMoves;
    }, [transactions, products]);

    const filteredMovements = useMemo(() => {
        return stockMovements.filter(m => {
            const matchesType = (() => {
                if (historyFilter === 'Buy') return ['Purchase', 'Sales Return'].includes(m.type);
                if (historyFilter === 'Sell') return ['Sale', 'Purchase Return'].includes(m.type);
                if (historyFilter === 'Adjustment') return ['Stock Adjustment'].includes(m.type);
                return true;
            })();

            const term = historySearch.toLowerCase();
            const matchesSearch = !term || 
                m.productName.toLowerCase().includes(term) ||
                m.transactionId.includes(term) ||
                (m.reference && m.reference.toLowerCase().includes(term));

            return matchesType && matchesSearch;
        });
    }, [stockMovements, historyFilter, historySearch]);

    // --- Actions ---

    const toggleSelect = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkUpdate = () => {
        if (bulkQty <= 0) return;

        // 1. Update Products Stock
        selectedItems.forEach(id => updateProductStock(id, bulkQty, 'increase'));

        // 2. Create Stock Adjustment Transaction Record
        const adjustmentItems = selectedItems.map(id => {
            const p = products.find(p => p.id === id);
            return {
                productId: id,
                name: p?.name || 'Unknown',
                qty: bulkQty,
                price: p?.purchasePrice || 0,
                total: (p?.purchasePrice || 0) * bulkQty
            };
        });

        if(adjustmentItems.length > 0) {
            addTransaction({
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                entityName: 'System Admin',
                type: 'Stock Adjustment',
                reference: 'Bulk Restock', // Tag for history logic
                amount: adjustmentItems.reduce((s, i) => s + i.total, 0),
                paymentMethod: 'Adjustment',
                items: adjustmentItems,
                details: { subtotal: 0, tax: 0, discount: 0, delivery: 0 }
            });
        }

        setSelectedItems([]);
        setShowBulkModal(false);
        setBulkQty(0);
        alert(t("Stock Updated & Transaction Logged Successfully"));
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        setNotes(prev => [{ id: Date.now().toString(), text: newNote, date: new Date().toLocaleDateString() }, ...prev]);
        setNewNote('');
    };

    const handleDeleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const openEditMovement = (move: StockMovement) => {
        setEditingMovement(move);
        setEditQty(move.quantity);
    };

    const handleRowClick = (txId: string) => {
        const tx = transactions.find(t => t.id === txId);
        if (tx) setViewTransaction(tx);
    };

    const handleDeleteMovement = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t("Are you sure you want to delete this record? This will move it to the Recycle Bin but will NOT automatically revert stock changes."))) {
            deleteItem('transaction', id);
        }
    };

    const saveMovementEdit = () => {
        if (!editingMovement) return;
        const tx = transactions.find(t => t.id === editingMovement.transactionId);
        if (!tx || !tx.items) return;

        const diff = editQty - editingMovement.quantity;
        if (diff === 0) {
            setEditingMovement(null);
            return;
        }
        
        let stockAction: 'increase' | 'decrease' = 'increase';
        if (tx.type === 'Stock Adjustment') {
             const isDecrease = tx.reference && tx.reference.toLowerCase().includes('decrease');
             if (isDecrease) {
                 stockAction = diff > 0 ? 'decrease' : 'increase';
             } else {
                 stockAction = diff > 0 ? 'increase' : 'decrease';
             }
        } else {
            const isIncoming = ['Purchase', 'Sales Return'].includes(tx.type);
            stockAction = isIncoming ? (diff > 0 ? 'increase' : 'decrease') : (diff > 0 ? 'decrease' : 'increase');
        }
        
        // 2. Update Product Stock
        updateProductStock(editingMovement.productId, Math.abs(diff), stockAction);

        // 3. Update Transaction Record
        const updatedItems = tx.items.map(item => {
            if (item.productId === editingMovement.productId) {
                return { ...item, qty: editQty, total: editQty * item.price };
            }
            return item;
        });
        
        const newTotal = updatedItems.reduce((acc, i) => acc + i.total, 0);
        
        updateTransaction(tx.id, { items: updatedItems, amount: newTotal });
        
        setEditingMovement(null);
        alert(t("Transaction updated and stock level adjusted."));
    };

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Stock Report')}</h1>
                    <p className="text-slate-500 text-sm">{t('Inventory health and movement history')}</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Package className="w-4 h-4" />
                        {t('All Products')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('stock')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'stock' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        {t('Low Stock')} 
                        {lowStockList.length > 0 && <span className="bg-red-100 text-red-600 px-1.5 rounded-full text-xs ml-1">{lowStockList.length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History className="w-4 h-4" />
                        {t('Movement History')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('expired')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'expired' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Clock className="w-4 h-4" />
                        {t('Expired')} 
                        {expiredList.length > 0 && <span className="bg-orange-100 text-orange-600 px-1.5 rounded-full text-xs ml-1">{expiredList.length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('warranty')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'warranty' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        {t('Warranty')}
                    </button>
                </div>
            </div>

            {/* Summary & Notes Section (Visible unless history tab) */}
            {activeTab !== 'history' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Inventory Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <Calculator className="w-5 h-5" />
                            </div>
                             <h3 className="font-bold text-slate-800">{t('Inventory Value')}</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-1">{t('Total Product Value (Cost)')}</p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-6 h-6 text-emerald-500" />
                                    <span className="text-3xl font-bold text-slate-800">{formatMoney(inventoryValue)}</span>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-500 font-medium mb-1">{t('Total Unique Products')}</p>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-6 h-6 text-blue-500" />
                                    <span className="text-2xl font-bold text-slate-800">{totalProducts}</span>
                                    <span className="text-sm text-slate-400">{t('items')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Notes */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full max-h-[300px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <StickyNote className="w-4 h-4 text-yellow-500" /> {t('Stock Notes')}
                            </h3>
                            <span className="text-xs text-slate-400">{notes.length} {t('notes')}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {notes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <p className="text-sm italic">{t('No notes added. Use this to track specific stock issues.')}</p>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="group flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700">{note.text}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{note.date}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-100 flex gap-2">
                            <input 
                                type="text" 
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={t('Add a quick note...')}
                            />
                            <button 
                                onClick={handleAddNote}
                                className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ALL PRODUCTS VIEW --- */}
            {activeTab === 'all' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                             <h3 className="font-bold text-slate-800">{t('All Products List')}</h3>
                            <span className="text-xs text-slate-500">{allProductList.length} {t('items')}</span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">{t('Product Name')}</th>
                                    <th className="px-6 py-4">{t('Category')}</th>
                                    <th className="px-6 py-4 text-center">{t('Current Stock')}</th>
                                    <th className="px-6 py-4 text-right">{t('Purchase Price')}</th>
                                    <th className="px-6 py-4 text-right">{t('Sale Price')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {allProductList.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">{t('No products found.')}</td></tr>
                                ) : (
                                    allProductList.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 block">{p.name}</span>
                                                <span className="text-xs text-slate-400">ID: {p.id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{p.category}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock <= (p.minStockLevel || 5) ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                                    {p.stock} <span className="font-normal text-[10px] text-slate-500 ml-0.5">{p.unit}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-600">
                                                {formatMoney(p.purchasePrice)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                {formatMoney(p.salePrice)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- LOW STOCK VIEW --- */}
            {activeTab === 'stock' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-semibold text-slate-700">{lowStockList.length}</span> {t('items below minimum threshold')}
                        </div>
                        {selectedItems.length > 0 && (
                            <button onClick={() => setShowBulkModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-slate-800">
                                <Save className="w-4 h-4" /> {t('Restock Selected')} ({selectedItems.length})
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">
                                        <button onClick={() => setSelectedItems(selectedItems.length === lowStockList.length ? [] : lowStockList.map(p => p.id))}>
                                            {selectedItems.length === lowStockList.length && lowStockList.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600"/> : <Square className="w-5 h-5 text-slate-400"/>}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4">{t('Product Name')}</th>
                                    <th className="px-6 py-4 text-center">{t('Current Stock')}</th>
                                    <th className="px-6 py-4 text-right">{t('Unit Value')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lowStockList.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t('All stock levels are healthy!')}</td></tr>
                                ) : (
                                    lowStockList.map(p => (
                                        <tr key={p.id} className={`hover:bg-slate-50 ${selectedItems.includes(p.id) ? 'bg-indigo-50/50' : ''}`}>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => toggleSelect(p.id)}>
                                                    {selectedItems.includes(p.id) ? <CheckSquare className="w-5 h-5 text-indigo-600"/> : <Square className="w-5 h-5 text-slate-400"/>}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800">{p.name}</span>
                                                <div className="text-xs text-slate-500">{p.category}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {p.stock} <span className="font-normal text-[10px] text-slate-500 ml-0.5">{p.unit}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-600">
                                                {formatMoney(p.purchasePrice)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- HISTORY VIEW --- */}
            {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-white p-3 rounded-xl border border-slate-200 gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Filter className="w-4 h-4"/> {t('Filter')}:
                            </span>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                {['All', 'Buy', 'Sell', 'Adjustment'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setHistoryFilter(opt as any)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${historyFilter === opt ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t(opt)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder={t('Search product or ref...')} 
                                value={historySearch}
                                onChange={e => setHistorySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">{t('Date')}</th>
                                    <th className="px-6 py-4">{t('Type')}</th>
                                    <th className="px-6 py-4">{t('Product Detail')}</th>
                                    <th className="px-6 py-4 text-center">{t('Movement')}</th>
                                    <th className="px-6 py-4 text-center">{t('Stock Snapshot')}</th>
                                    <th className="px-6 py-4 text-center">{t('Batch/Exp')}</th>
                                    <th className="px-6 py-4 text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-slate-400">{t('No movements found matching filters.')}</td></tr>
                                ) : (
                                    filteredMovements.map((move, idx) => {
                                        let isIncoming = ['Purchase', 'Sales Return'].includes(move.type);
                                        let isDecrease = false;
                                        const unit = products.find(p => p.id === move.productId)?.unit || 'Pcs';
                                        
                                        if (move.type === 'Stock Adjustment') {
                                            isDecrease = move.reference && move.reference.toLowerCase().includes('decrease');
                                            isIncoming = !isDecrease;
                                        }

                                        return (
                                            <tr 
                                                key={`${move.transactionId}-${idx}`} 
                                                className="hover:bg-indigo-50/30 group cursor-pointer transition-colors"
                                                onClick={() => handleRowClick(move.transactionId)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                                    {move.date}
                                                    <div className="text-[10px] text-slate-400">#{move.transactionId.slice(-6)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        move.type === 'Sale' ? 'bg-indigo-100 text-indigo-700' :
                                                        move.type === 'Purchase' ? 'bg-blue-100 text-blue-700' :
                                                        move.type === 'Stock Adjustment' ? 'bg-slate-200 text-slate-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {move.type}
                                                    </span>
                                                    {move.reference && <div className="text-[9px] text-slate-400 mt-0.5">{move.reference}</div>}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {move.productName}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-bold flex items-center justify-center gap-1 ${isIncoming ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {isIncoming ? <Plus className="w-3 h-3"/> : <Minus className="w-3 h-3"/>}
                                                        {move.quantity} <span className="text-[10px] font-normal text-slate-500 ml-0.5">{unit}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 py-1 px-2 rounded-lg w-fit mx-auto">
                                                        <span>{move.stockBefore}</span>
                                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                                        <span className="text-slate-900 font-bold">{move.stockAfter}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {(move.batchNumber || move.expiryDate) ? (
                                                        <div className="flex flex-col gap-1 items-center">
                                                            {move.batchNumber && (
                                                                <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <Hash className="w-3 h-3 text-slate-400"/> {move.batchNumber}
                                                                </span>
                                                            )}
                                                            {move.expiryDate && (
                                                                <span className="text-[10px] bg-red-50 border border-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <Clock className="w-3 h-3"/> {move.expiryDate}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openEditMovement(move); }}
                                                            className="text-slate-400 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50 transition-colors"
                                                            title={t('Modify Transaction')}
                                                        >
                                                            <Edit2 className="w-4 h-4"/>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDeleteMovement(move.transactionId, e)}
                                                            className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors"
                                                            title={t('Delete Record')}
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- EXPIRED VIEW --- */}
            {activeTab === 'expired' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-orange-800">{t('Expiry Monitor')}</h4>
                            <p className="text-sm text-orange-700">{t('Showing products expired or expiring within the next 90 days.')}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">{t('Product Name')}</th>
                                    <th className="px-6 py-4">{t('Expiry Date')}</th>
                                    <th className="px-6 py-4 text-center">{t('Days Remaining')}</th>
                                    <th className="px-6 py-4 text-center">{t('Status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expiredList.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t('No expiring products found.')}</td></tr>
                                ) : (
                                    expiredList.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                                            <td className="px-6 py-4 font-mono text-slate-600">{p.expiryDate}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-bold ${p.isExpired ? 'text-red-600' : 'text-orange-500'}`}>
                                                    {p.diffDays} {t('days')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {p.isExpired ? (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{t('Expired')}</span>
                                                ) : (
                                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">{t('Expiring Soon')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- WARRANTY VIEW --- */}
            {activeTab === 'warranty' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800">{t('Products with Warranty Coverage')}</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">{t('Product Name')}</th>
                                    <th className="px-6 py-4">{t('Category')}</th>
                                    <th className="px-6 py-4">{t('Warranty Period')}</th>
                                    <th className="px-6 py-4 text-center">{t('Stock')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {warrantyList.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t('No warranty products listed.')}</td></tr>
                                ) : (
                                    warrantyList.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{p.category}</td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full w-fit">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {p.warrantyPeriod || t('Standard Warranty')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">{p.stock} {p.unit}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bulk Restock Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{t('Bulk Restock')}</h3>
                            <button onClick={() => setShowBulkModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{t('Add stock to')} {selectedItems.length} {t('selected items')}:</p>
                        <input 
                            type="number" 
                            value={bulkQty} 
                            onChange={e => setBulkQty(parseInt(e.target.value))} 
                            className="w-full border p-3 rounded-lg mb-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder={t('Qty to add')} 
                            min="1"
                        />
                        <button onClick={handleBulkUpdate} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                            {t('Confirm Update')}
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Movement Modal */}
            {editingMovement && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-lg text-slate-800">{t('Edit Transaction')}</h3>
                            <button onClick={() => setEditingMovement(null)}><X className="w-5 h-5 text-slate-400"/></button>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{t('Product')}</p>
                            <p className="text-slate-800 font-medium">{editingMovement.productName}</p>
                        </div>
                        <div className="mb-6">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t('Quantity')}</p>
                            <input 
                                type="number" 
                                value={editQty} 
                                onChange={e => setEditQty(parseInt(e.target.value))} 
                                className="w-full border p-3 rounded-lg text-xl font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none" 
                                min="0"
                            />
                            <p className="text-xs text-center text-slate-400 mt-2">{t('Adjusting this will update current stock levels.')}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingMovement(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                                {t('Cancel')}
                            </button>
                            <button onClick={saveMovementEdit} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                                {t('Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Detail Modal */}
            {viewTransaction && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    {t('Transaction Details')}
                                </h3>
                                <p className="text-xs text-slate-500">{t('Ref')}: {viewTransaction.reference || viewTransaction.id}</p>
                            </div>
                            <button onClick={() => setViewTransaction(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('Date')}</p>
                                    <p className="font-medium text-slate-800">{viewTransaction.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('Type')}</p>
                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 mt-1">
                                        {t(viewTransaction.type)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('Entity / User')}</p>
                                    <p className="font-medium text-slate-800">{viewTransaction.entityName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('Total Amount')}</p>
                                    <p className="font-bold text-indigo-600">{formatMoney(viewTransaction.amount)}</p>
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-100 pb-2">{t('Items')}</h4>
                            <div className="space-y-2">
                                {viewTransaction.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.qty} x {formatMoney(item.price)}</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{formatMoney(item.total)}</p>
                                    </div>
                                ))}
                                {(!viewTransaction.items || viewTransaction.items.length === 0) && (
                                    <p className="text-sm text-slate-400 italic">{t('No items details available.')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockReport;