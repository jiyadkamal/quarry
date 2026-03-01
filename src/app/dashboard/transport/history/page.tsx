'use client';

import { useEffect, useState } from 'react';
import { History, ArrowRight, MessageSquare } from 'lucide-react';
import { DataCard, StatusBadge, EmptyState } from '@/components/ui';

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
    const stages = ['accepted', 'mining', 'crushing', 'powdering', 'packing', 'completed'];
    const currentIdx = stages.indexOf(currentStage);
    return (
        <div className="flex items-center gap-1 flex-wrap">
            {stages.map((stage, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                    <div key={stage} className="flex items-center gap-1">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'bg-primary text-white shadow-md'
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
                <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
                <p className="text-sm text-text-secondary mt-1">Track all your past and current orders</p>
            </div>

            <DataCard title="All Orders" subtitle={`${requests.length} total`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-16" />)}</div> : requests.length === 0 ? (
                    <EmptyState icon={History} title="No Orders" description="You haven't placed any orders yet." />
                ) : (
                    <div className="space-y-4">
                        {requests.map((r: any) => (
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
                                {r.statusHistory && r.statusHistory.length > 0 && (
                                    <div className="mt-3 pl-3 border-l-2 border-primary/15 space-y-2">
                                        {r.statusHistory.map((entry: any, idx: number) => (
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
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>
        </div>
    );
}
