import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const huggingface = createOpenAI({
  apiKey: process.env.HF_TOKEN,
  baseURL: 'https://api-inference.huggingface.co/v1/',
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message missing" }), { status: 400 });
    }

    const result = await streamText({
      model: huggingface('HuggingFaceH4/zephyr-7b-beta'),
      messages: [
        { role: 'system', content: 'You are an emergency response expert for the Philippines. Provide hotlines like 911, PNP (117), BFP (02-8426-0219), NDRRMC (02-8911-5061), Red Cross (143), and DOH (1555) when asked.' },
        { role: 'user', content: message }
      ],
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    // This will catch the error and send it to the frontend
    console.error("Backend Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
