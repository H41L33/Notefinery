import OpenAI from 'openai';

// Perplexity configuration
export const perplexityConfig = {
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
    defaultModel: 'sonar-pro', // Best model for search-augmented generation
    maxTokens: 3000,
    temperature: 0.3, // Lower temperature for educational content
};

// Available Perplexity models for different use cases
export const PERPLEXITY_MODELS = {
    // Search-augmented models (recommended for flashcards)
    'sonar-pro': 'Advanced search capabilities with comprehensive answers',
    'sonar-small': 'Efficient model for simpler queries',
    'sonar-medium': 'Balanced performance for moderate complexity',

    // Traditional language models
    'mistral-7b-instruct': 'Balanced model for various tasks',
    'codellama-34b-instruct': 'Specialized for code-related content',
    'llama-2-70b-chat': 'Large model with broad knowledge capabilities',
} as const;

export type PerplexityModel = keyof typeof PERPLEXITY_MODELS;

// Create configured Perplexity client
export function createPerplexityClient(config?: Partial<typeof perplexityConfig>) {
    return new OpenAI({
        apiKey: config?.apiKey || perplexityConfig.apiKey,
        baseURL: config?.baseURL || perplexityConfig.baseURL,
    });
}

// Enhanced flashcard generation with Perplexity's search capabilities
export async function generateFlashcardsWithSearch(
    content: string,
    options?: {
        model?: PerplexityModel;
        searchDomains?: string[];
        recencyFilter?: 'hour' | 'day' | 'week' | 'month' | 'year';
        maxCards?: number;
    }
) {
    const client = createPerplexityClient();

    const model = options?.model || 'sonar-pro';
    const maxCards = options?.maxCards || 15;
    const searchDomains = options?.searchDomains || ['edu', 'gov', 'org'];
    const recencyFilter = options?.recencyFilter || 'month';

    return await client.chat.completions.create({
        model,
        messages: [
            {
                role: "system",
                content: `You are an expert educational content creator with access to real-time information. Create comprehensive study flashcards that:
        1. Cover key concepts, definitions, and facts
        2. Include current, verified information when relevant
        3. Test both recall and understanding
        4. Are appropriate for serious studying
        5. Return valid JSON format with 'question' and 'answer' fields only`
            },
            {
                role: "user",
                content: `Create ${maxCards} high-quality flashcards from this content. Use your search capabilities to verify facts and enhance accuracy:\n\n${content}\n\nReturn only a JSON array of flashcard objects.`
            }
        ],
        temperature: perplexityConfig.temperature,
        max_tokens: perplexityConfig.maxTokens,
    });
}
