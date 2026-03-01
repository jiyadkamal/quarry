import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        // Check if admin already exists
        const existing = await db.collection('users').where('email', '==', 'admin@gmail.com').limit(1).get();
        if (!existing.empty) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.collection('users').add({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ message: 'Admin account created successfully' });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
