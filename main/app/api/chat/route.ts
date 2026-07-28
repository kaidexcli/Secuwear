// CRITICAL FIX: The Edge runtime bypasses the standard 10s Serverless timeout
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message payload is required' }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN?.trim();

    if (!hfToken) {
      return Response.json({ error: "Server Error: HF_TOKEN is missing." }, { status: 500 });
    }

    const systemPrompt = `You are SecuWear Auxilink, an expert in Philippine disaster survival and emergency response. 
    You have immediate access to these Philippine Emergency Hotlines:
    - National Emergency: 911
    - PNP: 117 / (02) 8722-0650
    - BFP: (02) 8426-0219
    - NDRRMC: (02) 8911-5061
    - Red Cross: 143
    - DOH: 1555
    Always prioritize safety, give concise instructions, and provide these specific hotline numbers when a user is in distress.`;

    // Using the official OpenAI-compatible endpoint for Mistral which supports true streaming
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.3,
        stream: true // Streams chunks to keep Vercel alive
      }),
    });

    if (!response.ok) {
       return Response.json({ error: `Hugging Face Error: ${response.statusText}` }, { status: response.status });
    }

    // Stream the raw bytes directly back to the frontend
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return Response.json({ error: `Backend Error: ${error.message}` }, { status: 500 });
  }
}
