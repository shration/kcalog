import { AnalysisResult } from "../types";

export async function analyzeFoodImage(
  base64Image: string,
  mimeType: string,
  recommendedCalories: number,
  currentDailyCalories: number
): Promise<AnalysisResult> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Image,
        mimeType,
        recommendedCalories,
        currentDailyCalories,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "분석 요청에 실패했어.");
    }

    return await response.json();
  } catch (error) {
    console.error("Analysis Request Error:", error);
    throw new Error(error instanceof Error ? error.message : "음식 분석에 실패했어. 다시 시도해봐.");
  }
}
