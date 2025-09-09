import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize Perplexity client using OpenAI-compatible interface
const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai', // Perplexity's API endpoint
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { notes } = await request.json();
        const combinedContent = notes.join('\n\n');

        // Generate flashcards using Perplexity's Sonar model with real-time search
        const completion = await perplexity.chat.completions.create({
            model: "sonar-pro", // Use Perplexity's flagship search-augmented model
            messages: [
                {
                    role: "system",
                    content: "You are an expert educational content creator specializing in creating comprehensive flashcards for studying. Generate flashcards in JSON format with 'question' and 'answer' fields. Use your real-time search capabilities to enhance content accuracy and provide up-to-date information when relevant. Create thorough flashcards that cover key concepts, definitions, facts, and important details from the provided notes. Include follow-up questions that test deeper understanding."
                },
                {
                    role: "user",
                    content: `Create comprehensive flashcards from the following study notes. Use your search capabilities to verify facts and enhance the content with current, accurate information where applicable:\n\n${combinedContent}\n\nGenerate between 8-20 flashcards depending on content complexity. Return only a valid JSON array with objects containing 'question' and 'answer' fields. Ensure questions test both recall and understanding, and answers are clear and informative.`
                }
            ],
            temperature: 0.3, // Lower temperature for more consistent educational content
            max_tokens: 3000, // Increased token limit for comprehensive flashcards
            // Perplexity-specific parameters for enhanced search capabilities
            search_domain_filter: ["edu", "gov", "org"], // Focus on educational and authoritative sources
            search_recency_filter: "month", // Use recent information when relevant
            return_citations: true, // Include citations for factual information
            return_related_questions: false // Don't include related questions in the response
        });

        let flashcards;
        try {
            const responseContent = completion.choices[0].message.content || '[]';

            // Clean the response to ensure it's valid JSON
            const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
            const jsonString = jsonMatch ? jsonMatch[0] : responseContent;

            flashcards = JSON.parse(jsonString);

            // Validate that we have an array of objects with question and answer
            if (!Array.isArray(flashcards) || flashcards.length === 0) {
                throw new Error('Invalid flashcards format');
            }

            // Ensure each flashcard has required fields
            flashcards = flashcards.filter(card =>
                card.question && card.answer &&
                typeof card.question === 'string' &&
                typeof card.answer === 'string'
            );

            if (flashcards.length === 0) {
                throw new Error('No valid flashcards generated');
            }

        } catch (parseError) {
            console.error('Failed to parse Perplexity response:', parseError);
            console.error('Raw response:', completion.choices[0].message.content);

            // Fallback: Try to extract flashcards from a more conversational response
            const responseContent = completion.choices[0].message.content || '';
            flashcards = extractFlashcardsFromText(responseContent);

            if (flashcards.length === 0) {
                return NextResponse.json({
                    error: 'Failed to generate flashcards. Please try again with more specific notes.'
                }, { status: 500 });
            }
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create flashcard set with enhanced title
        const currentDate = new Date().toLocaleDateString();
        const topicHint = extractMainTopic(combinedContent);
        const setTitle = topicHint
            ? `${topicHint} - Study Set (${currentDate})`
            : `AI-Generated Study Set - ${currentDate}`;

        const flashcardSet = await prisma.flashcardSet.create({
            data: {
                title: setTitle,
                userId: user.id,
                flashcards: {
                    create: flashcards.map((card: { question: string; answer: string }) => ({
                        question: card.question.trim(),
                        answer: card.answer.trim()
                    }))
                }
            },
            include: { flashcards: true }
        });

        return NextResponse.json({
            setId: flashcardSet.id,
            flashcards: flashcardSet.flashcards,
            title: flashcardSet.title,
            totalCards: flashcardSet.flashcards.length
        });

    } catch (error) {
        console.error('Failed to generate flashcards with Perplexity:', error);

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return NextResponse.json({
                    error: 'API configuration error. Please check your Perplexity API key.'
                }, { status: 500 });
            }
            if (error.message.includes('rate limit')) {
                return NextResponse.json({
                    error: 'Rate limit exceeded. Please try again in a moment.'
                }, { status: 429 });
            }
        }

        return NextResponse.json({
            error: 'Failed to generate flashcards. Please try again.'
        }, { status: 500 });
    }
}

// Helper function to extract flashcards from conversational text
function extractFlashcardsFromText(text: string): { question: string; answer: string }[] {
    const flashcards: { question: string; answer: string }[] = [];

    // Try to find Q&A patterns in the text
    const qaPatterns = [
        /(?:Question|Q):\s*(.+?)(?:Answer|A):\s*(.+?)(?=(?:Question|Q):|$)/gis,
        /\d+\.\s*(.+?)\?\s*(?:Answer|A):\s*(.+?)(?=\d+\.|$)/gis,
        /\*\*(.+?)\*\*\s*(.+?)(?=\*\*|$)/gis
    ];

    for (const pattern of qaPatterns) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
            if (match[1] && match[2]) {
                flashcards.push({
                    question: match[1].trim(),
                    answer: match[2].trim()
                });
            }
        }
        if (flashcards.length > 0) break;
    }

    return flashcards;
}

// Helper function to extract main topic from notes
function extractMainTopic(content: string): string {
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);

    const significantWords = words
        .filter(word => word.length > 3 && !commonWords.has(word))
        .slice(0, 20);

    if (significantWords.length > 0) {
        return significantWords[0].charAt(0).toUpperCase() + significantWords[0].slice(1);
    }

    return '';
}
