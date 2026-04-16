import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { analyzeFoodWithGemini } from "./src/lib/analysis-service.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

app.post("/api/analyze", async (req, res) => {
  const { base64Image, mimeType, recommendedCalories, currentDailyCalories } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing." });
  }

  try {
    const result = await analyzeFoodWithGemini({
      base64Image,
      mimeType,
      recommendedCalories,
      currentDailyCalories,
      apiKey
    });
    res.json(result);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    const keyPrefix = apiKey.substring(0, 6);
    res.status(500).json({ 
      error: "분석 실패", 
      details: `Key: ${keyPrefix}, Msg: ${error.message}` 
    });
  }
});

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
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
