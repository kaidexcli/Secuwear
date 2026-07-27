export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return Response.json({ error: "HF_TOKEN not found in Vercel settings" }, { status: 500 });
    }

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines.";
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken.trim()}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: { max_new_tokens: 250, temperature: 0.3, return_full_text: false },
        options: { wait_for_model: true }
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
       const text = await response.text();
       return Response.json({ error: `Hugging Face Error (${response.status}): ${text}` }, { status: response.status });
    }

    const data = await response.json();
    const cleanText = data[0]?.generated_text?.replace(formattedPrompt, "").trim() || "No content.";

    return Response.json({ response: cleanText });

  } catch (error: any) {
    return Response.json({ error: `Backend Error: ${error.message}` }, { status: 500 });
  }
}
