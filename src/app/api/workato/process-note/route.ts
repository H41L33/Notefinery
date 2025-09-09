import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { noteId, content } = await request.json();

        // Workato webhook endpoint for processing notes
        const workatoResponse = await fetch(process.env.WORKATO_WEBHOOK_URL || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WORKATO_API_TOKEN}`
            },
            body: JSON.stringify({
                noteId,
                content,
                userId,
                timestamp: new Date().toISOString(),
                action: 'note_created'
            })
        });

        if (!workatoResponse.ok) {
            console.error('Workato integration failed:', await workatoResponse.text());
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Workato integration error:', error);
        return NextResponse.json({ error: 'Integration failed' }, { status: 500 });
    }
}
