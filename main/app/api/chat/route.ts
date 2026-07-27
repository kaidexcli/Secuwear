export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines.";
    // Formatting explicitly for the OpenHermes/Mistral architecture you fine-tuned
    const formattedPrompt = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`;

    // .trim() ensures no accidental spaces from Vercel's dashboard ruin the token
    const hfToken = process.env.HF_TOKEN?.trim(); 

    if (!hfToken) {
      return Response.json({ error: "Configuration Error: HF_TOKEN is missing." }, { status: 400 });
    }

    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken}`
      },
      // cache: "no-store" prevents Next.js from caching error states
      cache: "no-store", 
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.3,
          return_full_text: false
        },
        options: {
          // CRITICAL FIX: Must be false so Vercel doesn't timeout and crash after 10 seconds
          wait_for_model: false 
        }
      }),
    });

    if (!response.ok) {
       // Gracefully catch Hugging Face JSON errors
       const errorData = await response.json().catch(() => ({}));
       
       // If the model is sleeping, intercept the error and tell the frontend
       if (errorData.error && errorData.error.toLowerCase().includes("loading")) {
           const waitTime = Math.round(errorData.estimated_time || 25);
           return Response.json({ response: `*System Note: The SecuWear AI is currently booting up from sleep mode on the server. Please wait about ${waitTime} seconds and try again.*` });
       }
       
       return Response.json({ error: `Hugging Face API Error: ${errorData.error || response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract the text safely
    const generatedText = data[0]?.generated_text || data[0]?.text || "";
    const cleanText = generatedText.replace(formattedPrompt, "").trim();

    return Response.json({ response: cleanText });

  } catch (error: any) {
    console.error("API Crash:", error);
    // If it STILL crashes, it will now tell you the EXACT Javascript error
    return Response.json({ error: `Backend crash: ${error.message}` }, { status: 500 });
  }
}
