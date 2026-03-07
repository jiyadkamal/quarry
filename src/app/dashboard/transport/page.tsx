'use client';

import { useEffect, useState } from 'react';
import { Link2, Truck, Package, ClipboardList, CheckCircle, MessageSquare, ArrowRight, IndianRupee, CreditCard, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { StatCard, DataCard, StatusBadge, EmptyState, Button, Modal, Select } from '@/components/ui';
import toast from 'react-hot-toast';

const STAGE_ORDER = ['pending', 'accepted', 'mining', 'crushing', 'powdering', 'packing', 'completed'];
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
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCurrent
                                    ? 'bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-primary/15'
                                    : isCompleted
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                                        : 'bg-white text-gray-400 border-2 border-gray-200'
                                    }`}
                            >
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
                        <div className={`pb-5 flex-1 ${isLast ? '' : ''}`}>
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

function PaymentModal({ request, open, onClose, onSuccess }: { request: any; open: boolean; onClose: () => void; onSuccess: () => void }) {
    const [step, setStep] = useState<'summary' | 'processing' | 'success'>('summary');

    useEffect(() => {
        if (open) setStep('summary');
    }, [open]);

    const handlePay = async () => {
        setStep('processing');
        // Simulate 2-second payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const res = await fetch('/api/request/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: request.id }),
            });
            if (res.ok) {
                setStep('success');
                setTimeout(() => {
                    onClose();
                    onSuccess();
                    toast.success('Payment successful!');
                }, 1500);
            } else {
                const d = await res.json();
                toast.error(d.error || 'Payment failed');
                setStep('summary');
            }
        } catch {
            toast.error('Payment failed');
            setStep('summary');
        }
    };

    if (!request) return null;

    return (
        <Modal open={open} onClose={step === 'processing' ? () => { } : onClose} title={step === 'success' ? '' : 'Complete Payment'}>
            {step === 'summary' && (
                <div className="space-y-5">
                    {/* Order Summary */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-border-light space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Order Summary</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Material</span>
                            <span className="font-semibold">{request.materialType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Quantity</span>
                            <span className="font-semibold">{request.quantity?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Price per unit</span>
                            <span className="font-semibold">₹{request.pricePerUnit?.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border-light pt-3 flex justify-between">
                            <span className="font-bold text-text-primary">Total Amount</span>
                            <span className="text-xl font-black text-primary">₹{request.totalPrice?.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment Method (Dummy) */}
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Demo Payment</p>
                                <p className="text-xs text-text-muted">Simulated payment processing</p>
                            </div>
                            <div className="ml-auto">
                                <div className="w-4 h-4 rounded-full border-4 border-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Shield className="w-3.5 h-3.5" />
                        <span>This is a demo payment — no real transaction will occur</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handlePay} icon={CreditCard}>Pay ₹{request.totalPrice?.toLocaleString()}</Button>
                    </div>
                </div>
            )}

            {step === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-text-primary">Processing Payment</p>
                        <p className="text-sm text-text-muted mt-1">Please wait while we process your payment...</p>
                    </div>
                    <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out_forwards]"
                            style={{ animation: 'progress 2s ease-in-out forwards' }} />
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-text-primary">Payment Successful!</p>
                        <p className="text-sm text-text-muted mt-1">₹{request.totalPrice?.toLocaleString()} paid for {request.materialType}</p>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default function TransportDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [connectForm, setConnectForm] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({ materialType: '', quantity: '' });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [payingRequest, setPayingRequest] = useState<any>(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard/data');
            const d = await res.json();
            if (res.ok) {
                setData(d);
                setConnected(d.user?.connectedOperatorId ? true : false);
            }
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleConnect = async () => {
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/operator/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operatorId: connectForm }),
            });
            const d = await res.json();
            if (res.ok) {
                toast.success(`Connected to operator ${connectForm}!`);
                setConnected(true);
                window.location.reload();
            } else { toast.error(d.error); }
        } catch { toast.error('Connection failed'); } finally { setSubmitLoading(false); }
    };

    const handleRequest = async () => {
        if (!requestForm.materialType || !requestForm.quantity) {
            toast.error('Please select a material and enter quantity');
            return;
        }
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/request/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialType: requestForm.materialType, quantity: Number(requestForm.quantity) }),
            });
            const d = await res.json();
            if (res.ok) {
                toast.success('Order placed successfully!');
                setShowRequestModal(false);
                setRequestForm({ materialType: '', quantity: '' });
                fetchData();
            } else { toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setSubmitLoading(false); }
    };

    if (loading) return <div className="space-y-6"><div className="skeleton h-8 w-48" /><div className="grid grid-cols-3 gap-5">{[1, 2, 3].map(i => <div key={i} className="skeleton h-32" />)}</div></div>;

    const pendingCount = data?.requests?.filter((r: any) => r.status === 'pending').length || 0;
    const inProgressCount = data?.requests?.filter((r: any) => ['accepted', 'in-progress'].includes(r.status)).length || 0;
    const completedCount = data?.requests?.filter((r: any) => r.status === 'completed').length || 0;

    const stockOptions = (data?.stock || []).map((s: any) => ({
        value: s.materialType,
        label: `${s.materialType} (${s.quantity?.toLocaleString()} available)`,
    }));

    const selectedStock = data?.stock?.find((s: any) => s.materialType === requestForm.materialType);
    const liveTotal = selectedStock?.pricePerUnit && requestForm.quantity ? selectedStock.pricePerUnit * Number(requestForm.quantity) : 0;

    return (
        <div className="space-y-6">
            {/* Progress bar animation keyframes */}
            <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Transport Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-1">Place orders and track their progress</p>
                </div>
                {connected && (
                    <Button icon={Truck} onClick={() => setShowRequestModal(true)}>Place Order</Button>
                )}
            </div>

            {/* Hero Section */}
            {connected && (
                <div className="relative h-48 rounded-3xl overflow-hidden mb-6 group">
                    <img src="/images/hero.png" alt="Quarry Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent z-10" />
                    <div className="relative z-20 h-full flex flex-col justify-center px-8">
                        <h2 className="text-3xl font-black text-white tracking-tight">Ready to Order?</h2>
                        <p className="text-sky/80 text-sm mt-2 max-w-sm">Browse available materials from your operator and place orders in seconds.</p>
                        <div className="mt-4">
                            <Button size="sm" icon={Truck} onClick={() => setShowRequestModal(true)}>Place New Order</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Card */}
            {!connected && (
                <div className="animate-fade-in">
                    <DataCard title="Connect to an Operator" subtitle="Enter an Operator ID to start placing orders">
                        <div className="max-w-md mx-auto text-center py-4">
                            <div className="w-20 h-20 rounded-2xl bg-sky-light flex items-center justify-center mx-auto mb-4">
                                <Link2 className="w-8 h-8 text-secondary" />
                            </div>
                            <p className="text-sm text-text-secondary mb-6">
                                You need to connect to an operator before you can view available materials or place orders.
                                Ask your operator for their Operator ID.
                            </p>
                            <div className="flex gap-3 max-w-xs mx-auto">
                                <input
                                    type="text"
                                    placeholder="e.g. OP-0000001"
                                    value={connectForm}
                                    onChange={(e) => setConnectForm(e.target.value.toUpperCase())}
                                    className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-mono text-center uppercase outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                                />
                                <Button onClick={handleConnect} loading={submitLoading}>Connect</Button>
                            </div>
                        </div>
                    </DataCard>
                </div>
            )}

            {/* Connected Content */}
            {connected && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 animate-fade-in">
                        <StatCard title="Available Materials" value={data?.stock?.length || 0} icon={Package} color="green" />
                        <StatCard title="Pending Orders" value={pendingCount} icon={ClipboardList} color="yellow" />
                        <StatCard title="In Progress" value={inProgressCount} icon={Truck} color="blue" />
                        <StatCard title="Completed" value={completedCount} icon={CheckCircle} color="purple" />
                    </div>

                    {/* Available Materials to Order */}
                    <DataCard title="Available Materials" subtitle="Click on a material to place an order">
                        {(!data?.stock || data.stock.length === 0) ? (
                            <EmptyState icon={Package} title="No Materials Available" description="Your connected operator has not listed any materials yet." />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.stock.map((s: any) => (
                                    <div
                                        key={s.id}
                                        className="p-0 overflow-hidden rounded-2xl bg-surface border border-border-light card-hover cursor-pointer group hover:border-primary/30"
                                        onClick={() => { setRequestForm({ materialType: s.materialType, quantity: '' }); setShowRequestModal(true); }}
                                    >
                                        {s.imageBase64 ? (
                                            <div className="h-36 w-full overflow-hidden bg-gray-50 relative">
                                                <img src={s.imageBase64} alt={s.materialType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            </div>
                                        ) : (
                                            <div className="h-36 w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                <Package className="w-12 h-12 text-text-muted/40" />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <p className="font-bold text-text-primary text-lg">{s.materialType}</p>
                                            <div className="flex items-end justify-between mt-2">
                                                <div>
                                                    <p className="text-2xl font-black text-primary">{s.quantity?.toLocaleString()}</p>
                                                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide">Available Units</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-0.5 mb-1">
                                                        <IndianRupee className="w-3.5 h-3.5" />{s.pricePerUnit?.toLocaleString() || 0}<span className="text-[10px] text-text-muted font-normal">/unit</span>
                                                    </p>
                                                    <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Order Now</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DataCard>

                    {/* My Orders */}
                    <DataCard title="My Orders" subtitle={`${data?.requests?.length || 0} total orders`}>
                        {(!data?.requests || data.requests.length === 0) ? (
                            <EmptyState icon={ClipboardList} title="No Orders Yet" description="Place your first order from the available materials above." />
                        ) : (
                            <div className="space-y-4">
                                {data.requests.map((r: any) => (
                                    <div key={r.id} className="p-5 rounded-2xl bg-surface border border-border-light">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-text-primary">{r.materialType}</p>
                                                <p className="text-sm text-text-secondary">Quantity: <span className="font-bold text-primary">{r.quantity}</span></p>
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
                                                {/* Payment badge */}
                                                {r.status !== 'pending' && r.status !== 'rejected' && (
                                                    r.paymentStatus === 'paid' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                            <CheckCircle2 className="w-3 h-3" /> Paid
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setPayingRequest(r)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5" /> Pay ₹{r.totalPrice?.toLocaleString()}
                                                        </button>
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
                </>
            )}

            {/* Place Order Modal */}
            <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Place Order">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                            Select Material <span className="text-danger">*</span>
                        </label>
                        <select
                            value={requestForm.materialType}
                            onChange={(e) => setRequestForm({ ...requestForm, materialType: e.target.value })}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                            <option value="">— Choose a material —</option>
                            {stockOptions.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                            value={requestForm.quantity}
                            onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                            min={1}
                            max={selectedStock?.quantity || undefined}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {selectedStock && (
                            <p className="text-xs text-text-muted mt-1">Max available: <span className="font-bold text-primary">{selectedStock.quantity?.toLocaleString()}</span></p>
                        )}
                    </div>

                    {/* Live Price Calculation */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex justify-between text-sm text-emerald-700">
                            <span>Price per unit</span>
                            <span className="font-semibold">₹{selectedStock?.pricePerUnit?.toLocaleString() || 0}</span>
                        </div>
                        {liveTotal >= 0 && (
                            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-emerald-200">
                                <span className="font-bold text-emerald-800">Total Amount</span>
                                <span className="text-lg font-black text-emerald-700">₹{liveTotal.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                        <Button onClick={handleRequest} loading={submitLoading}>Place Order</Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            <PaymentModal
                request={payingRequest}
                open={!!payingRequest}
                onClose={() => setPayingRequest(null)}
                onSuccess={() => { setPayingRequest(null); fetchData(); }}
            />
        </div>
    );
}
