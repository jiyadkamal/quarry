'use client';

import { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { DataCard, StatusBadge, EmptyState, Button, Modal, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'transport' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setUsers(d.users || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAdd = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const d = await res.json();
            if (!res.ok) { toast.error(d.error); return; }
            toast.success(`User created!${d.operatorId ? ` Operator ID: ${d.operatorId}` : ''}`);
            setShowModal(false);
            setForm({ name: '', email: '', password: '', role: 'transport' });
            fetchUsers();
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
                    <p className="text-sm text-text-secondary mt-1">Create and manage system users</p>
                </div>
                <Button icon={Plus} onClick={() => setShowModal(true)}>Add User</Button>
            </div>

            <DataCard title="All Users" subtitle={`${users.length} registered`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : users.length === 0 ? (
                    <EmptyState icon={Users} title="No Users" description="No users have been registered." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Name</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Role</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Operator ID</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Connected To</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Joined</th>
                            </tr></thead>
                            <tbody>{users.map((u: any) => (
                                <tr key={u.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
                                    <td className="py-3 px-4 font-medium">{u.name}</td>
                                    <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                                    <td className="py-3 px-4"><StatusBadge status={u.role} /></td>
                                    <td className="py-3 px-4 font-mono text-lg font-black text-primary tracking-tight">{u.operatorId || '—'}</td>
                                    <td className="py-3 px-4 font-mono text-xs">{u.connectedOperatorId || '—'}</td>
                                    <td className="py-3 px-4 text-text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </DataCard>

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New User">
                <div className="space-y-4">
                    <Input label="Full Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <Input label="Password" name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <Select label="Role" name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'admin', label: 'Admin' }, { value: 'operator', label: 'Operator' }, { value: 'transport', label: 'Transport / User' }]} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleAdd} loading={submitLoading}>Create User</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
