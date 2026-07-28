import { NextResponse } from 'next/server';

// Ensure Next.js doesn't try to statically cache this streaming route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing" }, { status: 500 });
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Safely attempt to parse HF errors (like the 503 Loading error) to pass back to the frontend
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
    console.error("Critical Backend Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
