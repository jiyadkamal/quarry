import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'operator' || !session.operatorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status } = await request.json();
        if (!['Running', 'Stopped', 'Maintenance'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await db.collection('users').doc(session.userId).update({
            machineStatus: status,
            machineStatusUpdatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error('Update machine status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
