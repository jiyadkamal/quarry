'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Package, Factory, ClipboardList, TrendingUp } from 'lucide-react';
import { StatCard, DataCard, EmptyState } from '@/components/ui';

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/dashboard/data');
                const d = await res.json();
                if (res.ok) setData(d);
            } catch { } finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-3 gap-5">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32" />)}</div></div>;

    const totalStock = data?.stock?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0;
    const totalProduction = data?.productionLogs?.reduce((s: number, l: any) => s + (l.outputQuantity || 0), 0) || 0;
    const approved = data?.requests?.filter((r: any) => r.status === 'approved').length || 0;
    const rejected = data?.requests?.filter((r: any) => r.status === 'rejected').length || 0;
    const pending = data?.requests?.filter((r: any) => r.status === 'pending').length || 0;
    const operators = data?.users?.filter((u: any) => u.role === 'operator') || [];
    const transUsers = data?.users?.filter((u: any) => u.role === 'transport') || [];
    const admins = data?.users?.filter((u: any) => u.role === 'admin') || [];

    // Material breakdown
    const materialMap: Record<string, number> = {};
    data?.stock?.forEach((s: any) => {
        materialMap[s.materialType] = (materialMap[s.materialType] || 0) + s.quantity;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Analytics Dashboard</h1>
                <p className="text-sm text-text-secondary mt-1">System-wide statistics and insights</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
                <StatCard title="Total Users" value={data?.users?.length || 0} icon={Users} color="blue" subtitle={`${admins.length}A / ${operators.length}O / ${transUsers.length}T`} />
                <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="green" />
                <StatCard title="Total Production" value={totalProduction.toLocaleString()} icon={Factory} color="purple" />
                <StatCard title="Total Requests" value={data?.requests?.length || 0} icon={ClipboardList} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Breakdown */}
                <DataCard title="Request Status Breakdown" subtitle="Distribution of all dispatch requests">
                    <div className="space-y-4">
                        {[
                            { label: 'Approved', count: approved, color: 'bg-success', pct: data?.requests?.length ? Math.round((approved / data.requests.length) * 100) : 0 },
                            { label: 'Rejected', count: rejected, color: 'bg-danger', pct: data?.requests?.length ? Math.round((rejected / data.requests.length) * 100) : 0 },
                            { label: 'Pending', count: pending, color: 'bg-warning', pct: data?.requests?.length ? Math.round((pending / data.requests.length) * 100) : 0 },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-text-primary">{item.label}</span>
                                    <span className="text-sm text-text-secondary">{item.count} ({item.pct}%)</span>
                                </div>
                                <div className="w-full bg-border-light rounded-full h-2.5">
                                    <div className={`${item.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </DataCard>

                {/* Material Breakdown */}
                <DataCard title="Material Inventory" subtitle="Stock distribution by material type">
                    {Object.keys(materialMap).length === 0 ? (
                        <EmptyState icon={Package} title="No Data" description="No stock data to analyze." />
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(materialMap).sort(([, a], [, b]) => b - a).map(([type, qty]) => (
                                <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-light">
                                    <span className="text-sm font-medium">{type}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-border-light rounded-full h-2">
                                            <div className="bg-secondary h-2 rounded-full" style={{ width: `${totalStock ? (qty / totalStock) * 100 : 0}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-primary w-16 text-right">{qty.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DataCard>
            </div>

            {/* Operator Performance */}
            <DataCard title="Operator Performance" subtitle="Production by operator">
                {operators.length === 0 ? (
                    <EmptyState icon={Factory} title="No Operators" description="No operator data available." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {operators.map((op: any) => {
                            const opProd = data?.productionLogs?.filter((l: any) => l.operatorId === op.operatorId).reduce((s: number, l: any) => s + (l.outputQuantity || 0), 0) || 0;
                            const opStock = data?.stock?.filter((s: any) => s.operatorId === op.operatorId).reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0;
                            const opReqs = data?.requests?.filter((r: any) => r.operatorId === op.operatorId).length || 0;
                            return (
                                <div key={op.id} className="p-5 rounded-2xl bg-surface border border-border-light card-hover">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-sm">
                                            {op.name?.charAt(0)?.toUpperCase() || 'O'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{op.name}</p>
                                            <p className="text-xs font-mono text-secondary">{op.operatorId}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-sky-light"><p className="text-xs text-text-secondary">Production</p><p className="text-sm font-bold text-primary">{opProd}</p></div>
                                        <div className="p-2 rounded-lg bg-success-light"><p className="text-xs text-text-secondary">Stock</p><p className="text-sm font-bold text-success">{opStock}</p></div>
                                        <div className="p-2 rounded-lg bg-warning-light"><p className="text-xs text-text-secondary">Requests</p><p className="text-sm font-bold text-warning">{opReqs}</p></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DataCard>
        </div>
    );
}
