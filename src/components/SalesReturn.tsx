
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, LedgerEntry } from '../contexts/DataContext';
import { Search, RotateCcw, ArrowRight, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SalesReturn: React.FC = () => {
    const { t, currencySymbol } = useSettings();
    const { transactions, addTransaction, updateProductStock } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState<LedgerEntry | null>(null);
    const [returnQuantities, setReturnQuantities] = useState<{[key: string]: number}>({});
    const [refundMethod, setRefundMethod] = useState<'Cash' | 'Card' | 'Bank' | 'Mobile'>('Cash');
    const [returnReason, setReturnReason] = useState('');
    const [restockItems, setRestockItems] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');

    const location = useLocation();
    const state = location.state as { invoiceId?: string } | null;

    // Sales Filter
    const sales = transactions.filter(t => 
        t.type === 'Sale' && 
        (t.entityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         t.id.includes(searchTerm))
    );

    // Effect to handle navigation from invoice
    useEffect(() => {
        if (state?.invoiceId) {
            const sale = transactions.find(t => t.id === state.invoiceId);
            if (sale && sale.type === 'Sale') {
                handleSelectSale(sale);
            }
        }
    }, [state, transactions]);

    const handleSelectSale = (sale: LedgerEntry) => {
        setSelectedSale(sale);
        setReturnQuantities({});
        setSuccessMsg('');
    };

    const handleQuantityChange = (itemId: string, maxQty: number, val: string) => {
        const qty = parseInt(val) || 0;
        if (qty < 0) return;
        if (qty > maxQty) return;
        setReturnQuantities(prev => ({ ...prev, [itemId]: qty }));
    };

    const calculateRefund = () => {
        if (!selectedSale || !selectedSale.items) return 0;
        return selectedSale.items.reduce((acc, item) => {
            const qty = returnQuantities[item.productId] || 0;
            return acc + (qty * item.price);
        }, 0);
    };

    const processReturn = () => {
        if (!selectedSale || !selectedSale.items) return;
        
        const refundAmount = calculateRefund();
        if (refundAmount <= 0) {
            alert("Please select items to return");
            return;
        }

        // 1. Update Stock if requested
        if (restockItems) {
            selectedSale.items.forEach(item => {
                const qty = returnQuantities[item.productId] || 0;
                if (qty > 0) {
                    updateProductStock(item.productId, qty, 'increase');
                }
            });
        }

        // 2. Create Return Transaction
        const returnTx: LedgerEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            entityName: selectedSale.entityName,
            type: 'Sales Return',
            amount: refundAmount,
            paymentMethod: refundMethod as any,
            reference: `RET-${selectedSale.id.slice(-6)}`,
            notes: returnReason,
            items: selectedSale.items
                .filter(item => (returnQuantities[item.productId] || 0) > 0)
                .map(item => ({
                    ...item,
                    qty: returnQuantities[item.productId]
                })),
            timeline: [
                { status: 'Return Processed', date: new Date().toISOString(), note: `Reason: ${returnReason}` }
            ]
        };

        addTransaction(returnTx);
        setSuccessMsg(`Return processed successfully. Refund: ${currencySymbol}${refundAmount.toFixed(2)}`);
        
        // Reset after short delay
        setTimeout(() => {
            setSelectedSale(null);
            setReturnQuantities({});
            setSuccessMsg('');
        }, 3000);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                    <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Sales Return')}</h1>
                    <p className="text-slate-500 text-sm">Process refunds and restock returned items</p>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Sales List */}
                <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Customer or Invoice ID..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sales.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No sales found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {sales.map(sale => (
                                    <button 
                                        key={sale.id}
                                        onClick={() => handleSelectSale(sale)}
                                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex justify-between items-center ${selectedSale?.id === sale.id ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800">{sale.entityName}</p>
                                            <p className="text-xs text-slate-500">#{sale.id.slice(-6).toUpperCase()} • {sale.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-700">{currencySymbol} {sale.amount.toFixed(2)}</p>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{sale.items?.length || 0} items</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Return Details */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    {selectedSale ? (
                        <>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="font-bold text-slate-800">Return Items</h2>
                                    <p className="text-sm text-slate-500">Invoice #{selectedSale.id.slice(-6).toUpperCase()} - {selectedSale.date}</p>
                                </div>
                                {successMsg && (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium">
                                        <CheckCircle className="w-4 h-4" /> {successMsg}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Product</th>
                                            <th className="px-4 py-3 text-center">Orig Qty</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-center">Return Qty</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Refund</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {selectedSale.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-4 font-medium text-slate-800">{item.name}</td>
                                                <td className="px-4 py-4 text-center text-slate-500">{item.qty}</td>
                                                <td className="px-4 py-4 text-right text-slate-500">{currencySymbol} {item.price.toFixed(2)}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max={item.qty}
                                                            value={returnQuantities[item.productId] || ''}
                                                            onChange={e => handleQuantityChange(item.productId, item.qty, e.target.value)}
                                                            className="w-20 text-center border border-slate-300 rounded p-1 focus:ring-2 focus:ring-red-500 outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-slate-700">
                                                    {currencySymbol} {((returnQuantities[item.productId] || 0) * item.price).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Refund Method</label>
                                        <select 
                                            value={refundMethod}
                                            onChange={e => setRefundMethod(e.target.value as any)}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 bg-white"
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="Bank">Bank Transfer</option>
                                            <option value="Mobile">Mobile Banking</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Return Reason</label>
                                        <input 
                                            type="text"
                                            value={returnReason}
                                            onChange={e => setReturnReason(e.target.value)}
                                            placeholder="e.g. Damaged, Wrong Item, Customer Change of Mind"
                                            className="w-full p-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 py-2">
                                    <input 
                                        type="checkbox"
                                        id="restock"
                                        checked={restockItems}
                                        onChange={e => setRestockItems(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="restock" className="text-sm font-bold text-slate-700 cursor-pointer">
                                        Restock items into inventory
                                    </label>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Total Refund</span>
                                        <span className="text-2xl font-black text-red-600">{currencySymbol} {calculateRefund().toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setSelectedSale(null)}
                                            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={processReturn}
                                            className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-5 h-5" /> Process Return
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <RotateCcw className="w-16 h-16 mb-4 opacity-10" />
                            <p className="text-lg font-medium">Select a sale to process return</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesReturn;
