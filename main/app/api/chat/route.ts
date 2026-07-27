export const maxDuration = 60;

export async function POST(req: Request) {
  console.log("API Route /api/chat hit"); // Will show up in Vercel Logs

  try {
    const body = await req.json();
    console.log("Request received:", body);

    const { message } = body;
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      console.error("HF_TOKEN is undefined!");
      return Response.json({ error: "HF_TOKEN missing" }, { status: 500 });
    }

    console.log("Attempting fetch to Hugging Face...");

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken.trim()}`
      },
      body: JSON.stringify({
        inputs: `<s>[INST] Expert Philippine survivalist. Question: ${message} [/INST]`,
        parameters: { max_new_tokens: 250 },
        options: { wait_for_model: true }
      }),
    });

    console.log("Hugging Face response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face error body:", errorText);
      return Response.json({ error: `HF API Error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("Success! Returning data.");
    return Response.json({ response: data[0]?.generated_text || "No output" });

  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
