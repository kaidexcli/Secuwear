import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json({ error: 'Message payload is required' }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN?.trim();

    if (!hfToken) {
      return NextResponse.json({ error: "Configuration Error: HF_TOKEN is missing." }, { status: 500 });
    }

    // THE FETCH: No system prompt, no persona, just the user's raw message
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "user", content: message } // Only the user message is sent
        ],
        max_tokens: 400,
        temperature: 0.3,
        stream: true 
      }),
    });

    if (!response.ok) {
       const errText = await response.text();
       
       if (errText.toLowerCase().includes("loading") || response.status === 503) {
           return NextResponse.json({
               error: "The AI is booting up. Please wait 20 seconds and try again."
           }, { status: 503 });
       }
       
       return NextResponse.json({ error: `API Error (${response.status}): ${errText}` }, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Unknown server execution failure" }, { status: 500 });
  }
}
