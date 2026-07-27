import { NextResponse } from 'next/server'

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
      return NextResponse.json({ response: "Server Configuration Error: HF_TOKEN environment variable is missing." })
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

    const result = await response.json()

    // 1. Check if Hugging Face returned an error object (like a Cold Start)
    if (!response.ok || result.error) {
      // If the model is sleeping, tell the user exactly how long to wait
      if (result.error && result.error.toLowerCase().includes('loading')) {
        const waitTime = Math.round(result.estimated_time || 20)
        return NextResponse.json({ response: `*System Note: The SecuWear AI is currently booting up from sleep mode on the server. Please wait about ${waitTime} seconds and ask your question again.*` })
      }
      return NextResponse.json({ response: `API Error: ${result.error || 'Failed to connect to Hugging Face.'}` })
    }

    // 2. Check for a successful text generation array
    if (Array.isArray(result) && result.length > 0) {
      const generatedText = result[0].generated_text || result[0].text || ""
      
      // Clean out the prompt tags just in case return_full_text malfunctions
      const cleanText = generatedText.replace(formattedPrompt, "").trim()
      return NextResponse.json({ response: cleanText })
    }

    // 3. Absolute fallback
    return NextResponse.json({ response: "Received an empty or unreadable response from the model." })

  } catch (error) {
    console.error("Auxilink API Error:", error)
    return NextResponse.json({ response: "Fatal Error: Failed to establish a backend connection." })
  }
}
