# 🎬 CineShot — Scene Extractor, Color Script & Cinematography AI Analyzer

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_API-2.5_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> An intelligent, browser-based director's suite that automatically slices video footage into individual shots, generates animated looping GIFs, extracts continuous color scripts, and categorizes visual grammar using the **StudioBinder 8-axis taxonomy** and **Eyecannndy movie techniques catalog**.

---

## 🌟 Overview

**CineShot** turns any video file (trailers, film clips, commercials, reels) into a comprehensive directorial breakdown in seconds. It runs pixel-level scene cut detection directly in the browser using HTML5 Canvas, generates high-res stills and animated GIFs, extracts vibrant 5-color palettes to construct continuous timeline color scripts, and leverages multimodal AI (Google Gemini) to analyze shot size, angles, lighting, lenses, and over 100 signature directorial techniques.

Whether you are a filmmaker creating reference shot decks, a colorist studying palette progression, or a film student analyzing visual storytelling, CineShot delivers an end-to-end cinematic breakdown workstation.

---

## ✨ Key Features

### 🎞️ 1. Automatic Scene Cut Detection (Short Clips & 2-Hour Feature Films)
- **Client-Side Processing**: Zero video uploads to external servers for slicing; all frame analysis runs locally in the browser via HTML5 Canvas.
- **Long-Form & Feature Film Ready**: Built to handle videos ranging from 30-second clips to full 2-hour movies without crashing or running out of memory.
- **Range Scanning (Time Windows)**: Analyze entire videos or isolate specific time windows (e.g. `00:14:30` to `00:28:45`) using intuitive timecode inputs or quick presets (first 3 min, 5 min, 15 min, etc.).
- **Smart Adaptive Sampling**: Dynamically scales sampling density (1.0 fps Movie Speed, 2.5 fps Standard, 6.0 fps Fine) and yields execution every few frames to prevent browser freezing.
- **Zero Ceilings & Unlimited Cuts**: No artificial shot limits. Whether a sequence has 50 cuts, 1,000 cuts, or a feature film has 20,000 cuts, CineShot captures every transition. Includes dynamic memory-safe scaling, client pagination, and movie barcode scrubbing.
- **Instant Synthetic Demo**: Don't have a video handy? Click **"Generate Synthetic 4-Scene Demo"** to generate an instant multi-scene test video on the fly with HTML5 Canvas & MediaRecorder.

### 🖼️ 2. High-Res Stills & Looping GIF Generator
- **Automatic Keyframe Extraction**: Captures crisp full-resolution stills at the golden ratio moment of every detected shot.
- **In-Browser GIF Encoding**: Creates looping animated GIFs (powered by `gifenc`) with adjustable durations (0.5s – 4.0s) and frame rates.
- **Batch Processing**: Slices and renders GIFs across all scenes simultaneously with one click.

### 🎨 3. Visual Color Script & Film Barcode
- **Dominant Palette Extraction**: Analyzes spatial luminance and chrominance to produce a curated 5-swatch palette per shot.
- **Continuous Color Script**: Renders a proportional timeline visualizing the emotional color arc of the sequence.
- **Digital Film Barcode**: Converts the footage into an iconic movie barcode strip.
- **Palette Inspector**: Click any swatch to instantly copy its HEX code to your clipboard.

### 🤖 4. StudioBinder 8-Axis Cinematography AI
Powered by Gemini multimodal models, CineShot inspects shot geometry and visual semantics across the definitive 8 axes:
1. **Shot Size**: Extreme Wide (EWS), Wide (WS), Full (FS), Medium (MS), Medium Close-Up (MCU), Close-Up (CU), Extreme Close-Up (ECU).
2. **Camera Angle**: Eye Level, Low Angle, High Angle, Dutch / Canted, Overhead / Bird’s Eye, Aerial, Ground Level.
3. **Framing & Staging**: Single, Two-Shot, Over-the-Shoulder (OTS), Point-of-View (POV), Silhouette, Chiaroscuro.
4. **Camera Movement**: Static, Pan, Tilt, Dolly / Push-In / Pull-Out, Tracking, Crane / Jib, Steadicam, Handheld.
5. **Focus & Depth of Field**: Shallow Focus, Deep Focus, Rack Focus, Split Diopter, Tilt Shift.
6. **Compositional Mechanics**: Rule of Thirds, Center Framed / Symmetrical, Golden Ratio, Leading Lines, Frame-within-a-Frame.
7. **Lens Spec**: Ultra-Wide / Fisheye, Wide Prime (24–28mm), Standard / Normal (35–50mm), Telephoto (85mm+), Macro, Anamorphic.
8. **Lighting Setup**: High-Key, Low-Key Chiaroscuro, Backlight / Rim, Silhouette, Golden Hour Natural, Motivated Practical, Hard / Soft Light.

