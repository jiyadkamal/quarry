'use client';

import { useEffect, useState } from 'react';
import { Users, Package, ClipboardList, BarChart3, Factory, TrendingUp } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, LoadingSkeleton, EmptyState, Button, Modal, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'transport' });
    const [addLoading, setAddLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setData(d);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddUser = async () => {
        setAddLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addForm),
            });
            const d = await res.json();
            if (!res.ok) { toast.error(d.error); return; }
            toast.success(`User created!${d.operatorId ? ` Operator ID: ${d.operatorId}` : ''}`);
            setShowAddUser(false);
            setAddForm({ name: '', email: '', password: '', role: 'transport' });
            fetchData();
        } catch { toast.error('Failed'); } finally { setAddLoading(false); }
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

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-4 gap-5">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32" />)}</div><div className="skeleton h-64" /></div>;

    const totalStock = data?.stock?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0;
    const pendingRequests = data?.requests?.filter((r: any) => r.status === 'pending') || [];
    const totalProduction = data?.productionLogs?.reduce((s: number, l: any) => s + (l.outputQuantity || 0), 0) || 0;
    const operators = data?.users?.filter((u: any) => u.role === 'operator') || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-1">Overview of all quarry operations</p>
                </div>
                <Button icon={Users} onClick={() => setShowAddUser(true)}>Add User</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
                <StatCard title="Total Users" value={data?.users?.length || 0} icon={Users} color="blue" subtitle={`${operators.length} operators`} />
                <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="green" subtitle="Across all operators" />
                <StatCard title="Pending Requests" value={pendingRequests.length} icon={ClipboardList} color="yellow" />
                <StatCard title="Total Production" value={totalProduction.toLocaleString()} icon={Factory} color="purple" subtitle="Units produced" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Requests */}
                <DataCard title="Pending Dispatch Requests" subtitle={`${pendingRequests.length} awaiting approval`}>
                    {pendingRequests.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="No Pending Requests" description="All dispatch requests have been processed." />
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {pendingRequests.map((r: any) => (
                                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light card-hover">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{r.materialType}</p>
                                        <p className="text-xs text-text-secondary">Qty: {r.quantity} · Operator: {r.operatorId}</p>
                                        <p className="text-xs text-text-muted mt-0.5">{new Date(r.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="primary" onClick={() => handleApprove(r.id, 'approved')}>Approve</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleApprove(r.id, 'rejected')}>Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DataCard>

                {/* Stock Overview */}
                <DataCard title="Stock Overview" subtitle="Current inventory levels">
                    {(!data?.stock || data.stock.length === 0) ? (
                        <EmptyState icon={Package} title="No Stock Data" description="No stock records found." />
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {data.stock.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{s.materialType}</p>
                                        <p className="text-xs text-text-secondary">Operator: {s.operatorId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">{s.quantity?.toLocaleString()}</p>
                                        {s.pricePerUnit !== undefined && (
                                            <p className="text-xs font-semibold text-emerald-600">₹{s.pricePerUnit?.toLocaleString()}/unit</p>
                                        )}
                                        <p className="text-xs text-text-muted">{s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString() : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DataCard>
            </div>

            {/* Users Table */}
            <DataCard title="All Users" subtitle={`${data?.users?.length || 0} registered users`}>
                {(!data?.users || data.users.length === 0) ? (
                    <EmptyState icon={Users} title="No Users" description="No users registered yet." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Name</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Role</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Operator ID</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Joined</th>
                            </tr></thead>
                            <tbody>
                                {data.users.map((u: any) => (
                                    <tr key={u.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
                                        <td className="py-3 px-4 font-medium text-text-primary">{u.name}</td>
                                        <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                                        <td className="py-3 px-4"><StatusBadge status={u.role} /></td>
                                        <td className="py-3 px-4 font-mono text-xs text-secondary">{u.operatorId || '—'}</td>
                                        <td className="py-3 px-4 text-text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DataCard>

            {/* Add User Modal */}
            <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add New User">
                <div className="space-y-4">
                    <Input label="Full Name" name="name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
                    <Input label="Email" name="email" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required />
                    <Input label="Password" name="password" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required />
                    <Select label="Role" name="role" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} options={[{ value: 'admin', label: 'Admin' }, { value: 'operator', label: 'Operator' }, { value: 'transport', label: 'Transport / User' }]} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowAddUser(false)}>Cancel</Button>
                        <Button onClick={handleAddUser} loading={addLoading}>Create User</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
