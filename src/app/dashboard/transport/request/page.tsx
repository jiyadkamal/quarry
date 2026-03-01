'use client';

import { useEffect, useState } from 'react';
import { Truck, Package } from 'lucide-react';
import { DataCard, EmptyState, Button, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

export default function TransportRequestPage() {
    const [stock, setStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ materialType: '', quantity: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/dashboard/data');
                const d = await res.json();
                if (res.ok) setStock(d.stock || []);
            } catch { } finally { setLoading(false); }
        })();
    }, []);

    const handleSubmit = async () => {
        if (!form.materialType || !form.quantity) {
            toast.error('Please select a material and enter quantity');
            return;
        }
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/request/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: form.materialType, quantity: Number(form.quantity) }),
            });
            const d = await res.json();
            if (res.ok) { toast.success('Order placed!'); setShowModal(false); setForm({ materialType: '', quantity: '' }); }
            else toast.error(d.error);
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    const selectedStock = stock.find(s => s.materialType === form.materialType);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Place New Order</h1>
                    <p className="text-sm text-text-secondary mt-1">Select a material from your operator's catalog</p>
                </div>
                <Button icon={Truck} onClick={() => setShowModal(true)}>Place Order</Button>
            </div>

            <DataCard title="Available Materials" subtitle="Click on a material to place an order">
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : stock.length === 0 ? (
                    <EmptyState icon={Package} title="No Materials Available" description="Your operator has not added any materials. Please connect to an operator first." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stock.map((s: any) => (
                            <div key={s.id} className="p-5 rounded-2xl bg-surface border border-border-light card-hover cursor-pointer group" onClick={() => { setForm({ materialType: s.materialType, quantity: '' }); setShowModal(true); }}>
                                <Package className="w-5 h-5 text-secondary mb-2 group-hover:text-primary transition-colors" />
                                <p className="font-semibold">{s.materialType}</p>
                                <p className="text-2xl font-bold text-primary mt-1">{s.quantity?.toLocaleString()}</p>
                                <p className="text-xs text-text-muted mt-1">Available · Click to order</p>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Place Order">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Select Material <span className="text-danger">*</span>
                        </label>
                        <select
                            value={form.materialType}
                            onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                            <option value="">— Choose a material —</option>
                            {stock.map((s: any) => (
                                <option key={s.id} value={s.materialType}>
                                    {s.materialType} ({s.quantity?.toLocaleString()} available)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Enter quantity"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                            min={1}
                            max={selectedStock?.quantity || undefined}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {selectedStock && (
                            <p className="text-xs text-text-muted mt-1">Max: <span className="font-bold text-primary">{selectedStock.quantity?.toLocaleString()}</span></p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitLoading}>Place Order</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
