import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useData, RawMaterial, BillOfMaterial, ProductionBatch } from '../contexts/DataContext';
import { Factory, Hammer, Clipboard, Layers, Plus, Trash2, Edit2, Play, CheckCircle, AlertTriangle, Search, Box, ArrowRight, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';

const Production: React.FC = () => {
    const { t, formatMoney } = useSettings();
    const { 
        products, rawMaterials, boms, productionBatches, 
        addRawMaterial, updateRawMaterial, restockMaterial, 
        addBOM, deleteBOM, addBatch, updateBatchStatus, completeProductionBatch 
    } = useData();

    const [activeTab, setActiveTab] = useState<'materials' | 'recipes' | 'batches'>('materials');
    
    // -- Modals State --
    const [showMatModal, setShowMatModal] = useState(false);
    const [showBomModal, setShowBomModal] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState<{show: boolean, id: string | null}>({show: false, id: null});

    // -- Forms State --
    const [matForm, setMatForm] = useState<Partial<RawMaterial>>({ name: '', unit: 'kg', cost: 0, stock: 0, minLevel: 10 });
    const [editingMatId, setEditingMatId] = useState<string | null>(null);

    const [restockQty, setRestockQty] = useState(0);
    const [restockCost, setRestockCost] = useState(0);

    const [bomForm, setBomForm] = useState<{productId: string, materials: {id: string, qty: number}[]}>({ productId: '', materials: [] });
    
    const [batchForm, setBatchForm] = useState<{bomId: string, qty: number}>({ bomId: '', qty: 1 });

    // -- Collapsible State --
    const [expandedBoms, setExpandedBoms] = useState<string[]>([]);

    // -- Derived Data --
    const lowStockMaterials = useMemo(() => rawMaterials.filter(m => m.stock <= m.minLevel), [rawMaterials]);

    const toggleBom = (id: string) => {
        setExpandedBoms(prev => 
            prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
        );
    };

    // -- Handlers --

    // Materials
    const openAddMatModal = () => {
        setEditingMatId(null);
        setMatForm({ name: '', unit: 'kg', cost: 0, stock: 0, minLevel: 10 });
        setShowMatModal(true);
    };

    const openEditMatModal = (mat: RawMaterial) => {
        setEditingMatId(mat.id);
        setMatForm({ ...mat });
        setShowMatModal(true);
    };

    const handleSaveMaterial = () => {
        if (!matForm.name) return;
        
        if (editingMatId) {
            updateRawMaterial(editingMatId, matForm);
        } else {
            addRawMaterial({
                id: Date.now().toString(),
                ...matForm as RawMaterial
            });
        }
        
        setShowMatModal(false);
        setEditingMatId(null);
        setMatForm({ name: '', unit: 'kg', cost: 0, stock: 0, minLevel: 10 });
    };

    const handleRestock = () => {
        if (showRestockModal.id && restockQty > 0) {
            restockMaterial(showRestockModal.id, restockQty, restockCost);
            setShowRestockModal({show: false, id: null});
            setRestockQty(0);
            setRestockCost(0);
        }
    };

    // BOMs
    const handleAddBomMaterial = () => {
        setBomForm(prev => ({ ...prev, materials: [...prev.materials, { id: '', qty: 1 }] }));
    };

    const handleUpdateBomMaterial = (index: number, field: 'id' | 'qty', value: any) => {
        const newMats = [...bomForm.materials];
        newMats[index] = { ...newMats[index], [field]: value };
        setBomForm(prev => ({ ...prev, materials: newMats }));
    };

    const handleSaveBom = () => {
        const prod = products.find(p => p.id === bomForm.productId);
        if (!prod || bomForm.materials.length === 0) return;

        const mappedMats = bomForm.materials.map(m => {
            const mat = rawMaterials.find(rm => rm.id === m.id);
            return { materialId: m.id, name: mat?.name || 'Unknown', qty: m.qty };
        });

        addBOM({
            id: Date.now().toString(),
            productId: prod.id,
            productName: prod.name,
            yield: 1,
            materials: mappedMats
        });
        setShowBomModal(false);
        setBomForm({ productId: '', materials: [] });
    };

    // Batches
    const handleCreateBatch = () => {
        const bom = boms.find(b => b.id === batchForm.bomId);
        if (!bom || batchForm.qty <= 0) return;

        // Check stock
        const insufficient = bom.materials.some(req => {
            const mat = rawMaterials.find(m => m.id === req.materialId);
            return (mat?.stock || 0) < (req.qty * batchForm.qty);
        });

        if (insufficient) {
            alert("Insufficient raw materials for this batch quantity.");
            return;
        }

        addBatch({
            id: Date.now().toString(),
            bomId: bom.id,
            productName: bom.productName,
            productId: bom.productId,
            quantity: batchForm.qty,
            status: 'Planned',
            startDate: new Date().toLocaleDateString()
        });
        setShowBatchModal(false);
        setBatchForm({ bomId: '', qty: 1 });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
                    <Factory className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('Production Module')}</h1>
                    <p className="text-slate-500 text-sm">Manufacturing, BOMs, and Raw Material Procurement</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex border-b border-slate-200">
                <button onClick={() => setActiveTab('materials')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'materials' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'}`}>
                    <Layers className="w-4 h-4" /> Raw Materials
                </button>
                <button onClick={() => setActiveTab('recipes')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'recipes' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'}`}>
                    <Clipboard className="w-4 h-4" /> Recipes (BOM)
                </button>
                <button onClick={() => setActiveTab('batches')} className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'batches' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'}`}>
                    <Hammer className="w-4 h-4" /> Production Batches
                </button>
            </div>

            {/* --- MATERIALS TAB --- */}
            {activeTab === 'materials' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    
                    {lowStockMaterials.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <span className="font-bold">Low Stock Alert:</span> {lowStockMaterials.length} materials are below minimum level.
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Inventory Status</h3>
                        <button onClick={openAddMatModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800">
                            <Plus className="w-4 h-4" /> Add Material
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Material Name</th>
                                    <th className="px-6 py-4 text-center">Stock Level</th>
                                    <th className="px-6 py-4 text-right">Unit Cost</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rawMaterials.map(mat => (
                                    <tr key={mat.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800 block">{mat.name}</span>
                                            <span className="text-xs text-slate-400">Min: {mat.minLevel} {mat.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${mat.stock <= mat.minLevel ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {mat.stock} {mat.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-600">
                                            {formatMoney(mat.cost)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditMatModal(mat)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Edit Material"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setShowRestockModal({show: true, id: mat.id})}
                                                    className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 border border-indigo-200"
                                                >
                                                    Restock
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rawMaterials.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No raw materials defined.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- RECIPES TAB --- */}
            {activeTab === 'recipes' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Bill of Materials</h3>
                        <button onClick={() => setShowBomModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800">
                            <Plus className="w-4 h-4" /> Create Recipe
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boms.map(bom => {
                            const isExpanded = expandedBoms.includes(bom.id);
                            return (
                                <div key={bom.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{bom.productName}</h4>
                                                <p className="text-xs text-slate-500">Yield: {bom.yield} Unit</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleBom(bom.id)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50 transition-colors">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => deleteBOM(bom.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isExpanded ? (
                                        <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Requires:</p>
                                            {bom.materials.map((m, i) => (
                                                <div key={i} className="flex justify-between text-sm text-slate-700 border-b border-slate-200 last:border-0 pb-1 last:pb-0">
                                                    <span>{m.name}</span>
                                                    <span className="font-bold bg-white px-2 py-0.5 rounded text-xs border border-slate-200 shadow-sm">{m.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div 
                                            className="text-xs text-slate-500 mt-2 pl-1 cursor-pointer hover:text-slate-700 flex items-center gap-1" 
                                            onClick={() => toggleBom(bom.id)}
                                        >
                                            <Layers className="w-3 h-3" />
                                            {bom.materials.length} raw materials required
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- BATCHES TAB --- */}
            {activeTab === 'batches' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Active Batches</h3>
                        <button onClick={() => setShowBatchModal(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-amber-700 shadow-sm">
                            <Play className="w-4 h-4" /> New Production Run
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {productionBatches.map(batch => (
                            <div key={batch.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                        batch.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                        batch.status === 'In Progress' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {batch.quantity}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{batch.productName}</h4>
                                        <p className="text-xs text-slate-500">Started: {batch.startDate} • ID: {batch.id.slice(-4)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex-1 md:flex-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-2 h-2 rounded-full ${
                                                batch.status === 'Completed' ? 'bg-emerald-500' :
                                                batch.status === 'In Progress' ? 'bg-blue-500' :
                                                'bg-slate-400'
                                            }`}></span>
                                            <span className="text-sm font-bold text-slate-700">{batch.status}</span>
                                        </div>
                                    </div>

                                    {batch.status === 'Planned' && (
                                        <button onClick={() => updateBatchStatus(batch.id, 'In Progress')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                                            Start
                                        </button>
                                    )}
                                    {batch.status === 'In Progress' && (
                                        <button onClick={() => completeProductionBatch(batch.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}

            {/* Add/Edit Material Modal */}
            {showMatModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{editingMatId ? 'Edit Raw Material' : 'Add Raw Material'}</h3>
                            <button onClick={() => setShowMatModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                                <input className="w-full border p-2 rounded" placeholder="Material Name" value={matForm.name} onChange={e => setMatForm({...matForm, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit</label>
                                    <input className="w-full border p-2 rounded" placeholder="Unit (e.g. kg)" value={matForm.unit} onChange={e => setMatForm({...matForm, unit: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Cost / Unit</label>
                                    <input type="number" className="w-full border p-2 rounded" placeholder="Cost" value={matForm.cost || ''} onChange={e => setMatForm({...matForm, cost: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                            
                            {!editingMatId && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Initial Stock</label>
                                    <input type="number" className="w-full border p-2 rounded" placeholder="Initial Stock" value={matForm.stock || ''} onChange={e => setMatForm({...matForm, stock: parseFloat(e.target.value)})} />
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Min Level (Alert Trigger)</label>
                                <input type="number" className="w-full border p-2 rounded" placeholder="Alert Level" value={matForm.minLevel || ''} onChange={e => setMatForm({...matForm, minLevel: parseFloat(e.target.value)})} />
                            </div>
                            <button onClick={handleSaveMaterial} className="w-full bg-slate-900 text-white py-2 rounded font-bold mt-2">{editingMatId ? 'Save Changes' : 'Save Material'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {showRestockModal.show && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Restock Material</h3>
                            <button onClick={() => setShowRestockModal({show: false, id: null})}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500">Quantity to Add</label>
                                <input type="number" className="w-full border p-2 rounded" value={restockQty} onChange={e => setRestockQty(parseFloat(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">Total Cost</label>
                                <input type="number" className="w-full border p-2 rounded" value={restockCost} onChange={e => setRestockCost(parseFloat(e.target.value))} />
                            </div>
                            <button onClick={handleRestock} className="w-full bg-emerald-600 text-white py-2 rounded font-bold mt-2">Confirm Purchase</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create BOM Modal */}
            {showBomModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Create Recipe (BOM)</h3>
                            <button onClick={() => setShowBomModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Select Finished Product</label>
                                <select 
                                    className="w-full border p-2 rounded bg-white"
                                    value={bomForm.productId}
                                    onChange={e => setBomForm({...bomForm, productId: e.target.value})}
                                >
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Required Materials</label>
                                {bomForm.materials.map((m, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <select 
                                            className="flex-1 border p-1 rounded bg-white text-sm"
                                            value={m.id}
                                            onChange={e => handleUpdateBomMaterial(i, 'id', e.target.value)}
                                        >
                                            <option value="">Select Material...</option>
                                            {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>)}
                                        </select>
                                        <input 
                                            type="number" 
                                            className="w-20 border p-1 rounded text-sm"
                                            placeholder="Qty"
                                            value={m.qty}
                                            onChange={e => handleUpdateBomMaterial(i, 'qty', parseFloat(e.target.value))}
                                        />
                                    </div>
                                ))}
                                <button onClick={handleAddBomMaterial} className="text-xs text-indigo-600 font-bold hover:underline">+ Add Material Line</button>
                            </div>

                            <button onClick={handleSaveBom} className="w-full bg-slate-900 text-white py-2 rounded font-bold mt-2">Save Recipe</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Batch Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Start Production</h3>
                            <button onClick={() => setShowBatchModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Select Recipe</label>
                                <select 
                                    className="w-full border p-2 rounded bg-white"
                                    value={batchForm.bomId}
                                    onChange={e => setBatchForm({...batchForm, bomId: e.target.value})}
                                >
                                    <option value="">Select Recipe...</option>
                                    {boms.map(b => <option key={b.id} value={b.id}>{b.productName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Quantity to Produce</label>
                                <input 
                                    type="number" 
                                    className="w-full border p-2 rounded"
                                    value={batchForm.qty}
                                    onChange={e => setBatchForm({...batchForm, qty: parseFloat(e.target.value)})}
                                />
                            </div>
                            <button onClick={handleCreateBatch} className="w-full bg-amber-600 text-white py-2 rounded font-bold mt-2 hover:bg-amber-700">Check Materials & Start</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Production;