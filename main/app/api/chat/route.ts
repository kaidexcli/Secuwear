import { NextResponse } from 'next/server';

// Attempt to stretch Vercel's execution time
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Safely grab the message from the frontend
    const message = body.message;

    if (!message) {
      return NextResponse.json({ error: 'Message payload is required' }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN?.trim(); 

    if (!hfToken) {
      return NextResponse.json({ error: "Server Error: HF_TOKEN is missing in Vercel." }, { status: 500 });
    }

    // Injecting the Philippine emergency database directly into the AI's core instructions
    const systemPrompt = `You are SecuWear Auxilink, an expert in Philippine disaster survival and emergency response. 
    You have immediate access to these Philippine Emergency Hotlines:
    - National Emergency: 911
    - PNP: 117 / (02) 8722-0650
    - BFP: (02) 8426-0219
    - NDRRMC: (02) 8911-5061
    - Red Cross: 143
    - DOH: 1555
    Always prioritize safety, give concise instructions, and provide these specific hotline numbers when a user is in distress.`;

    // Mistral's required prompt format
    const formattedPrompt = `<s>[INST] ${systemPrompt}\n\nUser Question: ${message} [/INST]`;

    // The Fetch Request
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // CRITICAL: Stops Next.js from aggressively caching and failing
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          return_full_text: false
        },
        options: {
          wait_for_model: false // CRITICAL: Fails fast if the model is sleeping, preventing Vercel timeouts
        }
      }),
    });

    // Safely parse the response to prevent JSON crashes on 503/504 errors
    const textResponse = await response.text();
    let result;
    try {
      result = JSON.parse(textResponse);
    } catch (parseError) {
      return NextResponse.json({ error: `Hugging Face Gateway Error (Status: ${response.status}).` }, { status: 502 });
    }

    // Handle Hugging Face Specific Errors (Like Sleep Mode)
    if (!response.ok || result.error) {
      if (result.error && result.error.toLowerCase().includes('loading')) {
        const waitTime = Math.round(result.estimated_time || 20);
        return NextResponse.json({ 
          response: `*System Note: The SecuWear AI is currently booting up from sleep mode on the server. Please wait about ${waitTime} seconds and try again.*` 
        });
      }
      return NextResponse.json({ error: result.error || 'Failed to connect to Hugging Face.' }, { status: response.status });
    }

    // Success! Extract and clean the text.
    const generatedText = result[0]?.generated_text || result[0]?.text || "";
    const cleanText = generatedText.replace(formattedPrompt, "").trim();
    
    return NextResponse.json({ response: cleanText });

  } catch (error: any) {
    console.error("Auxilink API Error:", error);
    return NextResponse.json({ error: `Backend Error: ${error.message || "Unknown execution failure."}` }, { status: 500 });
  }
}
