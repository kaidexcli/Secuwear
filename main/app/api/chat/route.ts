import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const huggingface = createOpenAI({
  apiKey: process.env.HF_TOKEN,
  baseURL: 'https://api-inference.huggingface.co/v1/',
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const result = await streamText({
    model: huggingface('HuggingFaceH4/zephyr-7b-beta'),
    messages: [
        { role: 'system', content: 'You are an emergency response expert for the Philippines.' },
        { role: 'user', content: message }
    ],
  });

  return result.toDataStreamResponse();
}
