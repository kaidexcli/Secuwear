// Stretch Vercel's timeout limit to 60 seconds just in case
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = process.env.HF_TOKEN?.trim();

    const systemPrompt = "You are SecuWear Auxilink, an expert AI in disaster survival and emergency response in the Philippines.";

    // Pointing directly to YOUR model's specific chat completion endpoint
    const response = await fetch("https://api-inference.huggingface.co/models/sojukai/sw-llemon-2.7-7b/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        model: "sojukai/sw-llemon-2.7-7b", // Using your fine-tuned model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 250,      
        temperature: 0.3,    
        stream: true           
      }),
    });

    if (!response.ok) {
       return Response.json({ error: "Failed to fetch from HF" }, { status: response.status });
    }

    // Stream the raw bytes directly back to the frontend
    return new Response(response.body, {
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    return Response.json({ error: "AI Server unreachable" }, { status: 500 });
  }
}
