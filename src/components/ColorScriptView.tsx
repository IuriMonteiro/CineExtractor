import React, { useRef, useState, useEffect } from "react";
import {
  Palette,
  Sparkles,
  Download,
  ArrowLeft,
  Sun,
  Moon,
  TrendingUp,
  Activity,
  Layers,
  Loader2,
  Copy,
  Info,
} from "lucide-react";
import { Shot } from "../types";
import { downloadDataUrl } from "../utils/exportUtils";

interface ColorScriptViewProps {
  shots: Shot[];
  onBackToShots: () => void;
  videoTitle?: string;
}

export const ColorScriptView: React.FC<ColorScriptViewProps> = ({
  shots,
  onBackToShots,
  videoTitle = "Cinematic Sequence",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [selectedShotIndex, setSelectedShotIndex] = useState<number | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Generate Panoramic Color Script Canvas
  const renderColorScriptCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || shots.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const totalWidth = Math.max(1200, shots.length * 140);
    const totalHeight = 440;
    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Dark cinematic background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Title Header on banner
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`CINEMATIC COLOR SCRIPT • ${videoTitle.toUpperCase()}`, 30, 40);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      `${shots.length} SCENE CUTS • CHRONOLOGICAL EMOTIONAL HARMONY & PALETTE PROGRESSION`,
      30,
      60
    );

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 75);
    ctx.lineTo(totalWidth - 30, 75);
    ctx.stroke();

    const startX = 30;
    const startY = 95;
    const blockWidth = (totalWidth - 60) / shots.length;
    const thumbHeight = 110;
    const paletteHeight = 160;

    shots.forEach((shot, index) => {
      const x = startX + index * blockWidth;

      // 1. Draw thumbnail
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 2, startY, blockWidth - 4, thumbHeight);
        ctx.clip();
        ctx.drawImage(img, x + 2, startY, blockWidth - 4, thumbHeight);
        ctx.restore();

        // Thumbnail border
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.strokeRect(x + 2, startY, blockWidth - 4, thumbHeight);
      };
      img.src = shot.keyframeDataUrl;

      // 2. Draw Color Palette vertical stripes
      const stripeY = startY + thumbHeight + 10;
      const stripeHeight = paletteHeight / shot.palette.length;

      shot.palette.forEach((hex, pIndex) => {
        ctx.fillStyle = hex;
        ctx.fillRect(x + 2, stripeY + pIndex * stripeHeight, blockWidth - 4, stripeHeight);
      });

      // 3. Draw Shot Number & Timecode label below
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`S#${shot.shotNumber}`, x + 4, stripeY + paletteHeight + 18);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.fillText(`${shot.duration}s`, x + 4, stripeY + paletteHeight + 32);
    });

    // Wave / Temperature Curve at bottom
    const curveY = 390;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    shots.forEach((shot, i) => {
      const x = startX + i * blockWidth + blockWidth / 2;
      const y = curveY - shot.warmth * 25;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.fillText("TEMPERATURE ARC: COOL (CYAN/BLUE) ↔ WARM (GOLDEN/RED)", 30, 425);
  };

  useEffect(() => {
    renderColorScriptCanvas();
  }, [shots, videoTitle]);

  // AI Art Director Color Script Analysis
  const handleAnalyzeColorScript = async () => {
    try {
      setIsLoadingAI(true);
      const palettes = shots.map((s) => ({
        shotNumber: s.shotNumber,
        timecode: `${Math.floor(s.startTime / 60)}:${Math.floor(s.startTime % 60)}`,
        dominantColor: s.dominantColor,
        palette: s.palette,
        warmth: s.warmth,
        luminance: s.luminance,
        analysis: s.analysis
          ? {
              shotSize: s.analysis.shotSize,
              lighting: s.analysis.lighting,
              colorMood: s.analysis.colorMood,
            }
          : null,
      }));

      const res = await fetch("/api/analyze-color-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          palettes,
          totalShots: shots.length,
          duration: `${shots[shots.length - 1]?.endTime || 0} seconds`,
        }),
      });

      const data = await res.json();
      if (data.scriptNarrative) {
        setAiAnalysis(data.scriptNarrative);
      }
    } catch (err) {
      console.error("Failed to analyze color script:", err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    downloadDataUrl(dataUrl, `ColorScript_${videoTitle.replace(/\s+/g, "_")}.png`);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Calculate overall metrics
  const avgWarmth =
    shots.reduce((acc, s) => acc + s.warmth, 0) / (shots.length || 1);
  const avgLuminance =
    shots.reduce((acc, s) => acc + s.luminance, 0) / (shots.length || 1);

  return (
    <div className="mt-8 space-y-6">
      {/* Header & Actions */}
      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <button
            onClick={onBackToShots}
            className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Extracted Shots
          </button>
          <h2 className="text-2xl font-serif italic text-white flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-neutral-400" />
            Cinematic Color Script
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
            Sequential chromatic journey tracking emotional transitions, temperature drift, and lighting arcs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="ai-color-script-btn"
            onClick={handleAnalyzeColorScript}
            disabled={isLoadingAI || shots.length === 0}
            className="px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-black bg-white hover:bg-neutral-200 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Interpreting Visual Arc...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Art Director Breakdown (AI)</span>
              </>
            )}
          </button>

          <button
            id="export-color-script-canvas-btn"
            onClick={handleDownloadCanvas}
            className="px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-white border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export Banner (PNG)</span>
          </button>
        </div>
      </div>

      {/* Panoramic Color Script Interactive Ribbon */}
      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-300">
              Sequential Color Script Timeline
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
            Click any column to inspect
          </span>
        </div>

        {/* Scrollable Panoramic Strip */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div
            className="flex gap-2 min-w-max p-2.5 bg-neutral-950 rounded-xl border border-white/5"
            style={{ minWidth: `${Math.max(900, shots.length * 110)}px` }}
          >
            {shots.map((shot, idx) => (
              <div
                key={shot.id}
                onClick={() => setSelectedShotIndex(idx)}
                className={`w-24 sm:w-28 flex flex-col rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${
                  selectedShotIndex === idx
                    ? "border-white ring-1 ring-white/40 scale-[1.02]"
                    : "border-white/5 hover:border-white/20 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Thumbnail */}
                <div className="h-16 bg-neutral-900 overflow-hidden relative">
                  <img
                    src={shot.keyframeDataUrl}
                    alt={`Shot ${shot.shotNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-white font-bold border border-white/10">
                    #{shot.shotNumber}
                  </span>
                </div>

                {/* Vertical Color Stripes */}
                <div className="flex flex-col h-28">
                  {shot.palette.map((color, cIdx) => (
                    <div
                      key={cIdx}
                      style={{ backgroundColor: color }}
                      className="flex-1 w-full hover:brightness-110 transition-all relative group"
                      title={`${color}`}
                    />
                  ))}
                </div>

                {/* Mood Tag */}
                <div className="p-1.5 bg-neutral-950 text-center border-t border-white/5">
                  <span className="text-[9px] font-serif italic text-neutral-400 truncate block">
                    {shot.analysis?.colorMood || `${(shot.luminance * 100).toFixed(0)}% Lum`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Shot Detail Inspection */}
        {selectedShotIndex !== null && shots[selectedShotIndex] && (
          <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-4">
              <img
                src={shots[selectedShotIndex].keyframeDataUrl}
                alt="Selected"
                className="w-24 h-14 rounded-lg object-cover border border-white/10"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif italic text-base text-white">
                    Shot #{shots[selectedShotIndex].shotNumber}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ({shots[selectedShotIndex].duration}s)
                  </span>
                </div>
                <p className="text-xs font-serif italic text-neutral-300 mt-0.5">
                  {shots[selectedShotIndex].analysis?.colorMood || "Dominant Mood Palette"}
                </p>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2">
              {shots[selectedShotIndex].palette.map((color, i) => (
                <button
                  key={i}
                  onClick={() => copyHex(color)}
                  style={{ backgroundColor: color }}
                  className="w-8 h-8 rounded border border-white/10 hover:scale-110 transition-transform shadow flex items-center justify-center group"
                  title={`Click to copy ${color}`}
                >
                  <span className="text-[8px] font-mono text-white/90 bg-black/70 px-1 rounded opacity-0 group-hover:opacity-100">
                    Copy
                  </span>
                </button>
              ))}
              {copiedHex && (
                <span className="text-[10px] font-mono text-white ml-2">
                  Copied {copiedHex}!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Offscreen / Render Canvas for Export */}
      <div className="hidden">
        <canvas ref={canvasRef} />
      </div>

      {/* Cinematic Color Arc & Temperature Wave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Temperature Balance */}
        <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-neutral-400" />
              Thermal Bias
            </span>
            <span className="text-xs font-serif italic text-white">
              {avgWarmth > 0.1 ? "Warm Amber Dominant" : avgWarmth < -0.1 ? "Cool Cyan Dominant" : "Neutral Balanced"}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-neutral-950 border border-white/10 relative my-3 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow"
              style={{ left: `${Math.max(5, Math.min(95, ((avgWarmth + 1) / 2) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 leading-relaxed">
            Measures psychological color temperature. Warm tones evoke intimacy or tension; cool blues convey isolation.
          </p>
        </div>

        {/* Metric 2: Average Luminance */}
        <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-neutral-400" />
              Key Lighting Contrast
            </span>
            <span className="text-xs font-serif italic text-white">
              {(avgLuminance * 100).toFixed(0)}% Luminance
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-neutral-950 border border-white/10 relative my-3 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow"
              style={{ left: `${Math.max(5, Math.min(95, avgLuminance * 100))}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 leading-relaxed">
            Distinguishes Low-Key shadow chiaroscuro (film noir) from High-Key illuminated daylight.
          </p>
        </div>

        {/* Metric 3: Sequence Density */}
        <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              Rhythmic Pacing
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {(shots.reduce((a, b) => a + b.duration, 0) / (shots.length || 1)).toFixed(1)}s / shot
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-400 text-[10px] uppercase tracking-widest">
              <span>Fastest Cut:</span>
              <span className="text-white font-mono font-semibold">
                {Math.min(...shots.map((s) => s.duration))}s
              </span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[10px] uppercase tracking-widest">
              <span>Longest Take:</span>
              <span className="text-white font-mono font-semibold">
                {Math.max(...shots.map((s) => s.duration))}s
              </span>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-2 leading-relaxed">
            Color continuity is anchored by editorial pacing across shot transitions.
          </p>
        </div>
      </div>

      {/* AI Pixar-Style Art Direction Analysis Section */}
      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-neutral-400" />
            <div>
              <h3 className="text-sm font-serif italic text-white">
                Pixar-Style Color Script Director Analysis
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                Narrative color theory, chromatic tensions, and psychological arc evaluation
              </p>
            </div>
          </div>

          {!aiAnalysis && (
            <button
              id="request-ai-color-analysis-btn"
              onClick={handleAnalyzeColorScript}
              disabled={isLoadingAI}
              className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold text-black bg-white hover:bg-neutral-200 transition-colors shadow flex items-center gap-1.5 disabled:opacity-40"
            >
              {isLoadingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate Analysis
            </button>
          )}
        </div>

        {isLoadingAI ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-3" />
            <p className="font-serif italic text-white text-base">
              Synthesizing Color Theory & Directorial Grammar...
            </p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1 max-w-md mx-auto">
              Evaluating chroma transitions and emotional tension arcs across {shots.length} shots.
            </p>
          </div>
        ) : aiAnalysis ? (
          <div className="bg-neutral-950 p-6 rounded-xl border border-white/5 font-serif italic text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
            {aiAnalysis}
          </div>
        ) : (
          <div className="py-10 text-center text-neutral-500 text-xs">
            <Info className="w-5 h-5 text-neutral-600 mx-auto mb-2" />
            <p className="font-serif italic text-neutral-400">
              Click "Generate Analysis" above to have Gemini provide a full art director breakdown of how this sequence's color palette tells the story.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
