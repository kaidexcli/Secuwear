import { NextResponse } from 'next/server'

// 1. VERCEL OVERRIDE: Force Vercel to wait up to 60 seconds instead of 10s
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines."
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`

    const hfToken = process.env.HF_TOKEN 

    if (!hfToken) {
      return NextResponse.json({ response: "Server Configuration Error: HF_TOKEN environment variable is missing in Vercel." })
    }

    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b", {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3,
          return_full_text: false
        }
      }),
    })

    // 2. SAFE PARSING: Read as text first to prevent JSON crashes on 504/503 errors
    const textResponse = await response.text()
    
    let result;
    try {
      result = JSON.parse(textResponse)
    } catch (parseError) {
      // If Hugging Face sends HTML instead of JSON, we catch it here
      return NextResponse.json({ response: `Hugging Face API Error. Status: ${response.status}. The server is likely overloaded.` })
    }

    if (!response.ok || result.error) {
      if (result.error && result.error.toLowerCase().includes('loading')) {
        const waitTime = Math.round(result.estimated_time || 20)
        return NextResponse.json({ response: `*System Note: The SecuWear AI is currently booting up from sleep mode on the server. Please wait about ${waitTime} seconds and try again.*` })
      }
      return NextResponse.json({ response: `API Error: ${result.error || 'Failed to connect to Hugging Face.'}` })
    }

    if (Array.isArray(result) && result.length > 0) {
      const generatedText = result[0].generated_text || result[0].text || ""
      const cleanText = generatedText.replace(formattedPrompt, "").trim()
      return NextResponse.json({ response: cleanText })
    }

    return NextResponse.json({ response: "Received an empty or unreadable response from the model." })

  } catch (error: any) {
    console.error("Auxilink API Error:", error)
    // 3. DEBUG EXPOSURE: Print the exact system error to the UI so we can see what went wrong
    return NextResponse.json({ response: `Backend Error: ${error.message || "Unknown execution failure."}` })
  }
}
