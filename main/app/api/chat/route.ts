import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message payload is required' }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN?.trim();

    if (!hfToken) {
      return NextResponse.json({ error: "Configuration Error: HF_TOKEN is missing." }, { status: 500 });
    }

    const hf = new HfInference(hfToken);

    const systemPrompt = `You are SecuWear Auxilink, an expert in Philippine disaster survival and emergency response. 
    You have immediate access to these Philippine Emergency Hotlines:
    - National Emergency: 911
    - PNP: 117 / (02) 8722-0650
    - BFP: (02) 8426-0219
    - NDRRMC: (02) 8911-5061
    - Red Cross: 143
    - DOH: 1555
    Always prioritize safety, give concise instructions, and provide these specific hotline numbers when a user is in distress.`;

    // Zephyr-specific prompt formatting to bypass the broken chat endpoint
    const formattedPrompt = `<|system|>\n${systemPrompt}</s>\n<|user|>\n${message}</s>\n<|assistant|>\n`;

    // CRITICAL: Using textGeneration with Zephyr bypasses the broken third-party HTTP providers
    const response = await hf.textGeneration({
      model: 'moonshotai/Kimi-K3',
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.3,
        return_full_text: false
      }
    });

    // Clean the output
    const rawText = response.generated_text || "";
    const cleanText = rawText.replace(formattedPrompt, "").trim();
    
    return NextResponse.json({ response: cleanText || "No response generated." });

  } catch (error: any) {
    console.error("SDK API Error:", error);

    const errMessage = error.message?.toLowerCase() || "";
    if (errMessage.includes('loading') || errMessage.includes('timeout') || errMessage.includes('503')) {
      return NextResponse.json({ 
        response: "*System Note: The SecuWear AI is currently booting up from sleep mode on the server. Please wait about 15 seconds and try again.*" 
      });
    }

    return NextResponse.json({ error: `Backend SDK Error: ${error.message}` }, { status: 500 });
  }
}
