'use client';

import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { DataCard, StatusBadge } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OperatorMachinesPage() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/operator/machine-status', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) { setStatus(newStatus); toast.success(`Machine status: ${newStatus}`); }
            else { const d = await res.json(); toast.error(d.error); }
        } catch { toast.error('Failed'); } finally { setLoading(false); }
    };

    const statuses = [
        { value: 'Running', desc: 'Machine is operational and producing', icon: '🟢', color: 'border-success bg-success-light' },
        { value: 'Stopped', desc: 'Machine is not running', icon: '🔴', color: 'border-danger bg-danger-light' },
        { value: 'Maintenance', desc: 'Machine is under maintenance', icon: '🟡', color: 'border-warning bg-warning-light' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Machine Status</h1>
                <p className="text-sm text-text-secondary mt-1">Update your machine&apos;s current operating status</p>
            </div>

            {status && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-light border border-sky">
                    <span className="text-sm font-medium text-primary">Current Status:</span>
                    <StatusBadge status={status} />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {statuses.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => handleUpdate(s.value)}
                        disabled={loading}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 card-hover ${status === s.value ? s.color : 'border-border-light bg-surface-card hover:border-secondary'
                            }`}
                    >
                        <div className="text-3xl mb-3">{s.icon}</div>
                        <h3 className="text-lg font-bold text-text-primary">{s.value}</h3>
                        <p className="text-sm text-text-secondary mt-1">{s.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
