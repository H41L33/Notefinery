'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
    id: string;
    content: string;
    position: { x: number; y: number };
    createdAt: string;
}

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [notes, setNotes] = useState<Note[]>([]);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [user]);

    const fetchNotes = async () => {
        if (!user) return;

        try {
            const response = await fetch('/api/notes');
            const data = await response.json();
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !user) return;

        // Generate random position for animation
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const randomOffset = () => (Math.random() - 0.5) * 200;

        const position = {
            x: centerX + randomOffset(),
            y: centerY + randomOffset()
        };

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: inputValue,
                    position
                })
            });

            if (response.ok) {
                const newNote = await response.json();
                setNotes(prev => [...prev, newNote]);
                setInputValue('');

                // Trigger Workato workflow for note processing
                await fetch('/api/workato/process-note', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ noteId: newNote.id, content: inputValue })
                });
            }
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const generateFlashcards = async () => {
        if (notes.length === 0) return;

        try {
            const response = await fetch('/api/flashcards/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notes: notes.map(note => note.content)
                })
            });

            if (response.ok) {
                const result = await response.json();
                // Redirect to flashcards view or show success message
                window.location.href = `/flashcards/${result.setId}`;
            }
        } catch (error) {
            console.error('Failed to generate flashcards:', error);
        }
    };

    if (!isLoaded) return <div>Loading...</div>;
    if (!user) return <div>Please sign in</div>;

    return (
        <div ref={containerRef} className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Animated Notes */}
            <AnimatePresence>
                {notes.map((note) => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0, x: window.innerWidth / 2, y: window.innerHeight }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: note.position.x - window.innerWidth / 2,
                            y: note.position.y - window.innerHeight / 2
                        }}
                        transition={{
                            duration: 1.5,
                            ease: "easeOut",
                            delay: Math.random() * 0.5
                        }}
                        className="absolute bg-white rounded-lg shadow-md p-4 max-w-xs border-l-4 border-blue-500"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(${note.position.x - window.innerWidth / 2}px, ${note.position.y - window.innerHeight / 2}px)`
                        }}
                    >
                        <p className="text-gray-800 text-sm">{note.content}</p>
                        <small className="text-gray-500 text-xs">
                            {new Date(note.createdAt).toLocaleTimeString()}
                        </small>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Input Form */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter your note here..."
                        className="px-6 py-4 w-96 rounded-full border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-gray-700 shadow-lg"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="px-6 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                    >
                        Add Note
                    </button>
                </form>
            </div>

            {/* Generate Flashcards Button */}
            {notes.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={generateFlashcards}
                    className="fixed top-8 right-8 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg z-10"
                >
                    Generate Flashcards ({notes.length} notes)
                </motion.button>
            )}

            {/* User Info */}
            <div className="fixed top-8 left-8 z-10">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <p className="text-gray-800 font-medium">Welcome, {user.firstName}!</p>
                    <p className="text-gray-600 text-sm">{notes.length} notes collected</p>
                </div>
            </div>
        </div>
    );
}
