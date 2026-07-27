// Force Vercel to wait up to 60 seconds (prevents the 10-second crash)
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines.";
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`;

    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HF_TOKEN}`
      },
      cache: "no-store", // Crucial: Prevents Next.js "fetch failed" caching errors
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3,
          return_full_text: false
        },
        options: {
          wait_for_model: true // Forces the server to hold the connection until the model wakes up
        }
      }),
    });

    if (!response.ok) {
       const err = await response.json().catch(() => ({}));
       const errorMsg = err.error || "Failed to fetch from HF";
       
       if (errorMsg.toLowerCase().includes("loading")) {
           return Response.json({ response: `*System Note: The SecuWear AI is currently booting up. Please wait 20 seconds and ask again.*` });
       }
       return Response.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text || data[0]?.text || "";
    const cleanText = generatedText.replace(formattedPrompt, "").trim();

    return Response.json({ response: cleanText });

  } catch (error: any) {
    console.error("API Crash:", error);
    return Response.json({ error: "AI Server unreachable or fetch failed." }, { status: 500 });
  }
}
