import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFoodImage(
  base64Image: string,
  mimeType: string,
  recommendedCalories: number,
  currentDailyCalories: number
): Promise<AnalysisResult> {
  const prompt = `
    이미지 속 음식을 분석해서 JSON 형식으로 반환해줘.
    
    분석 내용:
    1. 음식별 이름 (name)
    2. 음식별 추정 칼로리 (calories, kcal 단위)
    3. 전체 칼로리 합계 (total_calories)
    4. AI 피드백 (feedback): 
       - 현재까지 먹은 칼로리: ${currentDailyCalories}kcal
       - 이번 식사 칼로리 포함 예정
       - 하루 권장 칼로리: ${recommendedCalories}kcal
       - 말투 규칙: 반말, MZ 스타일, 정중함 금지, 친구가 놀리는 느낌, 살짝 기분 나쁜 포인트 필수.
       - 피드백 로직:
         * 부족 (누적 < 70%): 긍정적인 척하면서 비꼼 (예: "이 정도면 공기 먹은 거 아님?")
         * 적정 (70% ~ 100%): 칭찬하는 척하면서 긁기 (예: "오? 오늘은 사람답게 먹었네 ㅋㅋ")
         * 초과 (> 100%): 일침 (예: "쯔양 준비중임? 이건 좀 선 넘었는데")

    응답은 반드시 아래 JSON 구조를 따라야 함:
    {
      "foods": [
        { "name": "음식명", "calories": 123 }
      ],
      "total_calories": 123,
      "feedback": "싸가지 없는 피드백 문자열"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                },
                required: ["name", "calories"],
              },
            },
            total_calories: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
          },
          required: ["foods", "total_calories", "feedback"],
        },
      },
    });

    const text = response.text;
    const result = JSON.parse(text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("음식 분석에 실패했어. 다시 시도해봐.");
  }
}
