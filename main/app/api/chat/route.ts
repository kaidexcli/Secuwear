export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = process.env.HF_TOKEN?.trim();

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines.";
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`;

    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken}`
      },
      cache: "no-store",
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.3,
          return_full_text: false
        },
        options: {
          wait_for_model: true // Forces the server to load the model for you
        }
      }),
    });

    if (!response.ok) {
       const err = await response.json().catch(() => ({}));
       return Response.json({ error: err.error || "Failed to fetch from HF" }, { status: response.status });
    }

    const data = await response.json();
    // Safely extract text from the inference API response
    const generatedText = data[0]?.generated_text || data[0]?.text || "No response generated.";
    const cleanText = generatedText.replace(formattedPrompt, "").trim();

    return Response.json({ response: cleanText });

  } catch (error: any) {
    return Response.json({ error: error.message || "AI Server unreachable" }, { status: 500 });
  }
}
