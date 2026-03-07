'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, IndianRupee, ImagePlus } from 'lucide-react';
import { DataCard, EmptyState, Button, Modal, Input } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OperatorStockPage() {
    const [stock, setStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ materialType: '', quantity: '', pricePerUnit: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) setStock(d.stock || []);
        } catch { } finally { setLoading(false); }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be under 2MB');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            const body: any = {
                materialType: form.materialType,
                quantity: Number(form.quantity),
                pricePerUnit: form.pricePerUnit ? Number(form.pricePerUnit) : 0,
            };
            if (imagePreview) body.imageBase64 = imagePreview;

            const res = await fetch('/api/operator/update-stock', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                toast.success('Stock updated!');
                setShowModal(false);
                setForm({ materialType: '', quantity: '', pricePerUnit: '' });
                setImageFile(null);
                setImagePreview(null);
                fetchData();
            }
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
                            <div key={s.id} className="p-0 overflow-hidden rounded-2xl bg-surface border border-border-light group hover:border-primary/30 transition-all">
                                {s.imageBase64 ? (
                                    <div className="h-32 w-full overflow-hidden bg-gray-50 relative">
                                        <img src={s.imageBase64} alt={s.materialType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="h-32 w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                        <Package className="w-10 h-10 text-text-muted/40" />
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold">{s.materialType}</p>
                                        <Package className="w-4 h-4 text-text-muted" />
                                    </div>
                                    <p className="text-2xl font-bold text-primary">{s.quantity?.toLocaleString()}</p>
                                    <p className="text-sm font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {s.pricePerUnit?.toLocaleString() || 0} <span className="text-xs text-text-muted font-normal">/ unit</span>
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">{s.lastUpdated ? `Updated: ${new Date(s.lastUpdated).toLocaleDateString()}` : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Update Stock">
                <div className="space-y-4">
                    <Input label="Material Type" name="materialType" placeholder="e.g. Sand" value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Quantity" name="quantity" type="number" placeholder="1000" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                        <Input label="Price Per Unit (₹)" name="pricePerUnit" type="number" placeholder="e.g. 50" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Material Photo</label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20 relative group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                                    >Remove</button>
                                </div>
                            ) : (
                                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50">
                                    <ImagePlus className="w-6 h-6 text-text-muted mb-1" />
                                    <span className="text-[10px] text-text-muted font-medium">Upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                            <p className="text-xs text-text-muted flex-1">Upload a photo of this material (max 2MB).</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitLoading}>Update</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
