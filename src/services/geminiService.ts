import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export async function generateKneeContent(systemPrompt: string, userPrompt: string) {
  try {
    const ai = getAI();
    if (!ai) return "I'm here to help with your knee care.";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${systemPrompt}\n\nUser Query: ${userPrompt}`,
    });
    return response.text || "I'm here to help with your knee care.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting right now.";
  }
}

export async function getKneeCareTip(prompt: string) {
  try {
    const ai = getAI();
    if (!ai) return "I'm here to help with your knee care. Try some gentle stretching!";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful knee-care assistant. Provide a short, practical, and supportive tip for knee health based on the following query: "${prompt}". Keep it simple and avoid medical claims.`,
    });
    return response.text || "I'm here to help with your knee care. Try some gentle stretching!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting right now, but remember to stay active and gentle with your knees!";
  }
}
