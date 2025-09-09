'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Flashcard {
    id: string;
    question: string;
    answer: string;
}

interface FlashcardSet {
    id: string;
    title: string;
    flashcards: Flashcard[];
}

export default function FlashcardsPage() {
    const params = useParams();
    const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlashcards();
    }, [params.id]);

    const fetchFlashcards = async () => {
        try {
            const response = await fetch(`/api/flashcards/${params.id}`);
            const data = await response.json();
            setFlashcardSet(data);
        } catch (error) {
            console.error('Failed to fetch flashcards:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % (flashcardSet?.flashcards.length || 1));
    };

    const prevCard = () => {
        setIsFlipped(false);
        setCurrentIndex(prev =>
            prev === 0 ? (flashcardSet?.flashcards.length || 1) - 1 : prev - 1
        );
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (!flashcardSet) return <div className="flex justify-center items-center min-h-screen">Flashcard set not found</div>;

    const currentCard = flashcardSet.flashcards[currentIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {flashcardSet.title}
                </h1>

                <div className="text-center mb-4 text-gray-600">
                    {currentIndex + 1} / {flashcardSet.flashcards.length}
                </div>

                <div className="flex justify-center mb-8">
                    <motion.div
                        className="relative w-96 h-64 cursor-pointer perspective-1000"
                        onClick={() => setIsFlipped(!isFlipped)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            className="w-full h-full absolute transform-style-preserve-3d"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Front of card (Question) */}
                            <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg border-2 border-blue-200 flex items-center justify-center p-6">
                                <p className="text-lg text-gray-800 text-center font-medium">
                                    {currentCard.question}
                                </p>
                            </div>

                            {/* Back of card (Answer) */}
                            <div className="absolute w-full h-full backface-hidden bg-blue-500 rounded-xl shadow-lg flex items-center justify-center p-6 rotate-y-180">
                                <p className="text-lg text-white text-center">
                                    {currentCard.answer}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={prevCard}
                        disabled={flashcardSet.flashcards.length <= 1}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        {isFlipped ? 'Show Question' : 'Show Answer'}
                    </button>

                    <button
                        onClick={nextCard}
                        disabled={flashcardSet.flashcards.length <= 1}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
