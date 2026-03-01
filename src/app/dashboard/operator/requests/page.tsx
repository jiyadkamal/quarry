'use client';

import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { DataCard, StatusBadge, EmptyState, Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OperatorRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setRequests(d.requests || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/request/approve', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: id, status }),
            });
            if (res.ok) { toast.success(`Request ${status}`); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); }
    };

    const pending = requests.filter(r => r.status === 'pending');
    const others = requests.filter(r => r.status !== 'pending');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Material Requests</h1>
                <p className="text-sm text-text-secondary mt-1">Manage requests from connected transport users</p>
            </div>

            <DataCard title="Pending" subtitle={`${pending.length} requests`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : pending.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="No Pending" description="All requests have been processed." />
                ) : (
                    <div className="space-y-3">{pending.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light card-hover">
                            <div>
                                <p className="text-sm font-medium">{r.materialType}</p>
                                <p className="text-xs text-text-secondary">Qty: {r.quantity} · {new Date(r.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleAction(r.id, 'approved')}>Approve</Button>
                                <Button size="sm" variant="danger" onClick={() => handleAction(r.id, 'rejected')}>Reject</Button>
                            </div>
                        </div>
                    ))}</div>
                )}
            </DataCard>

            <DataCard title="Request History" subtitle={`${others.length} processed`}>
                {others.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="No History" description="No processed requests." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Material</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Qty</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                            </tr></thead>
                            <tbody>{others.map(r => (
                                <tr key={r.id} className="border-b border-border-light last:border-0 hover:bg-surface">
                                    <td className="py-3 px-4 font-medium">{r.materialType}</td>
                                    <td className="py-3 px-4">{r.quantity}</td>
                                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                                    <td className="py-3 px-4 text-text-muted">{new Date(r.date).toLocaleDateString()}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </DataCard>
        </div>
    );
}
