'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { DataCard, EmptyState } from '@/components/ui';

export default function OperatorConnectionsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/dashboard/data');
                const d = await res.json();
                if (res.ok) setUsers(d.connectedUsers || []);
            } catch { } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Connected Users</h1>
                <p className="text-sm text-text-secondary mt-1">Transport users connected to your Operator ID</p>
            </div>

            <DataCard title="Connected Transport Users" subtitle={`${users.length} users`}>
                {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div> : users.length === 0 ? (
                    <EmptyState icon={Users} title="No Connections" description="No transport users have connected to your Operator ID yet." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map((u: any) => (
                            <div key={u.id} className="p-5 rounded-2xl bg-surface border border-border-light card-hover">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-lg">
                                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{u.name}</p>
                                        <p className="text-sm text-text-secondary">{u.email}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-text-muted">Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </DataCard>
        </div>
    );
}
