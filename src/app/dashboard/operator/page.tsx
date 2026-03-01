'use client';

import { useEffect, useState } from 'react';
import { Package, Factory, Wrench, ClipboardList, Users, ArrowRight, MessageSquare, RefreshCw } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, EmptyState, Button, Modal, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';

const STAGE_ORDER = ['accepted', 'mining', 'crushing', 'powdering', 'packing', 'completed'];
const STAGE_LABELS: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    mining: 'Mining',
    crushing: 'Crushing',
    powdering: 'Powdering',
    packing: 'Packing',
    completed: 'Completed',
    rejected: 'Rejected',
};

function StageProgress({ currentStage }: { currentStage: string }) {
    if (currentStage === 'rejected') {
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-danger-light text-danger">Rejected</span>;
    }
    if (currentStage === 'pending') {
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-warning-light" style={{ color: '#D97706' }}>Awaiting Approval</span>;
    }
    const stages = STAGE_ORDER;
    const currentIdx = stages.indexOf(currentStage);
    return (
        <div className="flex items-center gap-1 flex-wrap">
            {stages.map((stage, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                    <div key={stage} className="flex items-center gap-1">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${isCurrent ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110'
                                : isCompleted ? 'bg-success-light text-success'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                            {STAGE_LABELS[stage]}
                        </div>
                        {idx < stages.length - 1 && <ArrowRight className={`w-3 h-3 ${isCompleted ? 'text-success' : 'text-gray-300'}`} />}
                    </div>
                );
            })}
        </div>
    );
}

