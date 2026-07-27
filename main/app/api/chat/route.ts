import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines.";
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`;

    // Use the official SDK instead of raw fetch
    const response = await hf.textGeneration({
      model: 'sojukai/sw-llemon-2.7-7b',
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.3,
      }
    });

    const generatedText = response.generated_text;
    const cleanText = generatedText.replace(formattedPrompt, "").trim();

    return NextResponse.json({ response: cleanText });

  } catch (error: any) {
    console.error("SDK Error:", error);
    // This will give you the specific reason for the failure in the UI
    return NextResponse.json({ error: error.message || "Failed to reach AI Server" }, { status: 500 });
  }
}
