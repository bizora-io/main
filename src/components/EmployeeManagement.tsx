import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, LedgerEntry } from '../contexts/DataContext';
import { Staff } from '../types';
import { Users, Clock, DollarSign, Award, MapPin, Calendar, CheckCircle, XCircle, Search, Save, Star, TrendingUp, UserCheck, Briefcase, AlertCircle, Plus, Trash2 } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
    const { t, currencySymbol, formatMoney } = useSettings();
    const { staff, markAttendance, updateStaff, updatePerformance, addTransaction, transactions, addStaff, deleteStaff } = useData();
    const [activeTab, setActiveTab] = useState<'staff' | 'attendance' | 'payroll' | 'performance'>('staff');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Derived Data
    const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // --- SUB-COMPONENTS ---

    const StaffListTab = () => {
        const [editingId, setEditingId] = useState<string | null>(null);
        const [editData, setEditData] = useState<Partial<Staff>>({});

        const handleEdit = (employee: Staff) => {
            setEditingId(employee.id);
            setEditData({ 
                name: employee.name,
                role: employee.role,
                status: employee.status,
                pin: employee.pin,
                basicSalary: employee.basicSalary, 
                joiningDate: employee.joiningDate,
                salesTarget: employee.salesTarget,
                commissionRate: employee.commissionRate
            });
        };

        const handleSave = (id: string) => {
            updateStaff(id, editData);
            setEditingId(null);
        };

        const handleDelete = (id: string) => {
            if (window.confirm('Are you sure you want to delete this employee?')) {
                deleteStaff(id);
            }
        };

        return (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add New Employee
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                    {filteredStaff.map(employee => (
                        <div key={employee.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-lg">
                                        {employee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{employee.name}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {employee.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => editingId === employee.id ? handleSave(employee.id) : handleEdit(employee)}
                                        className={`text-xs px-3 py-1 rounded border transition-colors ${editingId === employee.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {editingId === employee.id ? 'Save' : 'Edit'}
                                    </button>
                                    {editingId !== employee.id && (
                                        <button 
                                            onClick={() => handleDelete(employee.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {editingId === employee.id ? (
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={editData.name || ''} 
                                            onChange={e => setEditData({...editData, name: e.target.value})}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Role</label>
                                        <select 
                                            value={editData.role || ''} 
                                            onChange={e => setEditData({...editData, role: e.target.value})}
                                            className="w-full p-2 border rounded text-sm"
                                        >
                                            <option value="Manager">Manager</option>
                                            <option value="Salesperson">Salesperson</option>
                                            <option value="Stock Manager">Stock Manager</option>
                                            <option value="Cashier">Cashier</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                                        <select 
                                            value={editData.status || ''} 
                                            onChange={e => setEditData({...editData, status: e.target.value as 'Active' | 'Inactive'})}
                                            className="w-full p-2 border rounded text-sm"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Basic Salary</label>
                                        <input 
                                            type="number" 
                                            value={editData.basicSalary || ''} 
                                            onChange={e => setEditData({...editData, basicSalary: parseFloat(e.target.value)})}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Joining Date</label>
                                        <input 
                                            type="date" 
                                            value={editData.joiningDate || ''} 
                                            onChange={e => setEditData({...editData, joiningDate: e.target.value})}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Sales Target</label>
                                        <input 
                                            type="number" 
                                            value={editData.salesTarget || ''} 
                                            onChange={e => setEditData({...editData, salesTarget: parseFloat(e.target.value)})}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Commission (%)</label>
                                        <input 
                                            type="number" 
                                            value={editData.commissionRate || ''} 
                                            onChange={e => setEditData({...editData, commissionRate: parseFloat(e.target.value)})}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase">Role</p>
                                        <p className="font-medium text-slate-800">{employee.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase">Basic Salary</p>
                                        <p className="font-medium text-slate-800">{formatMoney(employee.basicSalary || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase">Sales Target</p>
                                        <p className="font-medium text-slate-800">{employee.salesTarget ? formatMoney(employee.salesTarget) : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase">Commission</p>
                                        <p className="font-medium text-slate-800">{employee.commissionRate ? `${employee.commissionRate}%` : 'N/A'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const AttendanceTab = () => {
        const stats = useMemo(() => {
            const total = filteredStaff.length;
            const present = filteredStaff.filter(s => s.attendance?.[selectedDate]?.status === 'Present').length;
            const absent = filteredStaff.filter(s => s.attendance?.[selectedDate]?.status === 'Absent').length;
            const leave = filteredStaff.filter(s => s.attendance?.[selectedDate]?.status === 'Leave').length;
            return { total, present, absent, leave };
        }, [filteredStaff, selectedDate]);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                        <p className="text-slate-500 text-xs uppercase font-bold">Total Staff</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                        <p className="text-emerald-600 text-xs uppercase font-bold">Present</p>
                        <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                        <p className="text-red-600 text-xs uppercase font-bold">Absent</p>
                        <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                        <p className="text-orange-600 text-xs uppercase font-bold">On Leave</p>
                        <p className="text-2xl font-bold text-orange-700">{stats.leave}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Daily Attendance</h3>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Clock In</th>
                                <th className="px-6 py-4 text-center">Clock Out</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStaff.map(employee => {
                                const record = employee.attendance?.[selectedDate];
                                return (
                                    <tr key={employee.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{employee.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                record?.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                                record?.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                record?.status === 'Leave' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {record?.status || 'Not Marked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600">{record?.checkIn || '-'}</td>
                                        <td className="px-6 py-4 text-center text-slate-600">{record?.checkOut || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => markAttendance(employee.id, selectedDate, 'Present')}
                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 border border-emerald-200"
                                                    title="Mark Present"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => markAttendance(employee.id, selectedDate, 'Absent')}
                                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200"
                                                    title="Mark Absent"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const PayrollTab = () => {
        // State to hold temporary adjustments before processing
        const [adjustments, setAdjustments] = useState<Record<string, { bonus: number, fine: number }>>({});

        const getAdjustment = (id: string) => adjustments[id] || { bonus: 0, fine: 0 };

        const updateAdjustment = (id: string, field: 'bonus' | 'fine', value: number) => {
            setAdjustments(prev => ({
                ...prev,
                [id]: { ...getAdjustment(id), [field]: value }
            }));
        };

        // --- AUTO-DETECTION LOGIC ---
        const getPayrollDetails = (employee: Staff) => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const currentMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM

            // 1. Detect Advances (Transactions: Expense, Name matches, 'Advance' in ref)
            const advances = transactions
                .filter(t => {
                    if (!t.date) return false;
                    const tDate = new Date(t.date);
                    if (isNaN(tDate.getTime())) return false;
                    
                    return t.type === 'Expense' && 
                        t.entityName === employee.name && 
                        tDate.getMonth() === currentMonth &&
                        tDate.getFullYear() === currentYear &&
                        (t.reference?.toLowerCase().includes('advance') || false);
                })
                .reduce((sum, t) => sum + t.amount, 0);

            // 2. Detect Absence (Count 'Absent' days in current month)
            let absentDays = 0;
            if (employee.attendance) {
                Object.entries(employee.attendance).forEach(([date, record]) => {
                    if (date.startsWith(currentMonthPrefix) && record.status === 'Absent') {
                        absentDays++;
                    }
                });
            }
            
            // Calculate Absence Deduction (Basic Salary / 30 * Absent Days)
            const dailyRate = (employee.basicSalary || 0) / 30;
            const absentDeduction = Math.round(dailyRate * absentDays);

            // 3. Calculate Commission
            let totalSales = 0;
            transactions.forEach(t => {
                if (t.type === 'Sale' && t.date?.startsWith(currentMonthPrefix)) {
                    if (t.salesperson === employee.name || t.createdBy === employee.name) {
                        totalSales += t.amount;
                    }
                }
            });
            
            let commission = 0;
            if (employee.commissionRate && employee.commissionRate > 0) {
                commission = (totalSales * employee.commissionRate) / 100;
            }

            return { advances, absentDays, absentDeduction, totalSales, commission };
        };

        const processPayroll = (employee: Staff) => {
            const adj = getAdjustment(employee.id);
            const { advances, absentDeduction, absentDays, commission } = getPayrollDetails(employee);
            
            // Net Salary = Basic + Bonus + Commission - (Advance + Absent Deduction + Manual Fine)
            const netSalary = (employee.basicSalary || 0) + adj.bonus + commission - (advances + absentDeduction + adj.fine);

            if (netSalary <= 0) {
                alert("Net salary cannot be zero or negative.");
                return;
            }

            const deductionDetails = [];
            if (advances > 0) deductionDetails.push(`Adv: ${advances}`);
            if (absentDeduction > 0) deductionDetails.push(`Absent(${absentDays}): ${absentDeduction}`);
            if (adj.fine > 0) deductionDetails.push(`Fine: ${adj.fine}`);
            if (commission > 0) deductionDetails.push(`Comm: ${commission}`);
            
            const refText = deductionDetails.length > 0 
                ? `Salary (Less: ${deductionDetails.join(', ')})`
                : 'Salary Payment';

            const tx: LedgerEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                entityName: employee.name,
                type: 'Expense', // Salary is an expense
                amount: netSalary,
                paymentMethod: 'Cash',
                reference: refText,
                details: { subtotal: netSalary, tax: 0, discount: 0, delivery: 0 }
            };

            addTransaction(tx);
            alert(`Payroll processed for ${employee.name}. Paid: ${formatMoney(netSalary)}`);
            
            // Reset adjustments
            setAdjustments(prev => {
                const next = { ...prev };
                delete next[employee.id];
                return next;
            });
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-blue-800">Payroll Assistant</p>
                        <p className="text-xs text-blue-700">Advances, Absent days, and Commissions are auto-detected from expenses, attendance, and sales for the current month.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-4 min-w-[150px]">Employee</th>
                                    <th className="px-4 py-4 text-right">Basic</th>
                                    <th className="px-4 py-4 text-center bg-emerald-50/50">Commission</th>
                                    <th className="px-4 py-4 text-center bg-orange-50/50">Advances</th>
                                    <th className="px-4 py-4 text-center bg-red-50/50">Absent Cost</th>
                                    <th className="px-4 py-4 text-center w-24">Bonus (+)</th>
                                    <th className="px-4 py-4 text-center w-24">Fine (-)</th>
                                    <th className="px-4 py-4 text-right">Net Payable</th>
                                    <th className="px-4 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStaff.map(employee => {
                                    const adj = getAdjustment(employee.id);
                                    const { advances, absentDeduction, absentDays, commission } = getPayrollDetails(employee);
                                    const net = (employee.basicSalary || 0) + adj.bonus + commission - (advances + absentDeduction + adj.fine);
                                    
                                    return (
                                        <tr key={employee.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-4 font-bold text-slate-800">{employee.name}</td>
                                            <td className="px-4 py-4 text-right text-slate-600">{formatMoney(employee.basicSalary || 0)}</td>
                                            
                                            {/* Auto Detected Columns */}
                                            <td className="px-4 py-4 text-center bg-emerald-50/30">
                                                {commission > 0 ? (
                                                    <span className="text-emerald-600 font-medium">{formatMoney(commission)}</span>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                            <td className="px-4 py-4 text-center bg-orange-50/30">
                                                {advances > 0 ? (
                                                    <span className="text-orange-600 font-medium">{formatMoney(advances)}</span>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                            <td className="px-4 py-4 text-center bg-red-50/30">
                                                {absentDeduction > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-red-600 font-medium">{formatMoney(absentDeduction)}</span>
                                                        <span className="text-[9px] text-red-400">({absentDays} days)</span>
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>

                                            {/* Manual Inputs */}
                                            <td className="px-4 py-4">
                                                <input 
                                                    type="number" 
                                                    className="w-full border rounded p-1 text-center focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
                                                    value={adj.bonus || ''}
                                                    placeholder="0"
                                                    onChange={e => updateAdjustment(employee.id, 'bonus', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input 
                                                    type="number" 
                                                    className="w-full border rounded p-1 text-center focus:ring-1 focus:ring-red-500 outline-none text-red-600 text-xs"
                                                    value={adj.fine || ''}
                                                    placeholder="0"
                                                    onChange={e => updateAdjustment(employee.id, 'fine', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>

                                            <td className="px-4 py-4 text-right font-bold text-indigo-700 text-base">{formatMoney(net)}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button 
                                                    onClick={() => processPayroll(employee)}
                                                    className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    Pay
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const PerformanceTab = () => {
        const [ratingModal, setRatingModal] = useState<{show: boolean, id: string | null}>({ show: false, id: null });
        const [historyModal, setHistoryModal] = useState<{show: boolean, staff: Staff | null}>({ show: false, staff: null });
        const [newRating, setNewRating] = useState(5);
        const [reviewText, setReviewText] = useState('');

        const handleAddReview = () => {
            if (ratingModal.id && reviewText) {
                updatePerformance(ratingModal.id, newRating, reviewText);
                setRatingModal({ show: false, id: null });
                setReviewText('');
                setNewRating(5);
            }
        };

        const getSalesProgress = (employee: Staff) => {
            const currentMonthPrefix = new Date().toISOString().slice(0, 7);
            const totalSales = transactions
                .filter(t => t.type === 'Sale' && t.date?.startsWith(currentMonthPrefix) && (t.salesperson === employee.name))
                .reduce((sum, t) => sum + t.amount, 0);
            
            const target = employee.salesTarget || 0;
            const percentage = target > 0 ? Math.min(100, (totalSales / target) * 100) : 0;
            
            return { totalSales, target, percentage };
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStaff.map(employee => {
                        const progress = getSalesProgress(employee);
                        return (
                            <div key={employee.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xl">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{employee.name}</h3>
                                            <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-bold text-slate-700">{employee.performance?.rating || 'N/A'}</span>
                                                <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setRatingModal({ show: true, id: employee.id })}
                                        className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                                    >
                                        + Add Review
                                    </button>
                                </div>

                                {/* Sales Target Progress */}
                                <div className="p-4 border-b border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Target Progress</span>
                                        <span className="text-xs font-bold text-indigo-600">{progress.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-600 transition-all duration-500" 
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                        <span>{formatMoney(progress.totalSales)} achieved</span>
                                        <span>Target: {formatMoney(progress.target)}</span>
                                    </div>
                                </div>
                                
                                {/* Geo Tracking */}
                                <div className="bg-slate-50 p-4 border-b border-slate-100">
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                        <span className="font-bold uppercase flex items-center gap-1"><MapPin className="w-3 h-3"/> Last Known Location</span>
                                        <button 
                                            onClick={() => setHistoryModal({ show: true, staff: employee })}
                                            className="text-indigo-600 hover:underline font-bold"
                                        >
                                            View History
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700 bg-white p-2 rounded border border-slate-200">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        {employee.lastLocation?.address || 'Location data unavailable'}
                                        <span className="text-[10px] text-slate-400 ml-auto">{employee.lastLocation?.timestamp}</span>
                                    </div>
                                </div>

                                <div className="p-4 max-h-40 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Reviews</p>
                                    {employee.performance?.reviews && employee.performance.reviews.length > 0 ? (
                                        <div className="space-y-3">
                                            {employee.performance.reviews.map((rev, idx) => (
                                                <div key={idx} className="text-sm border-l-2 border-indigo-200 pl-3">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-medium text-slate-700">{rev.rating} ★</span>
                                                        <span className="text-xs text-slate-400">{rev.date}</span>
                                                    </div>
                                                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No reviews added yet.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rating Modal */}
                {ratingModal.show && (
                    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
                            <h3 className="font-bold text-slate-800 mb-4">Add Performance Review</h3>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                        <Star className={`w-8 h-8 ${star <= newRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                    </button>
                                ))}
                            </div>

                            <textarea 
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none mb-4"
                                placeholder="Write your evaluation comments..."
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                            />

                            <div className="flex gap-2">
                                <button onClick={() => setRatingModal({ show: false, id: null })} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                                <button onClick={handleAddReview} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Submit</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location History Modal */}
                {historyModal.show && historyModal.staff && (
                    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200 flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800">Location History: {historyModal.staff.name}</h3>
                                <button onClick={() => setHistoryModal({ show: false, staff: null })} className="text-slate-400 hover:text-slate-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {historyModal.staff.locationHistory && historyModal.staff.locationHistory.length > 0 ? (
                                    historyModal.staff.locationHistory.map((loc, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-800 font-medium break-words">{loc.address}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{loc.timestamp}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 italic">
                                        No location history available for this employee.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Employee Management')}</h1>
                    <p className="text-slate-500 text-sm">HR, Payroll, and Performance Tracking</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                <button onClick={() => setActiveTab('staff')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'staff' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <UserCheck className="w-4 h-4" /> Staff List
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'attendance' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <Clock className="w-4 h-4" /> Attendance
                </button>
                <button onClick={() => setActiveTab('payroll')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payroll' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <DollarSign className="w-4 h-4" /> Payroll
                </button>
                <button onClick={() => setActiveTab('performance')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'performance' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <TrendingUp className="w-4 h-4" /> Performance
                </button>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'staff' && <StaffListTab />}
                {activeTab === 'attendance' && <AttendanceTab />}
                {activeTab === 'payroll' && <PayrollTab />}
                {activeTab === 'performance' && <PerformanceTab />}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Add New Employee</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const newStaff: Staff = {
                                id: Date.now().toString(),
                                name: formData.get('name') as string,
                                role: formData.get('role') as string,
                                status: 'Active',
                                pin: formData.get('pin') as string,
                                permissions: [],
                                basicSalary: parseFloat(formData.get('salary') as string) || 0,
                                joiningDate: formData.get('joiningDate') as string || new Date().toISOString().split('T')[0],
                                salesTarget: parseFloat(formData.get('target') as string) || 0,
                                commissionRate: parseFloat(formData.get('commission') as string) || 0,
                                attendance: {},
                                performance: { rating: 5, reviews: [] }
                            };
                            addStaff(newStaff);
                            setShowAddModal(false);
                        }} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <input name="name" required type="text" className="w-full p-2.5 border rounded-lg text-sm" placeholder="e.g. John Doe" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                    <select name="role" className="w-full p-2.5 border rounded-lg text-sm">
                                        <option value="Manager">Manager</option>
                                        <option value="Salesperson">Salesperson</option>
                                        <option value="Stock Manager">Stock Manager</option>
                                        <option value="Cashier">Cashier</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Login PIN</label>
                                    <input name="pin" required type="password" maxLength={4} className="w-full p-2.5 border rounded-lg text-sm" placeholder="4 digits" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Basic Salary</label>
                                    <input name="salary" type="number" className="w-full p-2.5 border rounded-lg text-sm" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Joining Date</label>
                                    <input name="joiningDate" type="date" className="w-full p-2.5 border rounded-lg text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Sales Target</label>
                                    <input name="target" type="number" className="w-full p-2.5 border rounded-lg text-sm" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Commission (%)</label>
                                    <input name="commission" type="number" className="w-full p-2.5 border rounded-lg text-sm" placeholder="0" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all mt-2">
                                Create Employee Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;