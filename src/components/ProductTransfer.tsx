import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useStores } from '../contexts/StoreContext';
import { useData } from '../contexts/DataContext';
import { ArrowRightLeft, Plus, Trash2, Store, Package, AlertCircle, ArrowRight } from 'lucide-react';

interface TransferItem {
    productId: string;
    productName: string;
    quantity: number;
    currentStock: number;
}

const ProductTransfer: React.FC = () => {
    const { t } = useSettings();
    const { stores } = useStores();
    const { products } = useData();
    
    const [sourceStore, setSourceStore] = useState('');
    const [destStore, setDestStore] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Derived state for immediate validation
    const productData = products.find(p => p.id === selectedProduct);
    const existingQty = transferItems
        .filter(item => item.productId === selectedProduct)
        .reduce((acc, item) => acc + item.quantity, 0);
    // Note: Assuming 'stock' in DataContext is the total stock or source stock. 
    // In a real multi-store app, we'd need store-specific stock. 
    // For this prototype, we'll use the global stock as the pool.
    const availableStock = productData ? productData.stock - existingQty : 0;
    
    const isExceedingStock = !!selectedProduct && (quantity > availableStock);

    const handleAddItem = () => {
        setErrorMsg('');
        if (!selectedProduct) {
             setErrorMsg(t('Please select a product'));
             return;
        }

        if (quantity <= 0) {
             setErrorMsg(t('Quantity must be greater than 0'));
             return;
        }
        
        if (isExceedingStock) {
            setErrorMsg(`${t('Quantity exceeds available stock')} (${availableStock})`);
            return;
        }

        if (productData) {
            setTransferItems([...transferItems, {
                productId: productData.id,
                productName: productData.name,
                quantity: quantity,
                currentStock: productData.stock
            }]);
            setSelectedProduct('');
            setQuantity(1);
        }
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...transferItems];
        newItems.splice(index, 1);
        setTransferItems(newItems);
    };

    const handleTransfer = () => {
        if (!sourceStore || !destStore || transferItems.length === 0) return;
        if (sourceStore === destStore) {
            alert(t('Source and Destination cannot be the same'));
            return;
        }
        
        // Logic to process transfer would go here (API call or DataContext update)
        // For now, we simulate success
        
        setSuccessMsg(t('Transfer successful!'));
        setTransferItems([]);
        setSourceStore('');
        setDestStore('');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                    <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Product Transfer')}</h1>
                    <p className="text-slate-500 text-sm">Move inventory between stores seamlessly</p>
                </div>
            </div>

            {successMsg && (
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-50 rounded-full" />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-400" />
                            Store Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{t('Source Store')}</label>
                                <select 
                                    value={sourceStore}
                                    onChange={(e) => setSourceStore(e.target.value)}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">{t('Select Store')}</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="flex justify-center">
                                <ArrowRight className="w-5 h-5 text-slate-300" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{t('Destination Store')}</label>
                                <select 
                                    value={destStore}
                                    onChange={(e) => setDestStore(e.target.value)}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">{t('Select Store')}</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            Add Products
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{t('Select Product')}</label>
                                <select 
                                    value={selectedProduct}
                                    onChange={(e) => {
                                        setSelectedProduct(e.target.value);
                                        setErrorMsg('');
                                    }}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Choose a product...</option>
                                    {products.filter(p => !p.isDeleted).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{t('Quantity')}</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => {
                                            setQuantity(parseInt(e.target.value) || 0);
                                            setErrorMsg('');
                                        }}
                                        className={`w-full p-2.5 border rounded-lg text-sm outline-none transition-colors ${
                                            isExceedingStock 
                                            ? 'border-red-300 focus:ring-2 focus:ring-red-200 text-red-600 bg-red-50' 
                                            : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                    />
                                    {isExceedingStock && (
                                        <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                                {isExceedingStock && (
                                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                                        Exceeds available stock ({availableStock})
                                    </p>
                                )}
                            </div>
                            
                            {errorMsg && !isExceedingStock && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-medium">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            <button 
                                onClick={handleAddItem}
                                disabled={!selectedProduct || quantity < 1 || isExceedingStock}
                                className="w-full bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                {t('Add to List')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800">{t('Items to Transfer')}</h2>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{transferItems.length} items</span>
                        </div>
                        
                        <div className="flex-1 p-0 overflow-y-auto">
                            {transferItems.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                    <Package className="w-12 h-12 mb-3 opacity-20" />
                                    <p>No items added yet</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">{t('Product ID')}</th>
                                            <th className="px-6 py-3 font-medium">Product Name</th>
                                            <th className="px-6 py-3 font-medium text-center">{t('Current Stock')}</th>
                                            <th className="px-6 py-3 font-medium text-center">{t('Quantity')}</th>
                                            <th className="px-6 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transferItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                    {item.productId.toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">{item.productName}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.currentStock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <button 
                                onClick={handleTransfer}
                                disabled={transferItems.length === 0 || !sourceStore || !destStore}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                                {t('Transfer')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductTransfer;