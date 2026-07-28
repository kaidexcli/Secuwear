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

    const systemPrompt = `You are SecuWear Auxilink, an expert in Philippine disaster survival and emergency response. 
    You have immediate access to these Philippine Emergency Hotlines:
    - National Emergency: 911
    - PNP: 117 / (02) 8722-0650
    - BFP: (02) 8426-0219
    - NDRRMC: (02) 8911-5061
    - Red Cross: 143
    - DOH: 1555
    Always prioritize safety, give concise instructions, and provide these specific hotline numbers when a user is in distress.`;

    const formattedPrompt = `<s>[INST] ${systemPrompt}\n\nUser Question: ${message} [/INST]`;

    // CRITICAL: We create an 8-second timer to beat Vercel's 10-second kill switch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal, // Attach the timer to the fetch
        body: JSON.stringify({
          inputs: formattedPrompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.3,
            return_full_text: false
          },
          options: {
            wait_for_model: false // Forces HF to tell us immediately if it is sleeping
          }
        }),
      });

      clearTimeout(timeoutId); // Clear timer if it succeeds quickly

      const result = await response.json();

      if (!response.ok || result.error) {
        // Catch the 503 "Model is loading" state
        if (result.error && result.error.toLowerCase().includes('loading')) {
          const wait = Math.round(result.estimated_time || 20);
          return NextResponse.json({ 
            response: `*System Note: The SecuWear AI is currently booting up from sleep mode on the server. Please wait about ${wait} seconds and try again.*` 
          });
        }
        return NextResponse.json({ error: `API Error: ${result.error}` }, { status: response.status });
      }

      const cleanText = result[0]?.generated_text?.trim() || "No response generated.";
      return NextResponse.json({ response: cleanText });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // If our 8-second timer triggers, it throws an AbortError. We catch it here gracefully.
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          response: "*System Note: The SecuWear emergency database is warming up. This takes about 20 seconds. Please wait a moment and try sending your message again.*" 
        });
      }
      throw fetchError; 
    }

  } catch (error: any) {
    return NextResponse.json({ error: `Backend crash: ${error.message}` }, { status: 500 });
  }
}
