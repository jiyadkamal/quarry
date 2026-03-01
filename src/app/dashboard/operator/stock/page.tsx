'use client';

import { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { DataCard, EmptyState, Button, Modal, Input } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OperatorStockPage() {
    const [stock, setStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ materialType: '', quantity: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setStock(d.stock || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/operator/update-stock', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: form.materialType, quantity: Number(form.quantity) }),
            });
            if (res.ok) { toast.success('Stock updated!'); setShowModal(false); setForm({ materialType: '', quantity: '' }); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    const totalQty = stock.reduce((s, i) => s + (i.quantity || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Stock Management</h1>
                    <p className="text-sm text-text-secondary mt-1">Total: <span className="font-bold text-primary">{totalQty.toLocaleString()}</span></p>
                </div>
                <Button icon={Plus} onClick={() => setShowModal(true)}>Update Stock</Button>
            </div>

            <DataCard title="Current Inventory" subtitle={`${stock.length} material types`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : stock.length === 0 ? (
                    <EmptyState icon={Package} title="No Stock" description="Add stock manually or log production." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stock.map((s: any) => (
                            <div key={s.id} className="p-5 rounded-2xl bg-surface border border-border-light card-hover">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold">{s.materialType}</p>
                                    <Package className="w-4 h-4 text-text-muted" />
                                </div>
                                <p className="text-2xl font-bold text-primary">{s.quantity?.toLocaleString()}</p>
                                <p className="text-xs text-text-muted mt-1">{s.lastUpdated ? `Updated: ${new Date(s.lastUpdated).toLocaleDateString()}` : ''}</p>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Update Stock">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Sand" value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value })} required />
                    <Input label="Quantity" name="quantity" type="number" placeholder="1000" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitLoading}>Update</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
