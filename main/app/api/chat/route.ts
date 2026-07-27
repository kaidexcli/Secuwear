import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines."
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`

    const hfToken = process.env.HF_TOKEN // Make sure to add HF_TOKEN to your .env.local file

    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b", {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.3,
          return_full_text: false
        }
      }),
    })

    const result = await response.json()

    if (Array.isArray(result) && result.length > 0) {
      const generatedText = result[0].generated_text || result[0].text || ""
      return NextResponse.json({ response: generatedText.trim() })
    }

    return NextResponse.json({ response: "Unable to parse model response. Please contact local emergency services if urgent." })
  } catch (error) {
    console.error("Auxilink API Error:", error)
    return NextResponse.json({ error: "Failed to fetch response from Auxilink AI model." }, { status: 500 })
  }
}
