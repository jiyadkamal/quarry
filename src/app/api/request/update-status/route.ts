import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

const VALID_STAGES = ['mining', 'crushing', 'powdering', 'packing', 'completed'];

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId, stage, comment } = await request.json();

        if (!requestId || !stage || !VALID_STAGES.includes(stage)) {
            return NextResponse.json({
                error: `Valid request ID and stage are required. Stages: ${VALID_STAGES.join(', ')}`
            }, { status: 400 });
        }

        const requestRef = db.collection('dispatchRequests').doc(requestId);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const requestData = requestSnapshot.data()!;

        // Only allow updates on accepted/in-progress orders
        if (requestData.status === 'pending' || requestData.status === 'rejected') {
            return NextResponse.json({ error: 'Request must be accepted before updating status' }, { status: 400 });
        }

        // Operator can only update their own requests
        if (session.role === 'operator' && requestData.operatorId !== session.operatorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const historyEntry: any = {
            stage,
            timestamp: new Date().toISOString(),
            updatedBy: session.email,
        };
        if (comment && comment.trim()) {
            historyEntry.comment = comment.trim();
        }

        const existingHistory = requestData.statusHistory || [];

        await requestRef.update({
            currentStage: stage,
            status: stage === 'completed' ? 'completed' : 'in-progress',
            statusHistory: [...existingHistory, historyEntry],
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, currentStage: stage });
    } catch (error: any) {
        console.error('Update status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
