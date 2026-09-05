import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// High limit for base64 frame images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Shot analysis taxonomy schema
const SHOT_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    shotSize: {
      type: Type.STRING,
      description: "Shot size: Extreme Wide Shot (EWS), Wide Shot (WS), Full Shot (FS), Medium Full Shot (MFS / Cowboy), Medium Shot (MS), Medium Close-Up (MCU), Close-Up (CU), or Extreme Close-Up (ECU)",
    },
    angle: {
      type: Type.STRING,
      description: "Camera angle: Eye Level, Low Angle, High Angle, Dutch Angle (Canted), Overhead / Bird's Eye, or Ground Level / Worm's Eye",
    },
    framing: {
      type: Type.STRING,
      description: "Framing: Single, Two Shot, Group Shot, Over-the-Shoulder (OTS), Point of View (POV), Insert / Cutaway, or Dirty Single",
    },
    movement: {
      type: Type.STRING,
      description: "Inferred camera movement or staging: Static, Pan, Tilt, Dolly / Push-In, Pull-Out, Tracking / Steadicam, Crane / Jib, Handheld, or Whip Pan",
    },
    focus: {
      type: Type.STRING,
      description: "Focus & depth: Deep Focus, Shallow Focus (Bokeh), Rack Focus, Split Diopter, Tilt-Shift, or Soft / Diffused Focus",
    },
    composition: {
      type: Type.STRING,
      description: "Composition: Rule of Thirds, Center Framed / Symmetrical, Leading Lines, Golden Ratio, Negative Space, Frame Within a Frame, or Quadrant Framing",
    },
    lens: {
      type: Type.STRING,
      description: "Lens optics: Ultra Wide (<18mm), Wide Angle (18-28mm), Standard / Normal (35-50mm), Telephoto (85mm+), Anamorphic (2.39:1 widescreen, oval bokeh), or Macro",
    },
    lighting: {
      type: Type.STRING,
      description: "Lighting setup: High Key, Low Key, Chiaroscuro / Hard Contrast, Soft / Diffused, Golden Hour / Magic Hour, Silhouette, Practical Lighting, Neon / Stylized Colored, or Rembrandt",
    },
    colorMood: {
      type: Type.STRING,
      description: "Color script mood keywords (e.g., 'Cool Desaturated Blue', 'Warm Amber Glow', 'Vibrant Neon Noir', 'Muted Earthy Sepia')",
    },
    narrativeFunction: {
      type: Type.STRING,
      description: "Directorial and emotional intent of this visual staging according to StudioBinder cinematography grammar",
    },
    directorStyle: {
      type: Type.STRING,
      description: "Iconic cinematic reference style (e.g. Roger Deakins, Wes Anderson, Denis Villeneuve, David Fincher, Wong Kar-wai, Stanley Kubrick)",
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "Confidence from 0 to 100 in this assessment",
    },
  },
  required: [
    "shotSize",
    "angle",
    "framing",
    "movement",
    "focus",
    "composition",
    "lens",
    "lighting",
    "colorMood",
    "narrativeFunction",
  ],
};

const CINEMATOGRAPHY_SYSTEM_PROMPT = `You are a world-class Director of Photography (DoP) and Master Cinematography Analyst trained on StudioBinder guides and Eyecannndy visual grammar.
Analyze the provided video frame keyframe with exacting precision across all 8 core cinematic dimensions:
1. Shot Size (EWS, WS, FS, MFS Cowboy, MS, MCU, CU, ECU)
2. Camera Angle (Eye Level, Low Angle, High Angle, Dutch Angle, Overhead, Ground Level)
3. Framing / Staging (Single, Two Shot, Group Shot, OTS, POV, Insert, Dirty Single)
4. Camera Movement / Rig (Static, Pan, Tilt, Dolly Push/Pull, Tracking/Steadicam, Crane, Handheld, Whip Pan)
5. Focus & Depth of Field (Deep Focus, Shallow Focus, Rack Focus, Split Diopter, Tilt-Shift, Soft Focus)
6. Composition (Rule of Thirds, Center Framed / Symmetrical, Leading Lines, Golden Ratio, Negative Space, Frame Within a Frame)
7. Lens & Optics (Ultra Wide, Wide Angle, Standard/Normal, Telephoto, Anamorphic, Macro)
8. Lighting (High Key, Low Key, Chiaroscuro, Soft Diffused, Golden Hour, Silhouette, Practical, Neon / Stylized, Rembrandt)

Also provide color mood descriptors and the directorial narrative function. Output pure structured JSON adhering strictly to the schema.`;

