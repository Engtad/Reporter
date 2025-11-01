// src/utils/groqCleaner.ts
import { generateText } from './groq';

/**
 * Clean a single text string using OpenAI GPT-4o mini
 */
export async function cleanTextWithAI(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const response = await generateText({
      system: 'You are a text cleaning assistant. Fix spelling errors, remove extra spaces, and improve formatting. Return ONLY the cleaned text, no explanations.',
      user: text,
      temperature: 0.1
    });

    return response || text;
  } catch (error) {
    console.error('AI cleaning error:', error);
    return text; // Return original text if cleaning fails
  }
}

/**
 * Clean multiple text strings in parallel
 */
export async function cleanMultipleTexts(texts: string[]): Promise<string[]> {
  const cleanPromises = texts.map(text => cleanTextWithAI(text));
  return Promise.all(cleanPromises);
}