function StatusTimeline({ history }: { history: any[] }) {
    if (!history || history.length === 0) return null;
    return (
        <div className="mt-3 pl-3 border-l-2 border-primary/15 space-y-2">
            {history.map((entry: any, idx: number) => (
                <div key={idx} className="relative pl-4">
                    <div className="absolute -left-[9px] top-[6px] w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary uppercase">{STAGE_LABELS[entry.stage] || entry.stage}</span>
                        <span className="text-[10px] text-text-muted">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    {entry.comment && (
                        <div className="flex items-start gap-1.5 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-text-muted mt-0.5 shrink-0" />
                            <p className="text-xs text-text-secondary">{entry.comment}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function OperatorDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showProdModal, setShowProdModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [machineStatus, setMachineStatus] = useState('');
    const [prodForm, setProdForm] = useState({ rawInput: '', outputType: '', outputQuantity: '' });
    const [stockForm, setStockForm] = useState({ materialType: '', quantity: '' });
    const [statusForm, setStatusForm] = useState({ stage: '', comment: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setData(d);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogProduction = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/operator/log-production', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...prodForm, outputQuantity: Number(prodForm.outputQuantity) }),
            });
            if (res.ok) { toast.success('Production logged & stock updated!'); setShowProdModal(false); setProdForm({ rawInput: '', outputType: '', outputQuantity: '' }); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    const handleUpdateStock = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/operator/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: stockForm.materialType, quantity: Number(stockForm.quantity) }),
            });
            if (res.ok) { toast.success('Stock updated!'); setShowStockModal(false); setStockForm({ materialType: '', quantity: '' }); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    const handleMachineStatus = async (status: string) => {
        try {
            const res = await fetch('/api/operator/machine-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) { setMachineStatus(status); toast.success(`Machine status: ${status}`); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); }
    };

    const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/request/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: id, status }),
            });
            if (res.ok) { toast.success(`Order ${status}!`); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); }
    };

    const handleUpdateStatus = async () => {
        if (!statusForm.stage) { toast.error('Please select a stage'); return; }
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/request/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    stage: statusForm.stage,
                    comment: statusForm.comment,
                }),
            });
            if (res.ok) {
                toast.success(`Status updated to ${STAGE_LABELS[statusForm.stage]}!`);
                setShowStatusModal(false);
                setStatusForm({ stage: '', comment: '' });
                setSelectedRequest(null);
                fetchData();
            } else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    const openStatusModal = (request: any) => {
        setSelectedRequest(request);
        const currentIdx = STAGE_ORDER.indexOf(request.currentStage || 'accepted');
        const nextStage = currentIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIdx + 1] : 'completed';
        setStatusForm({ stage: nextStage, comment: '' });
        setShowStatusModal(true);
    };

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-4 gap-5">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32" />)}</div></div>;

    const totalStock = data?.stock?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0;
    const pendingRequests = data?.requests?.filter((r: any) => r.status === 'pending') || [];
    const activeRequests = data?.requests?.filter((r: any) => ['accepted', 'in-progress'].includes(r.status)) || [];
    const allRequests = data?.requests || [];
    const totalProduction = data?.productionLogs?.reduce((s: number, l: any) => s + (l.outputQuantity || 0), 0) || 0;

    // Available stages for status update modal
    const getAvailableStages = (request: any) => {
        const currentIdx = STAGE_ORDER.indexOf(request.currentStage || 'accepted');
        return STAGE_ORDER.slice(currentIdx + 1).map(s => ({ value: s, label: STAGE_LABELS[s] }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Operator Dashboard</h1>
                    <div className="flex flex-col mt-3 p-5 rounded-2xl bg-white border-2 border-primary/10 shadow-sm">
                        <span className="text-[10px] uppercase font-black text-primary/40 tracking-[0.2em] mb-1">Operator ID</span>
                        <p className="text-3xl font-mono text-primary font-black tracking-tighter">{data?.user?.operatorId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button icon={Factory} onClick={() => setShowProdModal(true)}>Log Production</Button>
                    <Button icon={Package} variant="secondary" onClick={() => setShowStockModal(true)}>Add Material</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
                <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="green" />
                <StatCard title="Production Output" value={totalProduction.toLocaleString()} icon={Factory} color="blue" subtitle={`${data?.productionLogs?.length || 0} entries`} />
                <StatCard title="Pending Orders" value={pendingRequests.length} icon={ClipboardList} color="yellow" />
                <StatCard title="Active Orders" value={activeRequests.length} icon={Wrench} color="purple" />
            </div>

            {/* Machine Status */}
            <DataCard title="Machine Status" subtitle="Update current machine operating status">
                <div className="flex flex-wrap gap-3">
                    {['Running', 'Stopped', 'Maintenance'].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleMachineStatus(s)}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border-2 ${machineStatus === s
                                ? s === 'Running' ? 'bg-success text-white border-success shadow-lg'
                                    : s === 'Stopped' ? 'bg-danger text-white border-danger shadow-lg'
                                        : 'bg-warning text-white border-warning shadow-lg'
                                : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                    {machineStatus && (
                        <div className="ml-4 flex items-center">
                            <StatusBadge status={machineStatus} />
                        </div>
                    )}
                </div>
            </DataCard>

            {/* Pending Orders (Need Approval) */}
            <DataCard title="Pending Orders" subtitle={`${pendingRequests.length} awaiting your approval`}>
                {pendingRequests.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="No Pending Orders" description="No orders waiting for approval." />
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {pendingRequests.map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border-light card-hover">
                                <div>
                                    <p className="font-semibold text-text-primary">{r.materialType}</p>
                                    <p className="text-sm text-text-secondary">Quantity: <span className="font-bold text-primary">{r.quantity}</span></p>
                                    <p className="text-xs text-text-muted">{new Date(r.date).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleApprove(r.id, 'approved')}>Accept</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleApprove(r.id, 'rejected')}>Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            {/* Active Orders (In Progress) */}
            <DataCard title="Active Orders" subtitle={`${activeRequests.length} orders in progress — update their status`}>
                {activeRequests.length === 0 ? (
                    <EmptyState icon={RefreshCw} title="No Active Orders" description="Accept pending orders to start processing them." />
                ) : (
                    <div className="space-y-4">
                        {activeRequests.map((r: any) => (
                            <div key={r.id} className="p-5 rounded-2xl bg-surface border border-border-light">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-text-primary">{r.materialType}</p>
                                        <p className="text-sm text-text-secondary">Quantity: <span className="font-bold text-primary">{r.quantity}</span></p>
                                        <p className="text-xs text-text-muted">{new Date(r.date).toLocaleString()}</p>
                                    </div>
                                    <Button size="sm" icon={RefreshCw} onClick={() => openStatusModal(r)}>Update Status</Button>
                                </div>
                                <StageProgress currentStage={r.currentStage || r.status} />
                                <StatusTimeline history={r.statusHistory} />
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            {/* Current Stock (Material Catalog) */}
            <DataCard title="Material Catalog" subtitle="Materials available for transport users to order">
                {(!data?.stock || data.stock.length === 0) ? (
                    <EmptyState icon={Package} title="No Materials" description="Add materials using 'Add Material' or log production to auto-create stock." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.stock.map((s: any) => (
                            <div key={s.id} className="p-5 rounded-2xl bg-surface border border-border-light">
                                <Package className="w-5 h-5 text-secondary mb-2" />
                                <p className="font-semibold">{s.materialType}</p>
                                <p className="text-2xl font-bold text-primary mt-1">{s.quantity?.toLocaleString()}</p>
                                <p className="text-xs text-text-muted mt-1">Available for orders</p>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            {/* Connected Transport Users */}
            <DataCard title="Connected Transport Users" subtitle={`${data?.connectedUsers?.length || 0} users linked to you`}>
                {(!data?.connectedUsers || data.connectedUsers.length === 0) ? (
                    <EmptyState icon={Users} title="No Connected Users" description="No transport users have connected to your Operator ID." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.connectedUsers.map((u: any) => (
                            <div key={u.id} className="p-4 rounded-xl bg-surface border border-border-light">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{u.name}</p>
                                        <p className="text-xs text-text-secondary">{u.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            {/* Production Modal */}
            <Modal open={showProdModal} onClose={() => setShowProdModal(false)} title="Log Production">
                <div className="space-y-4">
                    <Input label="Raw Material Input" name="rawInput" placeholder="e.g. Granite Blocks" value={prodForm.rawInput} onChange={(e) => setProdForm({ ...prodForm, rawInput: e.target.value })} required />
                    <Input label="Output Material Type" name="outputType" placeholder="e.g. Crushed Stone 20mm" value={prodForm.outputType} onChange={(e) => setProdForm({ ...prodForm, outputType: e.target.value })} required />
                    <Input label="Output Quantity" name="outputQuantity" type="number" placeholder="e.g. 500" value={prodForm.outputQuantity} onChange={(e) => setProdForm({ ...prodForm, outputQuantity: e.target.value })} required />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowProdModal(false)}>Cancel</Button>
                        <Button onClick={handleLogProduction} loading={submitLoading}>Log Production</Button>
                    </div>
                </div>
            </Modal>

            {/* Stock Modal */}
            <Modal open={showStockModal} onClose={() => setShowStockModal(false)} title="Add / Update Material">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Sand, Gravel, Crushed Stone" value={stockForm.materialType} onChange={(e) => setStockForm({ ...stockForm, materialType: e.target.value })} required />
                    <Input label="Quantity Available" name="quantity" type="number" placeholder="e.g. 1000" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required />
                    <p className="text-xs text-text-muted">💡 This material will appear in the dropdown when transport users place orders.</p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowStockModal(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStock} loading={submitLoading}>Save Material</Button>
                    </div>
                </div>
            </Modal>

            {/* Status Update Modal */}
            <Modal open={showStatusModal} onClose={() => { setShowStatusModal(false); setSelectedRequest(null); }} title="Update Order Status">
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-surface border border-border-light">
                            <p className="font-semibold">{selectedRequest.materialType}</p>
                            <p className="text-sm text-text-secondary">Qty: {selectedRequest.quantity}</p>
                            <p className="text-xs text-text-muted mt-1">Current: <span className="font-bold text-primary uppercase">{STAGE_LABELS[selectedRequest.currentStage] || selectedRequest.currentStage}</span></p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">
                                Move to Stage <span className="text-danger">*</span>
                            </label>
                            <select
                                value={statusForm.stage}
                                onChange={(e) => setStatusForm({ ...statusForm, stage: e.target.value })}
                                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="">— Select stage —</option>
                                {getAvailableStages(selectedRequest).map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Comment (optional)</label>
                            <textarea
                                placeholder="Add a note about this status update..."
                                value={statusForm.comment}
                                onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                                rows={3}
                                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => { setShowStatusModal(false); setSelectedRequest(null); }}>Cancel</Button>
                            <Button onClick={handleUpdateStatus} loading={submitLoading}>Update Status</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
