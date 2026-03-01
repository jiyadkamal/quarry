import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'operator')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId, status } = await request.json();
        if (!requestId || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Valid request ID and status are required' }, { status: 400 });
        }

        const requestRef = db.collection('dispatchRequests').doc(requestId);
        const requestSnapshot = await requestRef.get();

        if (!requestSnapshot.exists) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const requestData = requestSnapshot.data()!;
        if (requestData.status !== 'pending') {
            return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
        }

        // Role check: Operator can only approve for their own operatorId
        if (session.role === 'operator' && requestData.operatorId !== session.operatorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (status === 'rejected') {
            await requestRef.update({
                status: 'rejected',
                currentStage: 'rejected',
                statusHistory: [{
                    stage: 'rejected',
                    timestamp: new Date().toISOString(),
                    updatedBy: session.email,
                }],
                updatedAt: new Date().toISOString(),
            });
            return NextResponse.json({ success: true, status: 'rejected' });
        }

        // Use transaction for approval to update stock
        const result = await db.runTransaction(async (transaction) => {
            const stockQuery = db.collection('stock')
                .where('operatorId', '==', requestData.operatorId)
                .where('materialType', '==', requestData.materialType)
                .limit(1);

            const stockSnapshot = await transaction.get(stockQuery);

            if (stockSnapshot.empty) {
                throw new Error('Material not available in stock');
            }

            const stockDoc = stockSnapshot.docs[0];
            const stockData = stockDoc.data();

            if (stockData.quantity < requestData.quantity) {
                throw new Error('Insufficient stock for approval');
            }

            // Update request status with initial history
            transaction.update(requestRef, {
                status: 'accepted',
                currentStage: 'accepted',
                statusHistory: [{
                    stage: 'accepted',
                    timestamp: new Date().toISOString(),
                    updatedBy: session.email,
                    comment: 'Order accepted and processing started',
                }],
                updatedAt: new Date().toISOString(),
            });

            // Update stock quantity
            transaction.update(stockDoc.ref, {
                quantity: admin.firestore.FieldValue.increment(-requestData.quantity),
                lastUpdated: new Date().toISOString()
            });

            return { success: true };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Approve request error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
