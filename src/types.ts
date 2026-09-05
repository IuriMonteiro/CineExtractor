export interface ShotAnalysis {
  shotSize: string; // EWS, WS, FS, MFS, MS, MCU, CU, ECU
  angle: string; // Eye Level, Low Angle, High Angle, Dutch Angle, Overhead, Ground Level
  framing: string; // Single, Two Shot, Group Shot, OTS, POV, Insert, Dirty Single
  movement: string; // Static, Pan, Tilt, Dolly Push/Pull, Tracking, Crane, Handheld, Whip Pan
  focus: string; // Deep Focus, Shallow Focus, Rack Focus, Split Diopter, Tilt-Shift, Soft Focus
  composition: string; // Rule of Thirds, Center Framed, Leading Lines, Golden Ratio, Negative Space, Frame Within a Frame
  lens: string; // Ultra Wide, Wide Angle, Standard/Normal, Telephoto, Anamorphic, Macro
  lighting: string; // High Key, Low Key, Chiaroscuro, Soft Diffused, Golden Hour, Silhouette, Practical, Neon, Rembrandt
  colorMood: string; // e.g. "Warm Golden Noir", "Cool Desaturated Dystopia"
  narrativeFunction: string; // Psychological / storytelling intent
  directorStyle?: string; // e.g. "Roger Deakins", "Denis Villeneuve", "Wes Anderson"
  confidenceScore?: number; // 0 - 100
  eyecandyTechniques?: string[]; // Detected Eyecannndy techniques (e.g. ["HALATION", "CENTRAL FRAMING", "DOLLY ZOOM", "SNORRICAM"])
}

export interface Shot {
  id: string;
  shotNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  keyframeTime: number;
  keyframeDataUrl: string;
  gifDataUrl?: string;
  isGifGenerating?: boolean;
  palette: string[]; // 5-6 hex colors
  dominantColor: string;
  secondaryColor: string;
  luminance: number; // 0 to 1
  warmth: number; // -1 (cool blue) to 1 (warm orange)
  saturation: number; // 0 to 1
  analysis?: ShotAnalysis;
  isAnalyzing?: boolean;
  analysisError?: string;
}

export interface ExtractionConfig {
  sensitivity: number; // 15 to 45 (threshold delta for cut detection)
  minShotDuration: number; // e.g. 0.2s to 3.0s
  maxShots: number; // 0 = Unlimited (no limits: extracts whatever is in video: 1,000, 20,000+ shots)
  sampleFps: number; // 1 to 8 (1 = fast movie mode, 2.5 = balanced, 6 = precision)
  scanRangeMode: "full" | "range"; // Full video vs specific time window
  startTime: number; // in seconds
  endTime: number; // in seconds (0 = full duration)
  exportMode: "images" | "gifs" | "both";
  folderName: string;
  gifFps: number; // 6 to 15 fps
  gifResolutionWidth: number; // 320 to 540px
}

export interface ColorScriptData {
  summary?: string;
  isLoadingAI?: boolean;
}

export interface SampleVideo {
  id: string;
  title: string;
  duration: string;
  genre: string;
  description: string;
  url: string;
  thumbnail: string;
}
