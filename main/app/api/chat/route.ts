import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = (process.env.HF_TOKEN || '').trim();

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in server configuration" }, { status: 500 });
    }

    // Using the Hugging Face standard Messages API for DeepSeek
    const response = await fetch("https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Llama-8B/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
        messages: [
          {
            role: "system",
            content: "You are SecuWear Auxilink, an expert in Philippine disaster survival. Provide hotlines like 911, PNP (117), BFP (02-8426-0219), NDRRMC (02-8911-5061), Red Cross (143), and DOH (1555)."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
        stream: true, 
      }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const parsedError = JSON.parse(errorText);
        return NextResponse.json(parsedError, { status: response.status });
      } catch {
        return NextResponse.json({ error: `HF API Error: ${errorText}` }, { status: response.status });
      }
    }

    return new Response(response.body, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error("Critical Backend Error:", error.message);
    const errorMessage = error.message === 'fetch failed' 
      ? 'Connection dropped: The AI model is taking too long to wake up. Please try again in 30 seconds.' 
      : error.message;

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
