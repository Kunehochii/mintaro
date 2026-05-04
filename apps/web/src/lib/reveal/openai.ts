import OpenAI from 'openai';

const MAX_RETRIES = 3;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

function isTransient(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    const status = error.status;
    return status === 429 || (status !== undefined && status >= 500);
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('fetch failed')
    );
  }
  return false;
}

export async function generateImage(prompt: string): Promise<string> {
  const openai = getClient();

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('OpenAI returned no image URL');
      }

      return imageUrl;
    } catch (error) {
      lastError = error;
      if (!isTransient(error)) throw error;
      if (attempt < MAX_RETRIES) {
        const delay = 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
