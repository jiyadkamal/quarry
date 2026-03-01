import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'operator' || !session.operatorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { materialType, quantity } = await request.json();
        if (!materialType || quantity === undefined) {
            return NextResponse.json({ error: 'Material type and quantity are required' }, { status: 400 });
        }

        const stockQuery = db.collection('stock')
            .where('operatorId', '==', session.operatorId)
            .where('materialType', '==', materialType)
            .limit(1);

        const stockSnapshot = await stockQuery.get();

        if (stockSnapshot.empty) {
            await db.collection('stock').add({
                operatorId: session.operatorId,
                materialType,
                quantity,
                lastUpdated: new Date().toISOString(),
            });
        } else {
            await stockSnapshot.docs[0].ref.update({
                quantity,
                lastUpdated: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update stock error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
