'use client';

import { useEffect, useState } from 'react';
import { Package, Wrench, ClipboardList, Users, ArrowRight, MessageSquare, RefreshCw, ImagePlus } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, EmptyState, Button, Modal, Input } from '@/components/ui';
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
        return <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-red-50 text-red-600 border border-red-200">✕ Rejected</span>;
    }
    if (currentStage === 'pending') {
        return <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-amber-50 text-amber-600 border border-amber-200">⏳ Awaiting Approval</span>;
    }
    const stages = STAGE_ORDER;
    const currentIdx = stages.indexOf(currentStage);
    return (
        <div className="py-4">
            <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500"
                    style={{
                        width: `${(currentIdx / (stages.length - 1)) * 100}%`,
                        background: 'linear-gradient(90deg, #10B981, #043873)',
                    }}
                />
                {stages.map((stage, idx) => {
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                        <div key={stage} className="relative flex flex-col items-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCurrent
                                    ? 'bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-primary/15'
                                    : isCompleted
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                                        : 'bg-white text-gray-400 border-2 border-gray-200'
                                }`}>
                                {isCompleted && !isCurrent ? '✓' : idx + 1}
                            </div>
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                                }`}>
                                {STAGE_LABELS[stage]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatusTimeline({ history }: { history: any[] }) {
    if (!history || history.length === 0) return null;
    return (
        <div className="mt-4 space-y-0">
            {history.map((entry: any, idx: number) => {
                const isLast = idx === history.length - 1;
                return (
                    <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${isLast ? 'bg-primary ring-4 ring-primary/10' : 'bg-emerald-400'}`} />
                            {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
                        </div>
                        <div className="pb-5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold uppercase tracking-wide ${isLast ? 'text-primary' : 'text-text-primary'}`}>
                                    {STAGE_LABELS[entry.stage] || entry.stage}
                                </span>
                                <span className="text-[10px] text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">{new Date(entry.timestamp).toLocaleString()}</span>
                            </div>
                            {entry.comment && (
                                <div className="mt-1.5 px-3 py-2 rounded-lg bg-surface border-l-2 border-primary/30 text-sm text-text-secondary">
                                    {entry.comment}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function OperatorDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [stockForm, setStockForm] = useState({ materialType: '', quantity: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [statusForm, setStatusForm] = useState({ stage: '', comment: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be under 2MB');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setData(d);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpdateStock = async () => {
        setSubmitLoading(true);
        try {
            const body: any = { materialType: stockForm.materialType, quantity: Number(stockForm.quantity) };
            if (imagePreview) {
                body.imageBase64 = imagePreview;
            }
            const res = await fetch('/api/operator/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) { toast.success('Stock updated!'); setShowStockModal(false); setStockForm({ materialType: '', quantity: '' }); setImageFile(null); setImagePreview(null); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
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
                    <p className="text-sm text-text-secondary mt-1">Manage orders and material stock</p>
                </div>
                <div className="flex gap-3">
                    <Button icon={Package} variant="primary" onClick={() => setShowStockModal(true)}>Add Material</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in">
                <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="green" />
                <StatCard title="Pending Orders" value={pendingRequests.length} icon={ClipboardList} color="yellow" />
                <StatCard title="Active Orders" value={activeRequests.length} icon={Wrench} color="purple" />
            </div>

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
                    <EmptyState icon={Package} title="No Materials" description="Add materials using 'Add Material' to start accepting orders." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.stock.map((s: any) => (
                            <div key={s.id} className="p-0 overflow-hidden rounded-2xl bg-surface border border-border-light group hover:border-primary/30 transition-all">
                                {s.imageBase64 ? (
                                    <div className="h-36 w-full overflow-hidden bg-gray-50 relative">
                                        <img src={s.imageBase64} alt={s.materialType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="h-36 w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                        <Package className="w-12 h-12 text-text-muted/40" />
                                    </div>
                                )}
                                <div className="p-5">
                                    <p className="font-bold text-text-primary text-lg">{s.materialType}</p>
                                    <div className="flex items-end justify-between mt-2">
                                        <div>
                                            <p className="text-2xl font-black text-primary">{s.quantity?.toLocaleString()}</p>
                                            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide">Available Units</p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">In Stock</div>
                                    </div>
                                </div>
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

            {/* Stock Modal */}
            <Modal open={showStockModal} onClose={() => { setShowStockModal(false); setImageFile(null); setImagePreview(null); }} title="Add / Update Material">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Sand, Gravel, Crushed Stone" value={stockForm.materialType} onChange={(e) => setStockForm({ ...stockForm, materialType: e.target.value })} required />
                    <Input label="Quantity Available" name="quantity" type="number" placeholder="e.g. 1000" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required />

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Material Photo</label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20 relative group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                                    >Remove</button>
                                </div>
                            ) : (
                                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50">
                                    <ImagePlus className="w-6 h-6 text-text-muted mb-1" />
                                    <span className="text-[10px] text-text-muted font-medium">Upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                            <p className="text-xs text-text-muted flex-1">Upload a photo of this material (max 2MB). It will be shown to transport users when they order.</p>
                        </div>
                    </div>

                    <p className="text-xs text-text-muted">💡 This material will appear in the dropdown when transport users place orders.</p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => { setShowStockModal(false); setImageFile(null); setImagePreview(null); }}>Cancel</Button>
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
