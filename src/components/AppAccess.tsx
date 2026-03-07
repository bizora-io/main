import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';
import { Staff } from '../types';
import { Users, Shield, Clock, Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Save, Lock, LayoutGrid, CheckSquare, Square, History, FileText, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';
import { PERMISSIONS, getAllPermissions } from '../utils/permissions';

const AppAccess: React.FC = () => {
    const { t } = useSettings();
    const { staff, appLogs, addStaff, updateStaff, deleteStaff } = useData();
    
    const [activeTab, setActiveTab] = useState<'staff' | 'logs'>('staff');
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: '',
        role: 'Salesperson',
        pin: '',
        status: 'Active',
        permissions: []
    });

    // Expanded state for permission groups in modal
    const [expandedModules, setExpandedModules] = useState<string[]>(Object.keys(PERMISSIONS));

    const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredLogs = appLogs.filter(l => 
        l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (staffMember?: Staff) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({ ...staffMember });
        } else {
            setEditingStaff(null);
            setFormData({
                name: '',
                role: 'Salesperson',
                pin: '',
                status: 'Active',
                permissions: []
            });
        }
        setShowStaffModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.pin) {
            alert("Name and PIN are required.");
            return;
        }

        if (editingStaff) {
            updateStaff(editingStaff.id, formData);
        } else {
            addStaff({
                id: Date.now().toString(),
                ...formData as Staff,
                lastLogin: 'Never'
            });
        }
        setShowStaffModal(false);
    };

    const togglePermission = (key: string) => {
        setFormData(prev => {
            const current = prev.permissions || [];
            if (current.includes('all')) return prev; // Cannot toggle individual if 'all' is set
            
            if (current.includes(key)) {
                return { ...prev, permissions: current.filter(p => p !== key) };
            } else {
                return { ...prev, permissions: [...current, key] };
            }
        });
    };

    const toggleModulePermissions = (moduleKey: string) => {
        const module = PERMISSIONS[moduleKey as keyof typeof PERMISSIONS];
        const modulePermissions = Object.values(module.subFeatures).map(sf => sf.key);
        
        setFormData(prev => {
            const current = prev.permissions || [];
            if (current.includes('all')) return prev;

            const allModulePermissionsSelected = modulePermissions.every(p => current.includes(p));

            if (allModulePermissionsSelected) {
                // Deselect all
                return { ...prev, permissions: current.filter(p => !modulePermissions.includes(p)) };
            } else {
                // Select all (add missing ones)
                const newPermissions = [...current];
                modulePermissions.forEach(p => {
                    if (!newPermissions.includes(p)) newPermissions.push(p);
                });
                return { ...prev, permissions: newPermissions };
            }
        });
    };

    const toggleAllPermissions = () => {
        setFormData(prev => {
            const current = prev.permissions || [];
            if (current.includes('all')) {
                return { ...prev, permissions: [] };
            } else {
                return { ...prev, permissions: ['all'] };
            }
        });
    };

    const toggleModuleExpand = (moduleKey: string) => {
        setExpandedModules(prev => 
            prev.includes(moduleKey) 
                ? prev.filter(k => k !== moduleKey) 
                : [...prev, moduleKey]
        );
    };

    const isModuleFullySelected = (moduleKey: string) => {
        const module = PERMISSIONS[moduleKey as keyof typeof PERMISSIONS];
        const modulePermissions = Object.values(module.subFeatures).map(sf => sf.key);
        const current = formData.permissions || [];
        return modulePermissions.every(p => current.includes(p));
    };

    const isModulePartiallySelected = (moduleKey: string) => {
        const module = PERMISSIONS[moduleKey as keyof typeof PERMISSIONS];
        const modulePermissions = Object.values(module.subFeatures).map(sf => sf.key);
        const current = formData.permissions || [];
        const selectedCount = modulePermissions.filter(p => current.includes(p)).length;
        return selectedCount > 0 && selectedCount < modulePermissions.length;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-900 text-white rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{t('App Access')}</h1>
                        <p className="text-slate-500 text-sm">Manage staff roles, permissions, and audit logs</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('staff')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'staff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Users className="w-4 h-4" /> Staff & Permissions
                </button>
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <History className="w-4 h-4" /> App Log History
                </button>
            </div>

            {/* --- STAFF TAB --- */}
            {activeTab === 'staff' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search staff..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button 
                            onClick={() => openModal()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Staff
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map(s => (
                            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${s.role === 'Manager' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                            {s.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{s.name}</h3>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{s.role}</span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {s.status}
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>PIN Code:</span>
                                        <span className="font-mono bg-slate-100 px-2 rounded">****</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Last Login:</span>
                                        <span className="text-slate-800">{s.lastLogin}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Access Level:</span>
                                        <span className="text-indigo-600 font-medium">
                                            {s.permissions.includes('all') ? 'Full Admin' : `${s.permissions.length} Features`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => openModal(s)}
                                        className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit Access
                                    </button>
                                    <button 
                                        onClick={() => deleteStaff(s.id)}
                                        className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- LOGS TAB --- */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" /> Recent Activity
                        </h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Filter logs..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-3 pr-4 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Staff Member</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No activity recorded.</td></tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-slate-500 whitespace-nowrap text-xs">{log.timestamp}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{log.staffName}</td>
                                            <td className="px-6 py-3">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-800">{log.action}</td>
                                            <td className="px-6 py-3 text-slate-500 italic truncate max-w-xs" title={log.details}>{log.details}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Staff Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {editingStaff ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                                {editingStaff ? 'Edit Staff & Permissions' : 'Add New Staff'}
                            </h3>
                            <button onClick={() => setShowStaffModal(false)}><XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Profile Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Sales Manager"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Login PIN</label>
                                    <input 
                                        type="text" 
                                        value={formData.pin}
                                        onChange={e => setFormData({...formData, pin: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono tracking-widest"
                                        placeholder="****"
                                        maxLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permission Matrix */}
                            <div>
                                <div className="flex justify-between items-center mb-4 border-t border-slate-100 pt-6">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-500" /> App Permissions
                                    </h4>
                                    <button 
                                        onClick={toggleAllPermissions}
                                        className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${formData.permissions?.includes('all') ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {formData.permissions?.includes('all') ? 'Full Access Granted' : 'Grant Full Admin Access'}
                                    </button>
                                </div>

                                {!formData.permissions?.includes('all') && (
                                    <div className="space-y-4">
                                        {Object.entries(PERMISSIONS)
                                    .filter(([key]) => key !== 'SAAS')
                                    .map(([key, module]) => {
                                        const isExpanded = expandedModules.includes(key);
                                            const isFullySelected = isModuleFullySelected(key);
                                            const isPartiallySelected = isModulePartiallySelected(key);

                                            return (
                                                <div key={key} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                                                    <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                                                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleModuleExpand(key)}>
                                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                            <div>
                                                                <h5 className="font-bold text-slate-700">{module.label}</h5>
                                                                <p className="text-xs text-slate-500">{module.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                {isFullySelected ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                            <button 
                                                                onClick={() => toggleModulePermissions(key)}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isFullySelected ? 'bg-indigo-600' : isPartiallySelected ? 'bg-indigo-300' : 'bg-slate-200'}`}
                                                            >
                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFullySelected || isPartiallySelected ? 'translate-x-6' : 'translate-x-1'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {isExpanded && (
                                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white animate-in slide-in-from-top-2">
                                                            {Object.values(module.subFeatures).map(act => (
                                                                <div key={act.key} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                                                    <span className="text-sm text-slate-600">{act.label}</span>
                                                                    <button 
                                                                        onClick={() => togglePermission(act.key)}
                                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${formData.permissions?.includes(act.key) ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                                                    >
                                                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.permissions?.includes(act.key) ? 'translate-x-5' : 'translate-x-1'}`} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {formData.permissions?.includes('all') && (
                                    <div className="p-8 text-center bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                                        <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="font-medium">This user has unrestricted access to all features.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowStaffModal(false)}
                                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppAccess;