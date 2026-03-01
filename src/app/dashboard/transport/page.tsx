'use client';

import { useEffect, useState } from 'react';
import { Link2, Truck, Package, ClipboardList, History, CheckCircle } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, EmptyState, Button, Modal, Input } from '@/components/ui';
import toast from 'react-hot-toast';

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
                setConnected(d.stock?.length > 0 || d.requests?.length > 0);
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
                fetchData();
                // Refresh to update session
                window.location.reload();
            } else { toast.error(d.error); }
        } catch { toast.error('Connection failed'); } finally { setSubmitLoading(false); }
    };

    const handleRequest = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/request/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: requestForm.materialType, quantity: Number(requestForm.quantity) }),
            });
            const d = await res.json();
            if (res.ok) {
                toast.success('Request submitted!');
                setShowRequestModal(false);
                setRequestForm({ materialType: '', quantity: '' });
                fetchData();
            } else { toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-3 gap-5">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32" />)}</div></div>;

    const pendingCount = data?.requests?.filter((r: any) => r.status === 'pending').length || 0;
    const approvedCount = data?.requests?.filter((r: any) => r.status === 'approved').length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Transport Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-1">Request materials and track dispatch status</p>
                </div>
                {connected && (
                    <Button icon={Truck} onClick={() => setShowRequestModal(true)}>New Request</Button>
                )}
            </div>

            {/* Connection Card */}
            {!connected && (!data?.stock || data.stock.length === 0) && (!data?.requests || data.requests.length === 0) && (
                <div className="animate-fade-in">
                    <DataCard title="Connect to an Operator" subtitle="Enter an Operator ID to start requesting materials">
                        <div className="max-w-md mx-auto text-center py-4">
                            <div className="w-20 h-20 rounded-2xl bg-sky-light flex items-center justify-center mx-auto mb-4">
                                <Link2 className="w-8 h-8 text-secondary" />
                            </div>
                            <p className="text-sm text-text-secondary mb-6">
                                You need to connect to an operator before you can view stock or submit material requests.
                                Ask your operator for their Operator ID (e.g., OP-001).
                            </p>
                            <div className="flex gap-3 max-w-xs mx-auto">
                                <input
                                    type="text"
                                    placeholder="e.g. OP-001"
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

            {/* Connected Stats */}
            {(connected || (data?.stock?.length > 0) || (data?.requests?.length > 0)) && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in">
                        <StatCard title="Available Materials" value={data?.stock?.length || 0} icon={Package} color="green" />
                        <StatCard title="Pending Requests" value={pendingCount} icon={ClipboardList} color="yellow" />
                        <StatCard title="Approved" value={approvedCount} icon={CheckCircle} color="blue" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Available Stock from Operator */}
                        <DataCard title="Available Stock" subtitle="Materials from your connected operator">
                            {(!data?.stock || data.stock.length === 0) ? (
                                <EmptyState icon={Package} title="No Stock Available" description="Your connected operator has no stock entries yet." />
                            ) : (
                                <div className="space-y-3">
                                    {data.stock.map((s: any) => (
                                        <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light card-hover">
                                            <div>
                                                <p className="text-sm font-medium">{s.materialType}</p>
                                                <p className="text-xs text-text-muted">{s.lastUpdated ? `Updated: ${new Date(s.lastUpdated).toLocaleDateString()}` : ''}</p>
                                            </div>
                                            <p className="text-lg font-bold text-primary">{s.quantity?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DataCard>

                        {/* Request History */}
                        <DataCard title="Request History" subtitle={`${data?.requests?.length || 0} total requests`}>
                            {(!data?.requests || data.requests.length === 0) ? (
                                <EmptyState icon={History} title="No Requests" description="You haven't submitted any material requests yet." />
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {data.requests.map((r: any) => (
                                        <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light">
                                            <div>
                                                <p className="text-sm font-medium">{r.materialType}</p>
                                                <p className="text-xs text-text-secondary">Qty: {r.quantity}</p>
                                                <p className="text-xs text-text-muted">{new Date(r.date).toLocaleDateString()}</p>
                                            </div>
                                            <StatusBadge status={r.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DataCard>
                    </div>
                </>
            )}

            {/* Request Modal */}
            <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Submit Material Request">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Crushed Stone 20mm" value={requestForm.materialType} onChange={(e) => setRequestForm({ ...requestForm, materialType: e.target.value })} required />
                    <Input label="Quantity" name="quantity" type="number" placeholder="e.g. 100" value={requestForm.quantity} onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })} required />
                    <p className="text-xs text-text-muted">⚠️ Request will be rejected automatically if stock is insufficient.</p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                        <Button onClick={handleRequest} loading={submitLoading}>Submit Request</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
