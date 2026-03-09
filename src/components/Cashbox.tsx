
import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, LedgerEntry, FinancialAccount } from '../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Plus, X, Smartphone, Landmark, Wallet, ArrowRightLeft, Edit2, Trash2 } from 'lucide-react';

const Cashbox: React.FC = () => {
  const { t, currencySymbol, formatMoney } = useSettings();
  const { transactions, financialAccounts, addTransaction, addFinancialAccount, transferFunds, deleteItem, updateTransaction } = useData();
  
  // View State
  const [activeAccountId, setActiveAccountId] = useState<string>('all');
  
  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingTx, setEditingTx] = useState<LedgerEntry | null>(null);

  // Forms
  const [txForm, setTxForm] = useState({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Expense' as 'Income' | 'Expense',
      accountId: ''
  });

  const [accForm, setAccForm] = useState<Partial<FinancialAccount>>({
      name: '',
      type: 'Bank',
      balance: 0,
      accountNumber: '',
      bankName: ''
  });

  const [transferForm, setTransferForm] = useState({
      fromId: '',
      toId: '',
      amount: '',
      note: ''
  });

  // Calculate Totals
  const totalCash = financialAccounts.filter(a => a.type === 'Cash').reduce((sum, a) => sum + a.balance, 0);
  const totalBank = financialAccounts.filter(a => a.type === 'Bank').reduce((sum, a) => sum + a.balance, 0);
  const totalMobile = financialAccounts.filter(a => a.type === 'Mobile Wallet').reduce((sum, a) => sum + a.balance, 0);
  const grandTotal = totalCash + totalBank + totalMobile;

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
      let data = [...transactions];
      // Filter out deleted transactions
      data = data.filter(t => !t.isDeleted);

      if (activeAccountId !== 'all') {
          data = data.filter(t => t.accountId === activeAccountId);
      }
      // Filter out non-financial movements if needed, but for "Accounts", we want to see money movement
      // Including Transfers, Sales, Purchases, Expenses, Income
      return data.filter(t => ['Sale', 'Purchase', 'Income', 'Expense', 'Transfer', 'Salary'].includes(t.type) && t.paymentMethod !== 'Due')
                 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeAccountId]);

  // Handlers
  const handleSaveTx = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(txForm.amount);
      if (!amount || amount <= 0 || !txForm.accountId) return;

      const account = financialAccounts.find(a => a.id === txForm.accountId);

      const newTx: LedgerEntry = {
          id: Date.now().toString(),
          date: txForm.date,
          entityName: txForm.description || 'Manual Entry',
          type: txForm.type,
          amount: amount,
          paymentMethod: account?.type === 'Bank' ? 'Bank' : account?.type === 'Mobile Wallet' ? 'Mobile' : 'Cash',
          accountId: txForm.accountId,
          details: { subtotal: amount, tax: 0, discount: 0, delivery: 0 }
      };

      addTransaction(newTx);
      setShowAddTxModal(false);
      setTxForm({ ...txForm, amount: '', description: '' });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
      e.preventDefault();
      if (!accForm.name) return;
      
      addFinancialAccount({
          id: Date.now().toString(),
          name: accForm.name,
          type: accForm.type as any,
          balance: Number(accForm.balance),
          accountNumber: accForm.accountNumber,
          bankName: accForm.bankName
      });
      setShowAddAccountModal(false);
      setAccForm({ name: '', type: 'Bank', balance: 0, accountNumber: '', bankName: '' });
  };

  const handleTransfer = (e: React.FormEvent) => {
      e.preventDefault();
      const amt = parseFloat(transferForm.amount);
      if (!transferForm.fromId || !transferForm.toId || !amt || amt <= 0) return;
      if (transferForm.fromId === transferForm.toId) {
          alert("Cannot transfer to same account");
          return;
      }

      transferFunds(transferForm.fromId, transferForm.toId, amt, transferForm.note);
      setShowTransferModal(false);
      setTransferForm({ fromId: '', toId: '', amount: '', note: '' });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
      if (e) {
          e.preventDefault();
          e.stopPropagation();
      }
      if (window.confirm("Are you sure you want to move this transaction to Recycle Bin?")) {
          deleteItem('transaction', id);
      }
  };

  const handleUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingTx) {
          updateTransaction(editingTx.id, editingTx);
          setEditingTx(null);
      }
  };

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
               <h1 className="text-2xl font-bold text-slate-800">{t('Accounts & Cash')}</h1>
               <p className="text-slate-500 text-sm">Manage Cash, Bank Accounts, and Mobile Wallets</p>
           </div>
           <div className="flex gap-2">
               <button 
                    onClick={() => setShowTransferModal(true)}
                    className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                    <ArrowRightLeft className="w-4 h-4" /> {t('Transfer')}
               </button>
               <button 
                    onClick={() => setShowAddTxModal(true)}
                    className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" /> {t('Income')}/{t('Expense')}
               </button>
               <button 
                    onClick={() => setShowAddAccountModal(true)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" /> {t('Add Account')}
               </button>
           </div>
       </div>

       {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
             <div className="flex items-center gap-2 mb-1 opacity-80">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('Total Liquidity')}</span>
             </div>
             <h2 className="text-2xl font-bold">{formatMoney(grandTotal)}</h2>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1 text-slate-500">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('Cash in Hand')}</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-800">{formatMoney(totalCash)}</h2>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1 text-slate-500">
                <Landmark className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('Bank Balance')}</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-800">{formatMoney(totalBank)}</h2>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-1 text-slate-500">
                <Smartphone className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('Mobile Wallet')}</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-800">{formatMoney(totalMobile)}</h2>
          </div>
       </div>

       {/* Accounts List & Ledger */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Accounts List */}
           <div className="space-y-4">
               <div className="flex items-center justify-between">
                   <h3 className="font-bold text-slate-800">{t('Your Accounts')}</h3>
               </div>
               <div className="space-y-3">
                   <div 
                        onClick={() => setActiveAccountId('all')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${activeAccountId === 'all' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'}`}
                   >
                       <div className="flex justify-between items-center">
                           <span className="font-bold text-sm">{t('All Accounts')}</span>
                           <span className="font-mono">{formatMoney(grandTotal)}</span>
                       </div>
                   </div>
                   {financialAccounts.map(acc => (
                       <div 
                            key={acc.id}
                            onClick={() => setActiveAccountId(acc.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeAccountId === acc.id ? 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
                       >
                           <div className="flex justify-between items-start mb-2">
                               <div>
                                   <h4 className="font-bold text-slate-800 text-sm">{acc.name}</h4>
                                   <p className="text-xs text-slate-500">{acc.type}</p>
                               </div>
                               {acc.type === 'Bank' ? <Landmark className="w-4 h-4 text-blue-500" /> : acc.type === 'Mobile Wallet' ? <Smartphone className="w-4 h-4 text-pink-500" /> : <Wallet className="w-4 h-4 text-emerald-500" />}
                           </div>
                           <div className="flex justify-between items-end">
                               <p className="text-xs text-slate-400 font-mono">{acc.accountNumber || 'N/A'}</p>
                               <p className={`font-bold ${activeAccountId === acc.id ? 'text-indigo-700' : 'text-slate-800'}`}>{formatMoney(acc.balance)}</p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Ledger / Transactions */}
           <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-xl">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       {t('Transaction History')} 
                       <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                           {activeAccountId === 'all' ? t('All Accounts') : financialAccounts.find(a=>a.id===activeAccountId)?.name}
                       </span>
                   </h3>
                   <div className="text-xs text-slate-500">{filteredTransactions.length} {t('records')}</div>
               </div>
               <div className="flex-1 overflow-y-auto p-0">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-white text-slate-500 font-medium border-b border-slate-100 sticky top-0">
                           <tr>
                               <th className="px-6 py-3">{t('Date')}</th>
                               <th className="px-6 py-3">{t('Description')}</th>
                               <th className="px-6 py-3 text-center">{t('Status')}</th>
                               <th className="px-6 py-3 text-right">{t('Amount')}</th>
                               <th className="px-6 py-3 text-right">{t('Action')}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {filteredTransactions.length === 0 ? (
                               <tr><td colSpan={5} className="p-8 text-center text-slate-400">No transactions found for this selection.</td></tr>
                           ) : (
                               filteredTransactions.map(tx => {
                                   let colorClass = 'text-slate-800';
                                   let sign = '';
                                   if (['Sale', 'Income', 'Purchase Return'].includes(tx.type)) {
                                       colorClass = 'text-emerald-600';
                                       sign = '+';
                                   } else if (['Purchase', 'Expense', 'Sales Return', 'Salary'].includes(tx.type)) {
                                       colorClass = 'text-red-600';
                                       sign = '-';
                                   } else if (tx.type === 'Transfer') {
                                       colorClass = 'text-blue-600';
                                   }

                                   return (
                                       <tr key={tx.id} className="hover:bg-slate-50 group">
                                           <td className="px-6 py-3 whitespace-nowrap text-slate-500">{tx.date}</td>
                                           <td className="px-6 py-3">
                                               <div className="font-medium text-slate-800">{tx.entityName}</div>
                                               {tx.reference && <div className="text-xs text-slate-400">{tx.reference}</div>}
                                           </td>
                                           <td className="px-6 py-3 text-center">
                                               <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">{tx.type}</span>
                                           </td>
                                           <td className={`px-6 py-3 text-right font-bold ${colorClass}`}>
                                               {sign} {formatMoney(tx.amount)}
                                           </td>
                                           <td className="px-6 py-3 text-right">
                                               <div className="flex justify-end gap-2">
                                                   <button 
                                                       onClick={() => setEditingTx(tx)}
                                                       className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                       title="Edit"
                                                   >
                                                       <Edit2 className="w-4 h-4" />
                                                   </button>
                                                   <button 
                                                       onClick={() => handleDelete(tx.id)}
                                                       className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                       title="Delete"
                                                   >
                                                       <Trash2 className="w-4 h-4" />
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
       </div>

       {/* Add Transaction Modal */}
       {showAddTxModal && (
           <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-800">{t('Record Income / Expense')}</h3>
                       <button onClick={() => setShowAddTxModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                   </div>
                   <form onSubmit={handleSaveTx} className="p-6 space-y-4">
                       <div className="flex bg-slate-100 p-1 rounded-lg">
                           <button type="button" onClick={() => setTxForm({...txForm, type: 'Income'})} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${txForm.type === 'Income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}>{t('Income')}</button>
                           <button type="button" onClick={() => setTxForm({...txForm, type: 'Expense'})} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${txForm.type === 'Expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}>{t('Expense')}</button>
                       </div>
                       
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Account')}</label>
                           <select 
                                value={txForm.accountId} 
                                onChange={e => setTxForm({...txForm, accountId: e.target.value})}
                                className="w-full border p-2 rounded-lg bg-white"
                                required
                           >
                               <option value="">{t('Select Account...')}</option>
                               {financialAccounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatMoney(a.balance)})</option>)}
                           </select>
                       </div>

                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Amount')}</label>
                           <input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} className="w-full border p-2 rounded-lg" required />
                       </div>

                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Description')}</label>
                           <input type="text" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} className="w-full border p-2 rounded-lg" placeholder={t('e.g. Utility Bill')} required />
                       </div>

                       <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">{t('Save')}</button>
                   </form>
               </div>
           </div>
       )}

       {/* Edit Transaction Modal */}
       {editingTx && (
           <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-800">Edit Transaction</h3>
                       <button onClick={() => setEditingTx(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                   </div>
                   <form onSubmit={handleUpdate} className="p-6 space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Entity / Description')}</label>
                           <input 
                                type="text" 
                                value={editingTx.entityName}
                                onChange={e => setEditingTx({...editingTx, entityName: e.target.value})}
                                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Amount')}</label>
                           <input 
                                type="number" 
                                value={editingTx.amount}
                                onChange={e => setEditingTx({...editingTx, amount: parseFloat(e.target.value)})}
                                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('Date')}</label>
                           <input 
                                type="date" 
                                value={editingTx.date}
                                onChange={e => setEditingTx({...editingTx, date: e.target.value})}
                                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           />
                       </div>
                       <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">{t('Update Transaction')}</button>
                   </form>
               </div>
           </div>
       )}

       {/* Add Account Modal */}
       {showAddAccountModal && (
           <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-800">{t('Add Financial Account')}</h3>
                       <button onClick={() => setShowAddAccountModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                   </div>
                   <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Account Name')}</label>
                           <input type="text" value={accForm.name} onChange={e => setAccForm({...accForm, name: e.target.value})} className="w-full border p-2 rounded-lg" placeholder={t('e.g. BRAC Bank')} required />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Type')}</label>
                           <select value={accForm.type} onChange={e => setAccForm({...accForm, type: e.target.value as any})} className="w-full border p-2 rounded-lg bg-white">
                               <option value="Cash">{t('Cash')}</option>
                               <option value="Bank">{t('Bank')}</option>
                               <option value="Mobile Wallet">{t('Mobile Wallet')}</option>
                           </select>
                       </div>
                       {accForm.type === 'Bank' && (
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Account Number')}</label>
                               <input type="text" value={accForm.accountNumber} onChange={e => setAccForm({...accForm, accountNumber: e.target.value})} className="w-full border p-2 rounded-lg" />
                           </div>
                       )}
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Opening Balance')}</label>
                           <input type="number" value={accForm.balance} onChange={e => setAccForm({...accForm, balance: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg" />
                       </div>
                       <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">{t('Create Account')}</button>
                   </form>
               </div>
           </div>
       )}

       {/* Transfer Modal */}
       {showTransferModal && (
           <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-800">{t('Transfer Funds (Contra)')}</h3>
                       <button onClick={() => setShowTransferModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                   </div>
                   <form onSubmit={handleTransfer} className="p-6 space-y-4">
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('From Account')}</label>
                           <select 
                                value={transferForm.fromId} 
                                onChange={e => setTransferForm({...transferForm, fromId: e.target.value})}
                                className="w-full border p-2 rounded-lg bg-white"
                                required
                           >
                               <option value="">{t('Select Source...')}</option>
                               {financialAccounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatMoney(a.balance)})</option>)}
                           </select>
                       </div>
                       
                       <div className="flex justify-center">
                           <ArrowDownLeft className="w-5 h-5 text-slate-300" />
                       </div>

                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('To Account')}</label>
                           <select 
                                value={transferForm.toId} 
                                onChange={e => setTransferForm({...transferForm, toId: e.target.value})}
                                className="w-full border p-2 rounded-lg bg-white"
                                required
                           >
                               <option value="">{t('Select Destination...')}</option>
                               {financialAccounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatMoney(a.balance)})</option>)}
                           </select>
                       </div>

                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Amount')}</label>
                           <input type="number" value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} className="w-full border p-2 rounded-lg font-bold" required />
                       </div>

                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('Note')}</label>
                           <input type="text" value={transferForm.note} onChange={e => setTransferForm({...transferForm, note: e.target.value})} className="w-full border p-2 rounded-lg" placeholder={t('Optional')} />
                       </div>

                       <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">{t('Confirm Transfer')}</button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default Cashbox;
