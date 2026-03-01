'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { DataCard, Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function TransportConnectPage() {
    const [operatorId, setOperatorId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        if (!operatorId.trim()) { toast.error('Enter an Operator ID'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/operator/connect', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operatorId: operatorId.trim() }),
            });
            const d = await res.json();
            if (res.ok) { toast.success(`Connected to ${operatorId}!`); window.location.href = '/dashboard/transport'; }
            else toast.error(d.error);
        } catch { toast.error('Failed'); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Connect to Operator</h1>
                <p className="text-sm text-text-secondary mt-1">Enter an Operator ID to link your account</p>
            </div>

            <DataCard title="Operator Connection" subtitle="Link to an operator to access their stock and submit requests">
                <div className="max-w-md mx-auto text-center py-8">
                    <div className="w-20 h-20 rounded-2xl bg-sky-light flex items-center justify-center mx-auto mb-6">
                        <Link2 className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="text-sm text-text-secondary mb-6">
                        Ask your operator for their unique Operator ID (e.g., OP-001). You can only be connected to one operator at a time.
                    </p>
                    <div className="flex gap-3 max-w-sm mx-auto">
                        <input
                            type="text"
                            placeholder="e.g. OP-001"
                            value={operatorId}
                            onChange={(e) => setOperatorId(e.target.value.toUpperCase())}
                            className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-center font-mono text-lg uppercase outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                        />
                        <Button onClick={handleConnect} loading={loading} size="lg">Connect</Button>
                    </div>
                </div>
            </DataCard>
        </div>
    );
}
