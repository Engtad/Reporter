import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY as string;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
}

export const openai = new OpenAI({ apiKey });

export async function generateText({
  system,
  user,
  temperature = 0.2
}: {
  system: string;
  user: string;
  temperature?: number;
  max_completion_tokens?: number;
}): Promise<string> {
  const model = 'gpt-4o-mini';

  const completion = await openai.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || '';
  return content.trim();
}
