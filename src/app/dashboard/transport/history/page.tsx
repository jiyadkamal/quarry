'use client';

import { useEffect, useState } from 'react';
import { History, ArrowRight, MessageSquare, IndianRupee, CheckCircle2 } from 'lucide-react';
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
        return <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-red-50 text-red-600 border border-red-200">✕ Rejected</span>;
    }
    if (currentStage === 'pending') {
        return <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-amber-50 text-amber-600 border border-amber-200">⏳ Awaiting Approval</span>;
    }
    const stages = ['accepted', 'mining', 'crushing', 'powdering', 'packing', 'completed'];
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
                                        <p className="font-semibold text-text-primary text-lg">{r.materialType}</p>
                                        <p className="text-sm text-text-secondary">Quantity: <span className="font-bold text-primary text-lg">{r.quantity}</span></p>
                                        {r.totalPrice > 0 && (
                                            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-0.5">
                                                <IndianRupee className="w-3.5 h-3.5" />{r.totalPrice?.toLocaleString()}
                                                <span className="text-xs text-text-muted font-normal ml-1">(₹{r.pricePerUnit}/unit)</span>
                                            </p>
                                        )}
                                        <p className="text-xs text-text-muted">{new Date(r.date).toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusBadge status={r.currentStage || r.status} />
                                        {r.status !== 'pending' && r.status !== 'rejected' && (
                                            r.paymentStatus === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                                    Unpaid
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                                <StageProgress currentStage={r.currentStage || r.status} />
                                <StatusTimeline history={r.statusHistory} />
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>
        </div>
    );
}

