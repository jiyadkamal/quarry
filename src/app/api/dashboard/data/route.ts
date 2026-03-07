import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // For transport users, always check Firestore for the latest connectedOperatorId
        let connectedOperatorId = session.connectedOperatorId;
        if (session.role === 'transport') {
            const userDoc = await db.collection('users').doc(session.userId).get();
            if (userDoc.exists) {
                connectedOperatorId = userDoc.data()?.connectedOperatorId || null;
            }
        }

        // Filtering based on role
        const isAdmin = session.role === 'admin';
        const operatorId = session.role === 'operator' ? session.operatorId : connectedOperatorId;

        // Users (admin only)
        let users: any[] = [];
        if (isAdmin) {
            const usersSnap = await db.collection('users').get();
            users = usersSnap.docs.map(d => ({ id: d.id, ...d.data(), password: undefined }));
        }

        // Stock — transport users without a connected operator see nothing
        let stock: any[] = [];
        if (isAdmin) {
            const stockSnap = await db.collection('stock').get();
            stock = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else if (operatorId) {
            const stockSnap = await db.collection('stock').where('operatorId', '==', operatorId).get();
            stock = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        // Production logs
        let productionLogs: any[] = [];
        if (isAdmin) {
            const prodSnap = await db.collection('productionLogs').get();
            productionLogs = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else if (operatorId) {
            const prodSnap = await db.collection('productionLogs').where('operatorId', '==', operatorId).get();
            productionLogs = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        // Dispatch requests
        let reqQuery: FirebaseFirestore.Query = db.collection('dispatchRequests');
        if (session.role === 'operator' && operatorId) {
            reqQuery = reqQuery.where('operatorId', '==', operatorId);
        } else if (session.role === 'transport') {
            reqQuery = reqQuery.where('requestedBy', '==', session.userId);
        }
        const reqSnap = await reqQuery.get();
        const requests = reqSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Connected users (for operator)
        let connectedUsers: any[] = [];
        if (session.role === 'operator' && operatorId) {
            const connSnap = await db.collection('users')
                .where('connectedOperatorId', '==', operatorId)
                .get();
            connectedUsers = connSnap.docs.map(d => ({ id: d.id, ...d.data(), password: undefined }));
        }

        // Include user info with live connectedOperatorId
        const user = {
            userId: session.userId,
            email: session.email,
            role: session.role,
            operatorId: session.operatorId,
            connectedOperatorId: connectedOperatorId,
        };

        return NextResponse.json({ users, stock, productionLogs, requests, connectedUsers, user });
    } catch (error: any) {
        console.error('Dashboard data error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
