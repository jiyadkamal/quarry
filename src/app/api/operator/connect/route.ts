import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession, signJWT } from '@/lib/auth';

const COOKIE_NAME = process.env.COOKIE_NAME || 'quarryms_auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'transport') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { operatorId } = await request.json();
        if (!operatorId) {
            return NextResponse.json({ error: 'Operator ID is required' }, { status: 400 });
        }

        // Verify operator exists
        const operatorSnapshot = await db.collection('users')
            .where('role', '==', 'operator')
            .where('operatorId', '==', operatorId)
            .limit(1)
            .get();

        if (operatorSnapshot.empty) {
            return NextResponse.json({ error: 'Invalid Operator ID' }, { status: 404 });
        }

        // Update user in Firestore
        await db.collection('users').doc(session.userId).update({
            connectedOperatorId: operatorId
        });

        // Create new JWT with connectedOperatorId
        const newToken = await signJWT({
            ...session,
            connectedOperatorId: operatorId
        });

        // Set cookie via NextResponse headers (works in API routes)
        const response = NextResponse.json({ success: true, connectedOperatorId: operatorId });
        response.cookies.set(COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Operator connection error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
