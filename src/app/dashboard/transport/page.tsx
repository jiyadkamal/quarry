'use client';

import { useEffect, useState } from 'react';
import { Link2, Truck, Package, ClipboardList, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, EmptyState, Button, Modal, Select } from '@/components/ui';
import toast from 'react-hot-toast';

const STAGE_ORDER = ['pending', 'accepted', 'mining', 'crushing', 'powdering', 'packing', 'completed'];
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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-warning-light text-warning">Awaiting Approval</span>;
    }

    const stages = ['accepted', 'mining', 'crushing', 'powdering', 'packing', 'completed'];
    const currentIdx = stages.indexOf(currentStage);

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {stages.map((stage, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                    <div key={stage} className="flex items-center gap-1">
                        <div
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${isCurrent
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110'
                                    : isCompleted
                                        ? 'bg-success-light text-success'
                                        : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {STAGE_LABELS[stage]}
                        </div>
                        {idx < stages.length - 1 && (
                            <ArrowRight className={`w-3 h-3 ${isCompleted ? 'text-success' : 'text-gray-300'}`} />
                        )}
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

export default function TransportDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [connectForm, setConnectForm] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({ materialType: '', quantity: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) {
                setData(d);
                setConnected(d.user?.connectedOperatorId ? true : false);
            }
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleConnect = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/operator/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operatorId: connectForm }),
            });
            const d = await res.json();
            if (res.ok) {
                toast.success(`Connected to operator ${connectForm}!`);
                setConnected(true);
                window.location.reload();
            } else { toast.error(d.error); }
        } catch { toast.error('Connection failed'); } finally { setSubmitLoading(false); }
    };

    const handleRequest = async () => {
        if (!requestForm.materialType || !requestForm.quantity) {
            toast.error('Please select a material and enter quantity');
            return;
        }
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/request/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: requestForm.materialType, quantity: Number(requestForm.quantity) }),
            });
            const d = await res.json();
            if (res.ok) {
                toast.success('Order placed successfully!');
                setShowRequestModal(false);
                setRequestForm({ materialType: '', quantity: '' });
                fetchData();
            } else { toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-3 gap-5">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32" />)}</div></div>;

    const pendingCount = data?.requests?.filter((r: any) => r.status === 'pending').length || 0;
    const inProgressCount = data?.requests?.filter((r: any) => ['accepted', 'in-progress'].includes(r.status)).length || 0;
    const completedCount = data?.requests?.filter((r: any) => r.status === 'completed').length || 0;

    const stockOptions = (data?.stock || []).map((s: any) => ({
        value: s.materialType,
        label: `${s.materialType} (${s.quantity?.toLocaleString()} available)`,
    }));

    const selectedStock = data?.stock?.find((s: any) => s.materialType === requestForm.materialType);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Transport Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-1">Place orders and track their progress</p>
                </div>
                {connected && (
                    <Button icon={Truck} onClick={() => setShowRequestModal(true)}>Place Order</Button>
                )}
            </div>

            {/* Connection Card */}
            {!connected && (
                <div className="animate-fade-in">
                    <DataCard title="Connect to an Operator" subtitle="Enter an Operator ID to start placing orders">
                        <div className="max-w-md mx-auto text-center py-4">
                            <div className="w-20 h-20 rounded-2xl bg-sky-light flex items-center justify-center mx-auto mb-4">
                                <Link2 className="w-8 h-8 text-secondary" />
                            </div>
                            <p className="text-sm text-text-secondary mb-6">
                                You need to connect to an operator before you can view available materials or place orders.
                                Ask your operator for their Operator ID.
                            </p>
                            <div className="flex gap-3 max-w-xs mx-auto">
                                <input
                                    type="text"
                                    placeholder="e.g. OP-0000001"
                                    value={connectForm}
                                    onChange={(e) => setConnectForm(e.target.value.toUpperCase())}
                                    className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-mono text-center uppercase outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                                />
                                <Button onClick={handleConnect} loading={submitLoading}>Connect</Button>
                            </div>
                        </div>
                    </DataCard>
                </div>
            )}

            {/* Connected Content */}
            {connected && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 animate-fade-in">
                        <StatCard title="Available Materials" value={data?.stock?.length || 0} icon={Package} color="green" />
                        <StatCard title="Pending Orders" value={pendingCount} icon={ClipboardList} color="yellow" />
                        <StatCard title="In Progress" value={inProgressCount} icon={Truck} color="blue" />
                        <StatCard title="Completed" value={completedCount} icon={CheckCircle} color="purple" />
                    </div>

                    {/* Available Materials to Order */}
                    <DataCard title="Available Materials" subtitle="Click on a material to place an order">
                        {(!data?.stock || data.stock.length === 0) ? (
                            <EmptyState icon={Package} title="No Materials Available" description="Your connected operator has not listed any materials yet." />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.stock.map((s: any) => (
                                    <div
                                        key={s.id}
                                        className="p-5 rounded-2xl bg-surface border border-border-light card-hover cursor-pointer group"
                                        onClick={() => { setRequestForm({ materialType: s.materialType, quantity: '' }); setShowRequestModal(true); }}
                                    >
                                        <Package className="w-5 h-5 text-secondary mb-2 group-hover:text-primary transition-colors" />
                                        <p className="font-semibold text-text-primary">{s.materialType}</p>
                                        <p className="text-2xl font-bold text-primary mt-1">{s.quantity?.toLocaleString()}</p>
                                        <p className="text-xs text-text-muted mt-1">Available · Click to order</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DataCard>

                    {/* My Orders */}
                    <DataCard title="My Orders" subtitle={`${data?.requests?.length || 0} total orders`}>
                        {(!data?.requests || data.requests.length === 0) ? (
                            <EmptyState icon={ClipboardList} title="No Orders Yet" description="Place your first order from the available materials above." />
                        ) : (
                            <div className="space-y-4">
                                {data.requests.map((r: any) => (
                                    <div key={r.id} className="p-5 rounded-2xl bg-surface border border-border-light">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-text-primary">{r.materialType}</p>
                                                <p className="text-sm text-text-secondary">Quantity: <span className="font-bold text-primary">{r.quantity}</span></p>
                                                <p className="text-xs text-text-muted">{new Date(r.date).toLocaleString()}</p>
                                            </div>
                                            <StatusBadge status={r.currentStage || r.status} />
                                        </div>
                                        <StageProgress currentStage={r.currentStage || r.status} />
                                        <StatusTimeline history={r.statusHistory} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </DataCard>
                </>
            )}

            {/* Place Order Modal */}
            <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Place Order">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Select Material <span className="text-danger">*</span>
                        </label>
                        <select
                            value={requestForm.materialType}
                            onChange={(e) => setRequestForm({ ...requestForm, materialType: e.target.value })}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                            <option value="">— Choose a material —</option>
                            {stockOptions.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Enter quantity"
                            value={requestForm.quantity}
                            onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                            min={1}
                            max={selectedStock?.quantity || undefined}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {selectedStock && (
                            <p className="text-xs text-text-muted mt-1">Max available: <span className="font-bold text-primary">{selectedStock.quantity?.toLocaleString()}</span></p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                        <Button onClick={handleRequest} loading={submitLoading}>Place Order</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
