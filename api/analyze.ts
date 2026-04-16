import { analyzeFoodWithGemini } from "../src/lib/analysis-service";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { base64Image, mimeType, recommendedCalories, currentDailyCalories } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key missing in Vercel." });
  }

  try {
    const result = await analyzeFoodWithGemini({
      base64Image,
      mimeType,
      recommendedCalories,
      currentDailyCalories,
      apiKey
    });
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel Analysis Error:", error);
    const keyPrefix = apiKey.substring(0, 6);
    res.status(500).json({ 
      error: "분석 실패", 
      details: `Key: ${keyPrefix}, Msg: ${error.message}` 
    });
  }
}
