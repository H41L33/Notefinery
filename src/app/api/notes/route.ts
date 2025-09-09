import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { notes: { orderBy: { createdAt: 'desc' } } }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ notes: user.notes });
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, position } = await request.json();

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            const { emailAddresses, firstName, lastName } = await request.json();
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: emailAddresses?.[0]?.emailAddress || '',
                    name: `${firstName || ''} ${lastName || ''}`.trim()
                }
            });
        }

        const note = await prisma.note.create({
            data: {
                content,
                position,
                userId: user.id
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('Failed to create note:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
