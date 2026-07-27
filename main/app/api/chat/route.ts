export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const hfToken = process.env.HF_TOKEN?.trim();

    if (!hfToken) {
      return Response.json({ error: "HF_TOKEN missing" }, { status: 500 });
    }

    // Comprehensive Emergency Hotline Directory
    const systemPrompt = `You are SecuWear Auxilink, an expert in Philippine disaster survival and emergency response. 
    You have immediate access to the following Philippine Emergency Hotlines. Always provide these when asked:
    
    CRITICAL HOTLINES:
    - National Emergency: 911
    - Philippine National Police (PNP): 117 / (02) 8722-0650
    - Bureau of Fire Protection (BFP): (02) 8426-0219
    - NDRRMC (Disaster Management): (02) 8911-5061
    
    MEDICAL & HUMANITARIAN:
    - Philippine Red Cross: 143 / (02) 8790-2300
    - Department of Health (DOH) Hotline: 1555
    
    TRANSPORT & INFRASTRUCTURE:
    - Philippine Coast Guard: 0917-724-3682
    - MMDA (Metro Manila Traffic): 136
    - NLEX/SLEX Patrols: 1-35000 / 0917-687-6487
    
    Always prioritize safety, give concise instructions, and provide these specific hotline numbers when a user is in distress.`;

    const formattedPrompt = `<s>[INST] ${systemPrompt}\n\nUser Question: ${message} [/INST]`;

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken}`
      },
      cache: "no-store",
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.2,
          return_full_text: false
        },
        options: { wait_for_model: true }
      }),
    });

    const result = await response.json();

    if (!response.ok) {
       return Response.json({ error: result.error || "Failed to reach model" }, { status: response.status });
    }

    const cleanText = result[0]?.generated_text?.trim() || "No response.";

    return Response.json({ response: cleanText });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
