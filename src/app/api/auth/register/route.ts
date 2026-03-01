import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (role === 'admin') {
            return NextResponse.json({ error: 'Admin registration is not allowed' }, { status: 403 });
        }

        // Check if user already exists
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!userSnapshot.empty) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: any = {
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString(),
        };

        if (role === 'operator') {
            // Auto-generate human-readable Operator ID
            // The countSnapshot is no longer used for ID generation, but kept as per user's provided edit.
            const countSnapshot = await db.collection('users').where('role', '==', 'operator').get();
            newUser.operatorId = `OP-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
        }

        const docRef = await db.collection('users').add(newUser);

        return NextResponse.json({
            id: docRef.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            operatorId: newUser.operatorId,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
