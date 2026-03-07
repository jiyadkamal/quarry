import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'transport') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Always read connectedOperatorId from Firestore (not JWT) 
        const userDoc = await db.collection('users').doc(session.userId).get();
        const connectedOperatorId = userDoc.exists ? userDoc.data()?.connectedOperatorId : null;

        if (!connectedOperatorId) {
            return NextResponse.json({ error: 'You must be connected to an operator first' }, { status: 401 });
        }

        const { materialType, quantity } = await request.json();
        if (!materialType || !quantity || quantity <= 0) {
            return NextResponse.json({ error: 'Material type and valid quantity are required' }, { status: 400 });
        }

        // Check stock
        const stockSnapshot = await db.collection('stock')
            .where('operatorId', '==', connectedOperatorId)
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

        const pricePerUnit = stockData.pricePerUnit || 0;
        const totalPrice = pricePerUnit * quantity;

        // Create request
        const newRequest = {
            operatorId: connectedOperatorId,
            requestedBy: session.userId,
            requestedByEmail: session.email,
            materialType,
            quantity,
            pricePerUnit,
            totalPrice,
            status: 'pending',
            currentStage: 'pending',
            paymentStatus: 'unpaid',
            statusHistory: [],
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
