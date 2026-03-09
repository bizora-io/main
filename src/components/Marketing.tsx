import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, PromoCode } from '../contexts/DataContext';
import { Megaphone, Mail, MessageSquare, Plus, Tag, Calendar, Users, Send, CheckCircle, Clock, Trash2, X, Zap, BarChart } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    type: 'SMS' | 'Email';
    status: 'Sent' | 'Scheduled' | 'Draft';
    date: string;
    audience: string;
    reach: number;
    content?: string;
}

const Marketing: React.FC = () => {
    const { t, currencySymbol } = useSettings();
    const { customers, promoCodes, addPromoCode, deletePromoCode, logAction } = useData();
    const [activeTab, setActiveTab] = useState<'campaigns' | 'promotions'>('campaigns');
    
    // Mock Campaigns State
    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: '1', name: 'Ramadan Special Sale', type: 'SMS', status: 'Sent', date: '2024-03-10', audience: 'All Customers', reach: 120, content: 'Flat 50% off on all items! Visit us today.' },
        { id: '2', name: 'New Collection Launch', type: 'Email', status: 'Scheduled', date: '2024-03-25', audience: 'High Value', reach: 45, content: 'Check out our new summer arrivals.' }
    ]);

    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', type: 'SMS', content: '', audience: 'All' });
    const [isSending, setIsSending] = useState(false);

    // Promo Code State
    const [newPromo, setNewPromo] = useState<Partial<PromoCode>>({ code: '', discount: 0, type: 'fixed', status: 'active' });

    const handleCreateCampaign = () => {
        if (!newCampaign.name || !newCampaign.content) return;
        setIsSending(true);
        
        // Simulate API
        setTimeout(() => {
            const reach = newCampaign.audience === 'All' ? customers.length : Math.floor(customers.length * 0.3);
            const campaign: Campaign = {
                id: Date.now().toString(),
                name: newCampaign.name,
                type: newCampaign.type as 'SMS' | 'Email',
                status: 'Sent',
                date: new Date().toISOString().split('T')[0],
                audience: newCampaign.audience,
                reach: reach || 0,
                content: newCampaign.content
            };
            setCampaigns([campaign, ...campaigns]);
            logAction('Marketing', `Sent ${campaign.type} Campaign`, `Campaign: ${campaign.name}`);
            setShowCampaignModal(false);
            setNewCampaign({ name: '', type: 'SMS', content: '', audience: 'All' });
            setIsSending(false);
        }, 1500);
    };

    const handleAddPromo = () => {
        if (newPromo.code && newPromo.discount) {
            addPromoCode({ ...newPromo, id: Date.now().toString() } as PromoCode);
            setNewPromo({ code: '', discount: 0, type: 'fixed', status: 'active' });
            logAction('Marketing', 'Created Promo Code', `Code: ${newPromo.code}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                    <Megaphone className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Marketing')}</h1>
                    <p className="text-slate-500 text-sm">Campaigns, promotions, and customer engagement</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Campaigns</p>
                        <h3 className="text-2xl font-bold text-slate-800">{campaigns.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                        <Send className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Reach</p>
                        <h3 className="text-2xl font-bold text-slate-800">{campaigns.reduce((acc, c) => acc + c.reach, 0)}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Active Promos</p>
                        <h3 className="text-2xl font-bold text-slate-800">{promoCodes.length}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <Tag className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Send className="w-4 h-4" /> Campaigns
                </button>
                <button 
                    onClick={() => setActiveTab('promotions')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'promotions' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Tag className="w-4 h-4" /> Promotions
                </button>
            </div>

            {/* --- CAMPAIGNS TAB --- */}
            {activeTab === 'campaigns' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recent Campaigns</h3>
                        <button 
                            onClick={() => setShowCampaignModal(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> New Campaign
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {campaigns.map(camp => (
                            <div key={camp.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${camp.type === 'SMS' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {camp.type === 'SMS' ? <MessageSquare className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{camp.name}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-1">{camp.content}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-400">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {camp.date}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {camp.audience} ({camp.reach})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        camp.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 
                                        camp.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {camp.status}
                                    </span>
                                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PROMOTIONS TAB --- */}
            {activeTab === 'promotions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> Create New Promotion
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Promo Code</label>
                                <input 
                                    type="text" 
                                    value={newPromo.code} 
                                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                                    className="w-full border p-2 rounded-lg font-bold placeholder:font-normal"
                                    placeholder="e.g. SUMMER20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount Value</label>
                                <input 
                                    type="number" 
                                    value={newPromo.discount} 
                                    onChange={e => setNewPromo({...newPromo, discount: parseFloat(e.target.value)})}
                                    className="w-full border p-2 rounded-lg"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                <select 
                                    value={newPromo.type} 
                                    onChange={e => setNewPromo({...newPromo, type: e.target.value as any})}
                                    className="w-full border p-2 rounded-lg bg-white"
                                >
                                    <option value="fixed">Fixed Amount ({currencySymbol})</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>
                            <button onClick={handleAddPromo} className="bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                                Add Promotion
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Discount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {promoCodes.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">No active promotions.</td></tr>
                                ) : (
                                    promoCodes.map(promo => (
                                        <tr key={promo.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono font-bold text-slate-800 text-lg">{promo.code}</td>
                                            <td className="px-6 py-4 font-bold text-emerald-600">
                                                {promo.type === 'fixed' ? currencySymbol : ''}{promo.discount}{promo.type === 'percentage' ? '%' : ''}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 capitalize">
                                                    {promo.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => deletePromoCode(promo.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors">
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Campaign Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">New Campaign</h3>
                            <button onClick={() => setShowCampaignModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Campaign Name</label>
                                <input 
                                    type="text" 
                                    value={newCampaign.name}
                                    onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="e.g. Winter Sale Announcement"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                    <select 
                                        value={newCampaign.type}
                                        onChange={e => setNewCampaign({...newCampaign, type: e.target.value})}
                                        className="w-full border p-2 rounded-lg bg-white"
                                    >
                                        <option value="SMS">SMS</option>
                                        <option value="Email">Email</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience</label>
                                    <select 
                                        value={newCampaign.audience}
                                        onChange={e => setNewCampaign({...newCampaign, audience: e.target.value})}
                                        className="w-full border p-2 rounded-lg bg-white"
                                    >
                                        <option value="All">All Customers</option>
                                        <option value="High Value">VIP / High Value</option>
                                        <option value="Inactive">Inactive (&gt;30 days)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message Content</label>
                                <textarea 
                                    value={newCampaign.content}
                                    onChange={e => setNewCampaign({...newCampaign, content: e.target.value})}
                                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
                                    placeholder={newCampaign.type === 'SMS' ? "Keep it short (max 160 chars)" : "Subject and body..."}
                                />
                                {newCampaign.type === 'SMS' && (
                                    <p className="text-xs text-right text-slate-400 mt-1">{newCampaign.content.length} chars</p>
                                )}
                            </div>
                            <button 
                                onClick={handleCreateCampaign}
                                disabled={isSending}
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSending ? 'Sending...' : 'Launch Campaign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketing;