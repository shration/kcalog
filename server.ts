import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini AI Setup
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// API Route for Food Analysis
app.post("/api/analyze", async (req, res) => {
  const { base64Image, mimeType, recommendedCalories, currentDailyCalories } = req.body;

  if (!apiKey) {
    console.error("Critical Error: API Key is missing in environment variables!");
    return res.status(500).json({ error: "서버에 API 키가 설정되지 않았어. 환경 변수(GEMINI_API_KEY 또는 GOOGLE_API_KEY)를 확인해봐." });
  }

  console.log("Analysis request received. Image size:", base64Image?.length, "bytes");

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
      model: "gemini-1.5-flash",
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

    console.log("Gemini API call successful.");
    const text = response.text;
    const result = JSON.parse(text || "{}");
    res.json(result);
  } catch (error) {
    console.error("Gemini API Error Details:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: `음식 분석에 실패했어. (상세: ${errorMessage})`, 
      details: errorMessage 
    });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
