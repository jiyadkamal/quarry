import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'transport' || !session.connectedOperatorId) {
            return NextResponse.json({ error: 'Unauthorized or not connected to an operator' }, { status: 401 });
        }

        const { materialType, quantity } = await request.json();
        if (!materialType || !quantity || quantity <= 0) {
            return NextResponse.json({ error: 'Material type and valid quantity are required' }, { status: 400 });
        }

        // Check stock
        const stockSnapshot = await db.collection('stock')
            .where('operatorId', '==', session.connectedOperatorId)
            .where('materialType', '==', materialType)
            .limit(1)
            .get();

        if (stockSnapshot.empty) {
            return NextResponse.json({ error: 'Material not available in stock' }, { status: 404 });
        }

        const stockData = stockSnapshot.docs[0].data();
        if (stockData.quantity < quantity) {
            return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
        }

        // Create request
        const newRequest = {
            operatorId: session.connectedOperatorId,
            requestedBy: session.userId,
            materialType,
            quantity,
            status: 'pending',
            date: new Date().toISOString(),
        };

        const docRef = await db.collection('dispatchRequests').add(newRequest);

        return NextResponse.json({
            success: true,
            requestId: docRef.id,
            request: newRequest
        });
    } catch (error: any) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
