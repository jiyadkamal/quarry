import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import bcrypt from 'bcrypt';
import { signJWT, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (userSnapshot.empty) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const userData = userSnapshot.docs[0].data();
        const isValid = await bcrypt.compare(password, userData.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await signJWT({
            userId: userSnapshot.docs[0].id,
            email: userData.email,
            role: userData.role,
            operatorId: userData.operatorId,
            connectedOperatorId: userData.connectedOperatorId,
        });

        await setSessionCookie(token);

        return NextResponse.json({
            user: {
                id: userSnapshot.docs[0].id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                operatorId: userData.operatorId,
                connectedOperatorId: userData.connectedOperatorId,
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
