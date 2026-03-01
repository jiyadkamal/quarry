import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'operator' || !session.operatorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rawInput, outputType, outputQuantity, date } = await request.json();
        if (!rawInput || !outputType || !outputQuantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use transaction to log production and update stock
        await db.runTransaction(async (transaction) => {
            // 1. Create production log
            const logRef = db.collection('productionLogs').doc();
            transaction.set(logRef, {
                operatorId: session.operatorId,
                rawInput,
                outputType,
                outputQuantity,
                date: date || new Date().toISOString(),
            });

            // 2. Find/Update stock
            const stockQuery = db.collection('stock')
                .where('operatorId', '==', session.operatorId)
                .where('materialType', '==', outputType)
                .limit(1);

            const stockSnapshot = await transaction.get(stockQuery);

            if (stockSnapshot.empty) {
                // Create new stock doc if doesn't exist
                const newStockRef = db.collection('stock').doc();
                transaction.set(newStockRef, {
                    operatorId: session.operatorId,
                    materialType: outputType,
                    quantity: outputQuantity,
                    lastUpdated: new Date().toISOString(),
                });
            } else {
                // Update existing stock
                const stockDoc = stockSnapshot.docs[0];
                transaction.update(stockDoc.ref, {
                    quantity: admin.firestore.FieldValue.increment(outputQuantity),
                    lastUpdated: new Date().toISOString(),
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Log production error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
