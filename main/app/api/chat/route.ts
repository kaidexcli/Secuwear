import { NextResponse } from 'next/server';

// 1. CRITICAL FOR VERCEL: Switch to Edge runtime to prevent the 10-second timeout kill switch
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 2. Clean the token to strip any accidental spaces or newlines from Vercel settings
    const hfToken = (process.env.HF_TOKEN || '').trim();

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in server configuration" }, { status: 500 });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<|system|>\nYou are SecuWear Auxilink, an expert in Philippine disaster survival. Provide hotlines like 911, PNP (117), BFP (02-8426-0219), NDRRMC (02-8911-5061), Red Cross (143), and DOH (1555).</s>\n<|user|>\n${message}</s>\n<|assistant|>\n`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.95,
          return_full_text: false,
        },
        stream: true, 
      }),
      // Prevents aggressive caching in Next.js which can sometimes trigger fetch failures
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
    
    // Provide a more helpful error to the frontend if it still fails
    const errorMessage = error.message === 'fetch failed' 
      ? 'Connection dropped: The AI model is taking too long to wake up. Please try again in 30 seconds.' 
      : error.message;

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
