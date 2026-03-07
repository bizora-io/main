import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Star, Zap, ChevronDown, ChevronUp, Minus, Quote, MessageSquare, X, CreditCard, Wallet, Landmark, Loader2 } from 'lucide-react';

const Subscription: React.FC = () => {
    const { t, currencySymbol } = useSettings();
    const { user, upgradeSubscription } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);
    
    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const calculatePrice = (basePrice: number) => {
        if (billingCycle === 'yearly') {
            return (basePrice * 10).toLocaleString(); // 2 months free equivalent logic
        }
        return basePrice.toLocaleString();
    };

    const handleUpgradeClick = () => {
        setShowPaymentModal(true);
    };

    const confirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        upgradeSubscription();
        setIsProcessing(false);
        setShowPaymentModal(false);
        // In a real app, you would show a success toast here
    };

    const currentPrice = calculatePrice(29);

    return (
        <div className="space-y-12 pb-12 relative">
            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg text-center mb-8 mx-4 md:mx-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12"></div>
                <p className="relative z-10 font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    Special Offer: Get 3 months free on Yearly Pro Plan! Limited time only.
                </p>
            </div>

            {/* Header */}
            <div className="text-center py-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('Subscription')}</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    Choose the perfect plan for your business. Upgrade anytime as you grow.
                </p>
                
                {/* Billing Toggle */}
                <div className="flex justify-center mt-8">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center relative">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                        >
                            Yearly <span className="text-xs text-green-600 font-bold ml-1">-20%</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {/* Free Plan */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Basic Starter</h3>
                        <p className="text-xs text-slate-500 mt-1">For small shops just starting out.</p>
                    </div>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-bold text-slate-900">Free</span>
                        <span className="text-slate-500 ml-2">/ forever</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {['Single Store', 'Basic Reports', 'Up to 50 Products', 'Email Support', 'Manual Backups'].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 bg-slate-50 cursor-default">
                        Current Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden text-white flex flex-col transform md:-translate-y-4 z-10">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                        POPULAR
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1 text-yellow-400">
                            <Crown className="w-5 h-5" />
                            <h3 className="text-lg font-bold">Nexus Pro</h3>
                        </div>
                        <p className="text-xs text-slate-400">For growing businesses needing automation.</p>
                    </div>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-bold">{currencySymbol} {currentPrice}</span>
                        <span className="text-slate-400 ml-2">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {[
                            'Unlimited Stores & Products',
                            'Advanced AI Analytics',
                            'Employee Management',
                            'Automated Tax Reports',
                            'Priority Support',
                            'E-commerce Integration',
                            'Real-time Backups'
                        ].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                <div className="p-0.5 bg-green-500/20 rounded-full flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-green-400" />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>
                    {user?.isPremium ? (
                        <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold cursor-default flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" /> Active Plan
                        </button>
                    ) : (
                        <button 
                            onClick={handleUpgradeClick}
                            className="w-full py-3 rounded-xl bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            {t('Upgrade to Premium')}
                        </button>
                    )}
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Enterprise</h3>
                        <p className="text-xs text-slate-500 mt-1">For large scale organizations.</p>
                    </div>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-bold text-slate-900">{currencySymbol} {calculatePrice(99)}</span>
                        <span className="text-slate-500 ml-2">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {[
                            'Everything in Pro',
                            'Dedicated Account Manager',
                            'Custom API Access',
                            'White-label Options',
                            'SLA 99.9% Uptime',
                            'On-premise Deployment',
                            'Advanced Security Audit'
                        ].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={() => setShowContactModal(true)}
                        className="w-full py-3 rounded-xl border border-slate-900 text-white bg-slate-900 font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Contact Sales
                    </button>
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-4xl mx-auto px-4 mt-16">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Feature Comparison</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 font-bold">
                            <tr>
                                <th className="p-4 border-b border-slate-200">Feature</th>
                                <th className="p-4 border-b border-slate-200 text-center">Basic</th>
                                <th className="p-4 border-b border-slate-200 text-center text-indigo-600">Pro</th>
                                <th className="p-4 border-b border-slate-200 text-center">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { name: 'Users', basic: '1', pro: '5', ent: 'Unlimited' },
                                { name: 'Stores', basic: '1', pro: 'Unlimited', ent: 'Unlimited' },
                                { name: 'AI Requests', basic: '50/mo', pro: '5000/mo', ent: 'Unlimited' },
                                { name: 'Support', basic: 'Email', pro: 'Priority Email', ent: '24/7 Phone' },
                                { name: 'API Access', basic: false, pro: true, ent: true },
                                { name: 'Custom Domain', basic: false, pro: false, ent: true },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-700">{row.name}</td>
                                    <td className="p-4 text-center text-slate-500">{typeof row.basic === 'boolean' ? (row.basic ? <Check className="w-4 h-4 mx-auto text-green-500"/> : <Minus className="w-4 h-4 mx-auto text-slate-300"/>) : row.basic}</td>
                                    <td className="p-4 text-center text-slate-900 font-semibold bg-indigo-50/30">{typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-4 h-4 mx-auto text-green-500"/> : <Minus className="w-4 h-4 mx-auto text-slate-300"/>) : row.pro}</td>
                                    <td className="p-4 text-center text-slate-500">{typeof row.ent === 'boolean' ? (row.ent ? <Check className="w-4 h-4 mx-auto text-green-500"/> : <Minus className="w-4 h-4 mx-auto text-slate-300"/>) : row.ent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Testimonials Section */}
             <div className="max-w-6xl mx-auto px-4 mt-16">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">What our customers say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: "Sarah Jenkins", role: "Owner, Bloom Boutique", text: "Nexus ERP transformed how we track inventory across our 3 locations. The AI insights are a game changer.", rating: 5 },
                        { name: "Michael Chen", role: "Manager, TechHub", text: "The automated tax reports saved us countless hours during the fiscal year end. Worth every penny.", rating: 5 },
                        { name: "Amira Patel", role: "CEO, Fresh Mart", text: "Customer support is outstanding. They helped us migrate all our data in less than a day.", rating: 4 }
                    ].map((review, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative hover:shadow-md transition-shadow">
                            <Quote className="w-8 h-8 text-indigo-100 absolute top-4 right-4" />
                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, starI) => (
                                    <Star key={starI} className={`w-4 h-4 ${starI < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                ))}
                            </div>
                            <p className="text-slate-600 text-sm mb-4 italic">"{review.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                                    <p className="text-xs text-slate-500">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto px-4 mt-16">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time from your account settings.' },
                        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.' },
                        { q: 'Is there a free trial for Pro?', a: 'Yes, we offer a 14-day free trial for the Pro plan so you can explore all features.' },
                        { q: 'How secure is my data?', a: 'We use industry-standard encryption and back up your data daily to ensure it is always safe.' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <button 
                                onClick={() => toggleFaq(i)}
                                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-semibold text-slate-800">{item.q}</span>
                                {openFaq === i ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {openFaq === i && (
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-slate-600 text-sm leading-relaxed">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Badges */}
            <div className="text-center mt-12 pt-12 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Trusted by 10,000+ businesses worldwide</p>
                <div className="flex justify-center gap-8 opacity-50 grayscale">
                    <div className="h-8 w-24 bg-slate-300 rounded"></div>
                    <div className="h-8 w-24 bg-slate-300 rounded"></div>
                    <div className="h-8 w-24 bg-slate-300 rounded"></div>
                    <div className="h-8 w-24 bg-slate-300 rounded"></div>
                </div>
            </div>

            {/* Contact Sales Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Contact Sales</h3>
                            <p className="text-sm text-slate-500 mt-1">Interested in the Enterprise plan? Let's talk.</p>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Request sent! We will contact you shortly."); setShowContactModal(false); }}>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                                <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Global Tech" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                                <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="name@company.com" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
                                <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" placeholder="Tell us about your requirements..." required></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                                Send Request
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Crown className="w-5 h-5 text-yellow-500" />
                                Upgrade to Pro
                            </h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-medium text-indigo-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-indigo-700">{currencySymbol} {currentPrice}</span>
                                </div>
                                <p className="text-xs text-indigo-600">Billed {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Select Payment Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                    >
                                        <CreditCard className="w-6 h-6" />
                                        <span className="text-xs font-semibold">Card</span>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('paypal')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'paypal' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                    >
                                        <Wallet className="w-6 h-6" />
                                        <span className="text-xs font-semibold">PayPal</span>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('bank')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'bank' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                    >
                                        <Landmark className="w-6 h-6" />
                                        <span className="text-xs font-semibold">Bank</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={confirmPayment}>
                                {paymentMethod === 'card' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Card Number</label>
                                            <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0000 0000 0000 0000" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Expiry</label>
                                                <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="MM/YY" required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">CVC</label>
                                                <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="123" required />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'paypal' && (
                                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200 border-dashed animate-in fade-in slide-in-from-top-4 duration-300">
                                        <p className="text-sm text-slate-600 mb-2">You will be redirected to PayPal to complete your purchase.</p>
                                    </div>
                                )}

                                {paymentMethod === 'bank' && (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Bank Name:</span>
                                            <span className="font-semibold text-slate-800">Global Tech Bank</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Account No:</span>
                                            <span className="font-semibold text-slate-800">8822 1000 5599 2211</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Swift Code:</span>
                                            <span className="font-semibold text-slate-800">GTBXXUS33</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Upload Payment Receipt</label>
                                            <input type="file" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                        </div>
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isProcessing}
                                    className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${currencySymbol} ${currentPrice}`}
                                </button>
                                
                                <p className="text-center mt-3 text-xs text-slate-400">
                                    Secure 256-bit SSL Encrypted Payment
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscription;