import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initializer for GoogleGenAI client to avoid crash if GEMINI_API_KEY is unset
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

/**
 * Generates an analog horror music prompt or enriches user keywords using gemini-3.8-flash
 */
app.post("/api/music-prompt", async (req, res) => {
  try {
    const { atmosphere = "infierno", keywords = "" } = req.body;
    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "models/gemini-3.8-flash",
      contents: `You are an audio designer for an analog horror 90s FPS game called 'BLOOD OF THE BIRD'.
Generate a concise, evocative musical prompt (in English, maximum 35 words) for an AI music model.
Theme/Atmosphere: ${atmosphere}.
Keywords: ${keywords}.
Focus on: analog tape hiss, VHS tracking wobble, sub-bass drones, distorted music box chimes, metallic scraping, distant shrieks, ominous tension.
Only return the prompt text, no preamble or quotes.`,
    });

    const generatedPrompt = response.text?.trim() || "Dark analog horror drone with VHS hiss, broken music box, 60Hz hum, and heavy industrial sub-bass";
    res.json({ success: true, prompt: generatedPrompt });
  } catch (err: unknown) {
    console.error("Failed to generate music prompt:", err);
    const msg = err instanceof Error ? err.message : "Error generating prompt";
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * Generates music using lyria-3-clip-preview (up to 30s clips) or lyria-3-pro-preview (full tracks)
 */
app.post("/api/generate-music", async (req, res) => {
  try {
    const { prompt, mode = "clip" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ success: false, error: "Missing 'prompt' parameter" });
      return;
    }

    const ai = getGenAI();
    const modelName = mode === "full" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

    console.log(`[MusicGen] Invoking ${modelName} with prompt: "${prompt.slice(0, 80)}..."`);

    // Lyria call via generateContentStream or generateContent
    const streamResult = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
    });

    let audioBase64 = "";
    let mimeType = "audio/mp3";

    for await (const chunk of streamResult) {
      if (chunk.candidates && chunk.candidates.length > 0) {
        for (const candidate of chunk.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                audioBase64 += part.inlineData.data;
                if (part.inlineData.mimeType) {
                  mimeType = part.inlineData.mimeType;
                }
              }
            }
          }
        }
      }
    }

    if (!audioBase64) {
      // Fallback: Check standard non-stream generateContent
      const regularResult = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const candidate = regularResult.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        audioBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
      }
    }

    if (!audioBase64) {
      throw new Error("The music generation model did not return any audio data.");
    }

    res.json({
      success: true,
      mode,
      model: modelName,
      mimeType,
      audioBase64,
    });
  } catch (err: unknown) {
    console.error("[MusicGen Error]:", err);
    const msg = err instanceof Error ? err.message : "Error generating music";
    res.status(500).json({
      success: false,
      error: msg,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Blood of the Bird] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
