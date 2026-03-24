import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a medical AI assistant. A user will describe their symptoms and you must return a JSON object — nothing else, no markdown fences, no explanation — with exactly this shape:

{
  "disease": "<most likely disease name>",
  "precautions": ["<precaution 1>", "<precaution 2>", "<precaution 3>", "<precaution 4>"],
  "medicines": ["<medicine 1>", "<medicine 2>", "<medicine 3>"],
  "specialist": "<type of doctor to consult>"
}

Rules:
- Reply with raw JSON only. No markdown, no code fences, no extra text.
- Always include 3-5 items in precautions, 2-4 in medicines.
- If symptoms are vague, give your best educated guess.
- Never refuse — always provide a structured response.`;

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return Response.json(
        { error: "Symptoms are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server misconfiguration: GEMINI_API_KEY is not set." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nUser symptoms: ${symptoms.trim()}`
    );

    const rawText = result.response.text();

    // Strip markdown fences if Gemini accidentally adds them
    const cleaned = rawText
      .replace(/```(?:json)?/g, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return Response.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    // Validate required keys
    const required = ["disease", "precautions", "medicines", "specialist"];
    for (const key of required) {
      if (!(key in data)) {
        return Response.json(
          { error: `AI response missing field: ${key}` },
          { status: 502 }
        );
      }
    }

    return Response.json(data);
  } catch (err: unknown) {
    console.error("[/api/predict] Error:", err);
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
