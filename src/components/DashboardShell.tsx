'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

interface DashboardShellProps {
    role: 'admin' | 'operator' | 'transport';
    userName: string;
    userEmail: string;
    operatorId?: string;
    children: ReactNode;
}

export default function DashboardShell({ role, userName, userEmail, operatorId, children }: DashboardShellProps) {
    return (
        <div className="flex min-h-screen bg-surface">
            <Sidebar role={role} userName={userName} userEmail={userEmail} operatorId={operatorId} />
            <main className="flex-1 ml-[260px] transition-all duration-300">
                <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
