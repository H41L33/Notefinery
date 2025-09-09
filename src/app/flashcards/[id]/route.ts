import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const flashcardSet = await prisma.flashcardSet.findFirst({
            where: {
                id: params.id,
                userId: user.id
            },
            include: {
                flashcards: true
            }
        });

        if (!flashcardSet) {
            return NextResponse.json({ error: 'Flashcard set not found' }, { status: 404 });
        }

        return NextResponse.json(flashcardSet);
    } catch (error) {
        console.error('Failed to fetch flashcard set:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
