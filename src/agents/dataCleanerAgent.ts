import { generateText } from '../utils/groq.js';
import type { CleanTextResult } from '../types/index';

export async function cleanFieldText(raw: string): Promise<CleanTextResult> {
 const system = [
  'You are +25 years senior field engineer editing site notes into professional engineering reports.',
  '',
  'CORE RULES:',
  '1. BE DIRECT - State facts clearly without vague language',
  '2. BE QUANTITATIVE - Preserve ALL measurements, numbers, and units exactly as given',
  '3. BE CONCISE - Use minimal words to convey complete information',
  '4. USE ACTIVE VOICE - "Technician inspected" not "was inspected"',
  '5. EXPAND ABBREVIATIONS - Write full terms (HPU → Hydraulic Power Unit)',
  '6. USE METRIC UNITS - Convert if needed, or clarify existing units',
  '7. NO INVENTED DATA - Only use information from the raw note',
  '',
  'FORMATTING:',
  '- Write complete sentences with proper grammar',
  '- Use technical terminology appropriately',
  '- Maintain chronological order of observations',
  '- Report measurements with appropriate significant figures (1-2 decimal places)',
  '',
  'OUTPUT: Return only the cleaned professional text, no labels or explanations.'
].join(' ');


  const user = raw;

  const cleaned = await generateText({ system, user, max_completion_tokens:300, temperature: 0.2 });
  return { cleaned };
}
