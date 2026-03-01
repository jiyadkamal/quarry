'use client';

import { useEffect, useState } from 'react';
import { Truck, Package } from 'lucide-react';
import { DataCard, EmptyState, Button, Modal, Input } from '@/components/ui';
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
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/request/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: form.materialType, quantity: Number(form.quantity) }),
            });
            const d = await res.json();
            if (res.ok) { toast.success('Request submitted!'); setShowModal(false); setForm({ materialType: '', quantity: '' }); }
            else toast.error(d.error);
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">New Material Request</h1>
                    <p className="text-sm text-text-secondary mt-1">Request materials from your connected operator</p>
                </div>
                <Button icon={Truck} onClick={() => setShowModal(true)}>Submit Request</Button>
            </div>

            <DataCard title="Available Stock" subtitle="Materials you can request from your operator">
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : stock.length === 0 ? (
                    <EmptyState icon={Package} title="No Stock Available" description="Your operator has no stock entries. Please connect to an operator first." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stock.map((s: any) => (
                            <div key={s.id} className="p-5 rounded-2xl bg-surface border border-border-light card-hover cursor-pointer" onClick={() => { setForm({ materialType: s.materialType, quantity: '' }); setShowModal(true); }}>
                                <Package className="w-5 h-5 text-secondary mb-2" />
                                <p className="font-semibold">{s.materialType}</p>
                                <p className="text-2xl font-bold text-primary mt-1">{s.quantity?.toLocaleString()}</p>
                                <p className="text-xs text-text-muted mt-1">Click to request</p>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit Material Request">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Crushed Stone" value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value })} required />
                    <Input label="Quantity" name="quantity" type="number" placeholder="100" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                    <p className="text-xs text-text-muted">⚠️ Request will be auto-rejected if it exceeds available stock.</p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitLoading}>Submit</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
