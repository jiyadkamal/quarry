'use client';

import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { DataCard, StatusBadge, EmptyState } from '@/components/ui';

export default function TransportHistoryPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/dashboard/data');
                const d = await res.json();
                if (res.ok) setRequests(d.requests || []);
            } catch { } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Dispatch History</h1>
                <p className="text-sm text-text-secondary mt-1">All your material requests and their status</p>
            </div>

            <DataCard title="Request History" subtitle={`${requests.length} total requests`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : requests.length === 0 ? (
                    <EmptyState icon={History} title="No History" description="You haven't submitted any material requests yet." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Material</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantity</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                            </tr></thead>
                            <tbody>{requests.map((r: any) => (
                                <tr key={r.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
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
