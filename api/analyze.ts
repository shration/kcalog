import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60, // Gemini analysis can take time
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64Image, mimeType, recommendedCalories, currentDailyCalories } = req.body;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing in Vercel Environment Variables." });
  }

  const ai = new GoogleGenAI({ apiKey });

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
      model: "gemini-2.0-flash",
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
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const errorMessage = error.message || String(error);
    res.status(500).json({ 
      error: `음식 분석에 실패했어. (상세: ${errorMessage})`, 
      details: errorMessage 
    });
  }
}
