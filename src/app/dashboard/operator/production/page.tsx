'use client';

import { useEffect, useState } from 'react';
import { Factory, Plus } from 'lucide-react';
import { DataCard, EmptyState, Button, Modal, Input } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OperatorProductionPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ rawInput: '', outputType: '', outputQuantity: '', pricePerUnit: '' });
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setLogs(d.productionLogs || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/operator/log-production', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    outputQuantity: Number(form.outputQuantity),
                    pricePerUnit: form.pricePerUnit ? Number(form.pricePerUnit) : undefined
                }),
            });
            if (res.ok) { toast.success('Production logged!'); setShowModal(false); setForm({ rawInput: '', outputType: '', outputQuantity: '', pricePerUnit: '' }); fetchData(); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    const totalOutput = logs.reduce((s, l) => s + (l.outputQuantity || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Production Logs</h1>
                    <p className="text-sm text-text-secondary mt-1">Total Output: <span className="font-bold text-primary">{totalOutput.toLocaleString()}</span></p>
                </div>
                <Button icon={Plus} onClick={() => setShowModal(true)}>Log Production</Button>
            </div>

            <DataCard title="All Production Entries" subtitle={`${logs.length} records`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : logs.length === 0 ? (
                    <EmptyState icon={Factory} title="No Logs" description="Start logging production entries." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border-light">
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Raw Input</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Output Type</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantity</th>
                                <th className="text-left py-3 px-4 text-text-secondary font-medium">Date</th>
                            </tr></thead>
                            <tbody>{logs.map((l: any) => (
                                <tr key={l.id} className="border-b border-border-light last:border-0 hover:bg-surface transition-colors">
                                    <td className="py-3 px-4">{l.rawInput}</td>
                                    <td className="py-3 px-4 font-medium">{l.outputType}</td>
                                    <td className="py-3 px-4 text-primary font-bold">{l.outputQuantity}</td>
                                    <td className="py-3 px-4 text-text-muted">{l.date ? new Date(l.date).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </DataCard>

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Production Entry">
                <div className="space-y-4">
                    <Input label="Raw Material Input" name="rawInput" placeholder="e.g. Granite Blocks" value={form.rawInput} onChange={(e) => setForm({ ...form, rawInput: e.target.value })} required />
                    <Input label="Output Material Type" name="outputType" placeholder="e.g. Crushed Stone" value={form.outputType} onChange={(e) => setForm({ ...form, outputType: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Output Quantity" name="outputQuantity" type="number" placeholder="500" value={form.outputQuantity} onChange={(e) => setForm({ ...form, outputQuantity: e.target.value })} required />
                        <Input label="Price Per Unit (₹)" name="pricePerUnit" type="number" placeholder="50" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitLoading}>Log Entry</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
