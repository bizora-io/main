import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, OnlineOrder } from '../contexts/DataContext';
import { Globe, Truck, Package, Search, ExternalLink, Settings, Save, CheckCircle, X, Copy, ShoppingCart, Clock } from 'lucide-react';

const OnlineShop: React.FC = () => {
    const { t, formatMoney } = useSettings();
    const { onlineOrders, updateOnlineOrder, courierSettings, updateCourierSettings } = useData();
    
    const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
    const [trackingNo, setTrackingNo] = useState('');

    const filteredOrders = onlineOrders.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusUpdate = (id: string, status: OnlineOrder['status']) => {
        updateOnlineOrder(id, { status });
    };

    const openOrderDetails = (order: OnlineOrder) => {
        setSelectedOrder(order);
        setTrackingNo(order.trackingNumber || '');
    };

    const handleSaveOrder = () => {
        if (selectedOrder) {
            updateOnlineOrder(selectedOrder.id, { trackingNumber: trackingNo });
            // If adding tracking, assume shipped if previously pending/processing
            if (trackingNo && (selectedOrder.status === 'Pending' || selectedOrder.status === 'Processing')) {
                updateOnlineOrder(selectedOrder.id, { status: 'Shipped' });
            }
            setSelectedOrder(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <Globe className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Online Shop')}</h1>
                    <p className="text-slate-500 text-sm">Manage orders from website and marketplaces</p>
                </div>
            </div>

            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <ShoppingCart className="w-4 h-4" /> Orders
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Settings className="w-4 h-4" /> Courier Settings
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Order ID, Customer..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 text-lg">{order.id}</h3>
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">{order.platform}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{order.customerName}</p>
                                        <p className="text-xs text-slate-500">{order.date} • {order.items.length} Items</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Truck className="w-3 h-3"/> {order.address}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <p className="font-bold text-slate-800 mt-2 text-lg">{formatMoney(order.total)}</p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <button 
                                            onClick={() => openOrderDetails(order)}
                                            className="text-xs bg-slate-900 text-white px-3 py-1 rounded hover:bg-slate-800"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredOrders.length === 0 && (
                            <div className="text-center p-8 text-slate-400">No orders found.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courierSettings.map((courier, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-slate-500" /> {courier.provider}
                                </h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={courier.enabled} 
                                        onChange={(e) => updateCourierSettings(courier.provider, { enabled: e.target.checked })} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API Key</label>
                                    <input 
                                        type="password" 
                                        value={courier.apiKey}
                                        onChange={(e) => updateCourierSettings(courier.provider, { apiKey: e.target.value })}
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Paste API Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secret Key</label>
                                    <input 
                                        type="password" 
                                        value={courier.apiSecret}
                                        onChange={(e) => updateCourierSettings(courier.provider, { apiSecret: e.target.value })}
                                        className="w-full border p-2 rounded text-sm"
                                        placeholder="Paste Secret Key"
                                    />
                                </div>
                                <button className="w-full bg-slate-100 text-slate-600 py-2 rounded text-sm font-bold hover:bg-slate-200 transition-colors">
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Order {selectedOrder.id}</h3>
                                <p className="text-sm text-slate-500">{selectedOrder.date}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-sm font-medium text-slate-700 mb-1">Items</p>
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm text-slate-600 border-b border-slate-100 last:border-0 py-1">
                                        <span>{item.qty}x {item.name}</span>
                                        <span>{formatMoney(item.price * item.qty)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-sm font-bold text-slate-800 mt-2 pt-2 border-t border-slate-200">
                                    <span>Total</span>
                                    <span>{formatMoney(selectedOrder.total)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tracking Number</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={trackingNo}
                                        onChange={e => setTrackingNo(e.target.value)}
                                        className="flex-1 border p-2 rounded-lg font-mono text-sm"
                                        placeholder="Enter tracking number"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(trackingNo);
                                            // Quick animation or tooltip could go here, for simplicity:
                                            alert("Copied!");
                                        }}
                                        className="bg-slate-100 px-3 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center min-w-[40px]"
                                        title="Copy Tracking Number"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setTrackingNo(`TRK-${Math.floor(Math.random() * 1000000)}`)}
                                        className="bg-slate-100 px-3 rounded-lg text-slate-600 hover:bg-slate-200 text-xs font-bold"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSaveOrder} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineShop;