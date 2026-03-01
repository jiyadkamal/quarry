'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { DataCard, EmptyState } from '@/components/ui';

export default function AdminStockPage() {
    const [stock, setStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/dashboard/data');
                const d = await res.json();
                if (res.ok) setStock(d.stock || []);
            } catch { } finally { setLoading(false); }
        })();
    }, []);

    const totalQty = stock.reduce((s, i) => s + (i.quantity || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Stock Overview</h1>
                <p className="text-sm text-text-secondary mt-1">Global inventory across all operators · Total: <span className="font-bold text-primary">{totalQty.toLocaleString()}</span></p>
            </div>

            <DataCard title="All Stock" subtitle={`${stock.length} entries`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : stock.length === 0 ? (
                    <EmptyState icon={Package} title="No Stock" description="No stock records found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Material Type</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Operator</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantity</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Last Updated</th>
                            </tr></thead>
                            <tbody>{stock.map((s: any) => (
                                <tr key={s.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
                                    <td className="py-3 px-4 font-medium">{s.materialType}</td>
                                    <td className="py-3 px-4 font-mono text-xs text-secondary">{s.operatorId}</td>
                                    <td className="py-3 px-4 text-primary font-bold">{s.quantity?.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-text-muted">{s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </DataCard>
        </div>
    );
}
