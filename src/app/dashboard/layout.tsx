import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // Fetch user data for sidebar
    return (
        <DashboardShell
            role={session.role}
            userName={session.email.split('@')[0]}
            userEmail={session.email}
            operatorId={session.operatorId}
        >
            {children}
        </DashboardShell>
    );
}
