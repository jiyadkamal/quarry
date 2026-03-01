'use client';

import { useEffect, useState } from 'react';
import { Package, Factory, Wrench, ClipboardList, Users, TrendingUp, Plus } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, EmptyState, Button, Modal, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OperatorDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showProdModal, setShowProdModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [machineStatus, setMachineStatus] = useState('');
    const [prodForm, setProdForm] = useState({ rawInput: '', outputType: '', outputQuantity: '' });
    const [stockForm, setStockForm] = useState({ materialType: '', quantity: '' });
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
            if (res.ok) { toast.success(`Request ${status}`); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); }
    };

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-4 gap-5">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32" />)}</div></div>;

    const totalStock = data?.stock?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0;
    const pendingRequests = data?.requests?.filter((r: any) => r.status === 'pending') || [];
    const totalProduction = data?.productionLogs?.reduce((s: number, l: any) => s + (l.outputQuantity || 0), 0) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Operator Dashboard</h1>
                    <div className="flex flex-col mt-4 p-6 rounded-2xl bg-white border-2 border-primary/10 shadow-sm inline-block">
                        <span className="text-xs uppercase font-black text-primary/40 tracking-[0.2em] mb-2">OPERATOR IDENTIFICATION</span>
                        <p className="text-6xl font-mono text-primary font-black tracking-tighter drop-shadow-md">{data?.user?.operatorId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button icon={Factory} onClick={() => setShowProdModal(true)}>Log Production</Button>
                    <Button icon={Package} variant="secondary" onClick={() => setShowStockModal(true)}>Update Stock</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
                <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="green" />
                <StatCard title="Production Output" value={totalProduction.toLocaleString()} icon={Factory} color="blue" subtitle={`${data?.productionLogs?.length || 0} entries`} />
                <StatCard title="Pending Requests" value={pendingRequests.length} icon={ClipboardList} color="yellow" />
                <StatCard title="Connected Users" value={data?.connectedUsers?.length || 0} icon={Users} color="purple" />
            </div>

            {/* Machine Status */}
            <DataCard title="Machine Status" subtitle="Update current machine operating status">
                <div className="flex flex-wrap gap-3">
                    {['Running', 'Stopped', 'Maintenance'].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleMachineStatus(s)}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border-2 ${machineStatus === s
                                ? s === 'Running' ? 'bg-success text-white border-success shadow-lg shadow-success/20'
                                    : s === 'Stopped' ? 'bg-danger text-white border-danger shadow-lg shadow-danger/20'
                                        : 'bg-warning text-white border-warning shadow-lg shadow-warning/20'
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Requests */}
                <DataCard title="Incoming Requests" subtitle={`${pendingRequests.length} pending`}>
                    {pendingRequests.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="No Requests" description="No pending material requests." />
                    ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto">
                            {pendingRequests.map((r: any) => (
                                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light card-hover">
                                    <div>
                                        <p className="text-sm font-medium">{r.materialType}</p>
                                        <p className="text-xs text-text-secondary">Qty: {r.quantity}</p>
                                        <p className="text-xs text-text-muted">{new Date(r.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleApprove(r.id, 'approved')}>Approve</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleApprove(r.id, 'rejected')}>Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DataCard>

                {/* Current Stock */}
                <DataCard title="Current Stock" subtitle="Inventory levels">
                    {(!data?.stock || data.stock.length === 0) ? (
                        <EmptyState icon={Package} title="No Stock" description="No stock entries yet. Log production to auto-create stock." />
                    ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto">
                            {data.stock.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light">
                                    <p className="text-sm font-medium">{s.materialType}</p>
                                    <p className="text-lg font-bold text-primary">{s.quantity?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </DataCard>
            </div>

            {/* Recent Production */}
            <DataCard title="Recent Production Logs" subtitle={`${data?.productionLogs?.length || 0} total entries`}>
                {(!data?.productionLogs || data.productionLogs.length === 0) ? (
                    <EmptyState icon={Factory} title="No Production Logs" description="Log your first production entry above." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Raw Input</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Output Type</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantity</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                            </tr></thead>
                            <tbody>
                                {data.productionLogs.slice(0, 10).map((l: any) => (
                                    <tr key={l.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
                                        <td className="py-3 px-4">{l.rawInput}</td>
                                        <td className="py-3 px-4 font-medium">{l.outputType}</td>
                                        <td className="py-3 px-4 text-primary font-bold">{l.outputQuantity}</td>
                                        <td className="py-3 px-4 text-text-muted">{l.date ? new Date(l.date).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DataCard>

            {/* Connected Users */}
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
            <Modal open={showStockModal} onClose={() => setShowStockModal(false)} title="Update Stock">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Sand" value={stockForm.materialType} onChange={(e) => setStockForm({ ...stockForm, materialType: e.target.value })} required />
                    <Input label="New Quantity" name="quantity" type="number" placeholder="e.g. 1000" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowStockModal(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStock} loading={submitLoading}>Update Stock</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
