import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'transport') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId } = await request.json();
        if (!requestId) {
            return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
        }

        const requestRef = db.collection('dispatchRequests').doc(requestId);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const requestData = requestSnapshot.data()!;

        // Only allow the requester to pay
        if (requestData.requestedBy !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow payment on accepted/in-progress orders
        if (requestData.status === 'pending' || requestData.status === 'rejected') {
            return NextResponse.json({ error: 'Request must be accepted before payment' }, { status: 400 });
        }

        if (requestData.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Already paid' }, { status: 400 });
        }

        await requestRef.update({
            paymentStatus: 'paid',
            paidAt: new Date().toISOString(),
            paymentMethod: 'dummy',
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        });

        return NextResponse.json({ success: true, message: 'Payment successful' });
    } catch (error: any) {
        console.error('Payment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