// Single shot analyzer
app.post("/api/analyze-shot", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", shotNumber, timecode } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    // Clean base64 string if it has data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const ai = getAi();
    const prompt = `Analyze this video keyframe (Shot #${shotNumber || 1}, Timecode: ${timecode || "00:00:00"}).
Identify the exact shot size, camera angle, framing, inferred movement, focus depth, composition geometry, lens type, and lighting setup according to StudioBinder and Eyecannndy cinematography standards.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: CINEMATOGRAPHY_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: SHOT_ANALYSIS_SCHEMA,
        temperature: 0.2,
      },
    });

    const analysisText = response.text || "{}";
    const parsedData = JSON.parse(analysisText);

    return res.json({
      success: true,
      analysis: parsedData,
    });
  } catch (error: any) {
    console.error("Error analyzing shot:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze shot cinematography",
    });
  }
});

// Batch analyze shots
app.post("/api/batch-analyze-shots", async (req, res) => {
  try {
    const { shots } = req.body;
    if (!Array.isArray(shots) || shots.length === 0) {
      return res.status(400).json({ error: "Invalid or empty shots array" });
    }

    const ai = getAi();
    const results: any[] = [];

    // Process up to 8 shots concurrently
    const maxBatch = Math.min(shots.length, 12);
    for (let i = 0; i < maxBatch; i++) {
      const shot = shots[i];
      try {
        const cleanBase64 = shot.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: shot.mimeType || "image/jpeg",
                  data: cleanBase64,
                },
              },
              {
                text: `Analyze Shot #${shot.shotNumber || i + 1} at ${shot.timecode || "00:00:00"}. Identify StudioBinder shot size, angle, framing, movement, focus, composition, lens, and lighting.`,
              },
            ],
          },
          config: {
            systemInstruction: CINEMATOGRAPHY_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: SHOT_ANALYSIS_SCHEMA,
            temperature: 0.2,
          },
        });
        const parsed = JSON.parse(response.text || "{}");
        results.push({
          shotId: shot.id,
          shotNumber: shot.shotNumber,
          analysis: parsed,
        });
      } catch (err: any) {
        console.warn(`Failed shot ${shot.id}:`, err);
        results.push({
          shotId: shot.id,
          shotNumber: shot.shotNumber,
          error: err.message,
        });
      }
    }

    return res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error in batch analysis:", error);
    return res.status(500).json({
      error: error?.message || "Failed in batch analysis",
    });
  }
});

// Color Script Synthesis AI Route (Provides cinematic narrative interpretation for the full color script)
app.post("/api/analyze-color-script", async (req, res) => {
  try {
    const { palettes, totalShots, duration } = req.body;
    const ai = getAi();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an art director and master colorist (like at Pixar and major cinema studios).
Here is the sequential color progression of a video with ${totalShots} detected scenes over ${duration}:
${JSON.stringify(palettes, null, 2)}

Provide a Pixar-style Color Script breakdown:
1. Dominant Emotional Arc (how color shifts convey psychological character transformation or narrative conflict)
2. Color Harmony Analysis (Complementary, Analogous, Triadic, Monochromatic tensions)
3. Key Temperature Shifts (Warm vs Cool dynamics)
4. 3 Art Director Recommendations for lighting and color grading coherence.`,
      config: {
        systemInstruction: "You are a senior Hollywood film colorist and production designer.",
      },
    });

    return res.json({
      success: true,
      scriptNarrative: response.text,
    });
  } catch (error: any) {
    console.error("Error analyzing color script:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze color script",
    });
  }
});

// Vite middleware & Production static serving
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CineShot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