### 🍭 5. 100+ Eyecannndy Movie Techniques Encyclopedia
- **Technique Detection**: Identifies signature visual styles, kinetic camera rigs, and optical tricks (e.g., *Bolt Cam, Dolly Zoom, Snorricam, Bullet Time, Halation, Step-Print, Tableau, FPV Drone, Slit-Scan, Split Diopter, Datamosh, Match Cut*).
- **Interactive Encyclopedia**: Built-in searchable modal featuring definitions, visual cues, and iconic film references from the [eyecannndy.com](https://eyecannndy.com/) catalog.
- **Hot-Pink Technique Badges**: Click any detected technique in the shot inspector to immediately view its detailed historical context and examples.

### 📐 6. Shot Inspector & Composition Overlays
- **Interactive Grid Guides**: Toggle Rule of Thirds, Center Crosshair, and Golden Spiral (Fibonacci) overlays.
- **Aspect Ratio Letterboxing**: Preview your shot framed in 16:9 (HD), 2.39:1 (Anamorphic CinemaScope), 4:3 (Academy), 1:1 (Square), or 9:16 (Vertical Reel).
- **Metadata Sidebar**: Inspect timecodes, duration, color mood, directorial intent, and estimated confidence scores.

### 📦 7. Production-Grade Export Suite
- **Single Assets**: One-click download of individual PNG stills and animated GIFs.
- **Full Production ZIP**: Generates a packaged archive (`.zip`) via `jszip` containing:
  - All high-res shot stills (`shot_01.png`, `shot_02.png`, etc.)
  - All looping animated GIFs (`shot_01.gif`, `shot_02.gif`, etc.)
  - A structured JSON breakdown file (`shots_metadata.json`)
  - A CSV spreadsheet for production scheduling and shot lists (`shot_list.csv`)

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Backend API**: [Express](https://expressjs.com/) with TypeScript execution via `tsx` and production bundling via `esbuild`
- **AI Engine**: Google Gemini API via [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- **Animation & Icons**: [Motion](https://motion.dev/) & [Lucide React](https://lucide.dev/)
- **GIF Generation**: [`gifenc`](https://github.com/mattdesl/gifenc) (fast WebAssembly / pure JS GIF encoder)
- **Archiving**: [`jszip`](https://stuk.github.io/jszip/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**
- **Gemini API Key**: (Optional but recommended for AI shot identification; heuristic fallbacks are active if absent). Get a free key at [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cineshot.git
   cd cineshot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📖 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware in development mode (`port 3000`) |
| `npm run build` | Builds the client-side SPA with Vite and bundles `server.ts` into `dist/server.cjs` via esbuild |
| `npm start` | Runs the compiled production server from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| `npm run clean` | Cleans build artifacts (`dist/`) |

---

## 🧠 How It Works

```
                     ┌───────────────────────────┐
                     │   User Video / Demo File  │
                     └─────────────┬─────────────┘
                                   │
                    HTML5 Canvas Slicing Engine
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     [ Scene Keyframes ]    [ Looping GIFs ]    [ Dominant Palettes ]
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                     Gemini 2.5 Flash Vision API
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   StudioBinder 8-Axis Grammar             Eyecannndy Directorial FX
   (Angle, Size, Lens, Lighting)           (Dolly Zoom, Snorricam, etc.)
                                   │
                                   ▼
               Interactive Director Deck & Export Suite
```

1. **Scene Detection**: The video is sampled at a regular interval. Each frame is drawn to an offscreen HTML5 canvas where RGB luminance deltas are compared with previous frames. When difference exceeds the sensitivity threshold, a cut boundary is marked.
2. **Keyframe Capture**: Keyframes are rendered at optimal moments per shot and compressed to base64 for processing and preview.
3. **GIF Generation**: `gifenc` samples frames over the shot interval and quantizes colors with NeuQuant to produce lightweight, high-fidelity animated GIFs.
4. **Color Extraction**: Pixels are clustered to identify dominant hues and saturation curves, establishing a 5-color palette for each scene.
5. **AI Vision Analysis**: The server sends keyframe images to `gemini-2.5-flash` with a strict JSON schema enforcing StudioBinder terminology and Eyecannndy technique matching. If offline or quota-limited, intelligent heuristic rules provide immediate visual estimates.

---

## 🔌 API Reference

### `POST /api/analyze-shot`
Analyzes a single shot keyframe image.
- **Request Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,...",
    "shotNumber": 1,
    "timecode": "00:00:04"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "analysis": {
      "shotSize": "MCU",
      "angle": "Low Angle",
      "framing": "Single",
      "movement": "Push In",
      "focus": "Shallow Focus",
      "composition": "Center Framed / Symmetrical",
      "lens": "35mm Prime",
      "lighting": "Low Key / Chiaroscuro",
      "colorMood": "Teal and Amber High Contrast",
      "narrativeFunction": "Isolates the subject in emotional conflict.",
      "directorStyle": "Denis Villeneuve",
      "confidenceScore": 94,
      "eyecandyTechniques": ["DOLLY ZOOM", "HALATION"]
    }
  }
  ```

### `POST /api/batch-analyze-shots`
Analyzes up to 16 shots in parallel with rate-limit throttling.

### `GET /api/health`
Health check endpoint returning system status and uptime.

---

## 📁 Project Structure

```
├── server.ts                    # Express backend with Gemini API routes & Vite middleware
├── index.html                   # Application entry HTML
├── metadata.json                # Project configuration & permissions
├── package.json                 # Dependencies and build scripts
├── vite.config.ts               # Vite configuration
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # Main orchestration container & state
    ├── types.ts                 # TypeScript interfaces for shots, taxonomy & palette
    ├── index.css                # Tailwind CSS v4 styling
    ├── components/
    │   ├── Header.tsx           # Global navigation bar & export controls
    │   ├── VideoUploader.tsx    # Drag-and-drop video loader & sample demos
    │   ├── DetectionControls.tsx# Sensitivity, threshold & FPS sliders
    │   ├── DetectionProgress.tsx# Real-time scan progress bar
    │   ├── ShotsGallery.tsx     # Shot card grid, search & filters
    │   ├── ShotCard.tsx         # Individual shot thumbnail, badges & actions
    │   ├── ShotModal.tsx        # Shot inspector with grid overlays & metadata
    │   ├── ColorScriptView.tsx  # Timeline color script & film barcode
    │   └── TaxonomyReferenceModal.tsx # StudioBinder & Eyecannndy reference guide
    └── utils/
        ├── sceneDetector.ts     # HTML5 Canvas pixel difference scene detection
        ├── gifGenerator.ts      # Client-side GIF creator via gifenc
        ├── colorExtractor.ts    # 5-color dominant palette extraction
        ├── eyecandyTaxonomy.ts  # Eyecannndy 100+ techniques database & search
        ├── sampleVideos.ts      # Synthetic canvas video generator & presets
        └── exportUtils.ts       # ZIP archive & CSV list generation
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Feel free to:
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [StudioBinder](https://www.studiobinder.com/) for the foundational cinematography shot taxonomy and visual grammar guidelines.
- [Eyecannndy](https://eyecannndy.com/) for the visual directory of film techniques and creative references.
- [Google AI Studio](https://ai.google.dev/) for the Gemini 2.5 multimodal vision models.
- [Matt DesLauriers](https://github.com/mattdesl/gifenc) for the fast browser-based GIF encoding library `gifenc`.
