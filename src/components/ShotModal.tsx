import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Download,
  Film,
  Grid,
  Maximize,
  Compass,
  Sun,
  Camera,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Shot } from "../types";
import { downloadDataUrl } from "../utils/exportUtils";

interface ShotModalProps {
  shot: Shot | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onAnalyzeShot: (shot: Shot) => void;
  onGenerateGif: (shot: Shot) => void;
}

export const ShotModal: React.FC<ShotModalProps> = ({
  shot,
  onClose,
  onNext,
  onPrev,
  onAnalyzeShot,
  onGenerateGif,
}) => {
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);
  const [showCenterCross, setShowCenterCross] = useState(false);
  const [showAnamorphicMask, setShowAnamorphicMask] = useState(false);
  const [activeMedia, setActiveMedia] = useState<"frame" | "gif">("frame");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!shot) return null;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const frames = Math.floor((s % 1) * 24);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const analysis = shot.analysis;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div
        className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-white border border-white/15">
              SHOT #{shot.shotNumber.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono hidden sm:inline">
              TC: {formatTime(shot.startTime)} → {formatTime(shot.endTime)} ({shot.duration}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                onClick={onPrev}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-white/5"
                title="Previous Shot (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-white/5"
                title="Next Shot (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-white/5 ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Main Visual Stage (Columns 7) */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-neutral-950/60 border-b lg:border-b-0 lg:border-r border-white/10">
            <div>
              {/* Overlay guides toolbar */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRuleOfThirds(!showRuleOfThirds)}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 border ${
                      showRuleOfThirds
                        ? "bg-white text-black border-white"
                        : "bg-neutral-900 text-neutral-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <Grid className="w-3 h-3" />
                    Rule of Thirds
                  </button>

                  <button
                    onClick={() => setShowCenterCross(!showCenterCross)}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 border ${
                      showCenterCross
                        ? "bg-white text-black border-white"
                        : "bg-neutral-900 text-neutral-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <Maximize className="w-3 h-3" />
                    Center Cross
                  </button>

                  <button
                    onClick={() => setShowAnamorphicMask(!showAnamorphicMask)}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 border ${
                      showAnamorphicMask
                        ? "bg-white text-black border-white"
                        : "bg-neutral-900 text-neutral-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    2.39:1 Mask
                  </button>
                </div>

                {/* Switch between Still and GIF */}
                {shot.gifDataUrl && (
                  <div className="flex items-center bg-neutral-900 border border-white/10 rounded-full p-0.5 text-[9px] font-mono">
                    <button
                      onClick={() => setActiveMedia("frame")}
                      className={`px-2.5 py-0.5 rounded-full uppercase ${
                        activeMedia === "frame" ? "bg-white text-black font-bold" : "text-neutral-400"
                      }`}
                    >
                      Frame
                    </button>
                    <button
                      onClick={() => setActiveMedia("gif")}
                      className={`px-2.5 py-0.5 rounded-full uppercase ${
                        activeMedia === "gif" ? "bg-white text-black font-bold" : "text-neutral-400"
                      }`}
                    >
                      GIF
                    </button>
                  </div>
                )}
              </div>

              {/* Viewport */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center">
                <img
                  src={activeMedia === "gif" && shot.gifDataUrl ? shot.gifDataUrl : shot.keyframeDataUrl}
                  alt={`Shot #${shot.shotNumber}`}
                  className="w-full h-full object-contain"
                />

                {/* Rule of Thirds Overlay */}
                {showRuleOfThirds && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/40"></div>
                    <div className="border-r border-b border-white/40"></div>
                    <div className="border-b border-white/40"></div>
                    <div className="border-r border-b border-white/40"></div>
                    <div className="border-r border-b border-white/40"></div>
                    <div className="border-b border-white/40"></div>
                    <div className="border-r border-b border-white/40"></div>
                    <div className="border-r border-b border-white/40"></div>
                    <div></div>
                  </div>
                )}

                {/* Center Crosshair Overlay */}
                {showCenterCross && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="absolute w-full h-[1px] bg-white/30"></div>
                    <div className="absolute h-full w-[1px] bg-white/30"></div>
                  </div>
                )}

                {/* Anamorphic 2.39:1 Letterbox Overlay */}
                {showAnamorphicMask && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                    <div className="h-[12%] bg-black"></div>
                    <div className="h-[12%] bg-black"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDataUrl(shot.keyframeDataUrl, `shot_${shot.shotNumber}.jpg`)}
                  className="px-3.5 py-1.5 rounded-full border border-white/20 hover:bg-white hover:text-black text-[10px] uppercase tracking-widest font-bold text-white flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save JPG
                </button>

                {shot.gifDataUrl ? (
                  <button
                    onClick={() => downloadDataUrl(shot.gifDataUrl!, `shot_${shot.shotNumber}.gif`)}
                    className="px-3.5 py-1.5 rounded-full border border-white/20 hover:bg-white hover:text-black text-[10px] uppercase tracking-widest font-bold text-white flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save GIF
                  </button>
                ) : (
                  <button
                    onClick={() => onGenerateGif(shot)}
                    disabled={shot.isGifGenerating}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-[10px] uppercase tracking-widest font-bold text-neutral-300 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  >
                    {shot.isGifGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Film className="w-3.5 h-3.5" />
                    )}
                    Generate GIF
                  </button>
                )}
              </div>

              <button
                onClick={() => onAnalyzeShot(shot)}
                disabled={shot.isAnalyzing}
                className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors shadow disabled:opacity-40"
              >
                {shot.isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {analysis ? "Re-Analyze (AI)" : "Identify Cinematography (AI)"}
              </button>
            </div>
          </div>

          {/* StudioBinder Cinematography Breakdown Panel (Columns 5) */}
          <div className="lg:col-span-5 p-6 bg-neutral-950 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold flex items-center gap-2">
                  <Compass className="w-4 h-4 text-neutral-400" />
                  StudioBinder & Eyecannndy Identifier
                </h4>
                {analysis?.confidenceScore && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-white/10">
                    {analysis.confidenceScore}% match
                  </span>
                )}
              </div>

              {analysis ? (
                <div className="space-y-4">
                  {/* Grid of 8 Cinematography dimensions styled as Editorial Spec Rows */}
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">1. Shot Size</span>
                      <span className="text-xs font-serif italic text-white">{analysis.shotSize || "Standard"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">2. Camera Angle</span>
                      <span className="text-xs font-serif italic text-white">{analysis.angle || "Eye Level"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">3. Framing / Staging</span>
                      <span className="text-xs font-serif italic text-white">{analysis.framing || "Single"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">4. Movement</span>
                      <span className="text-xs font-serif italic text-white">{analysis.movement || "Static"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">5. Focus & Depth</span>
                      <span className="text-xs font-serif italic text-white">{analysis.focus || "Deep Focus"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">6. Composition</span>
                      <span className="text-xs font-serif italic text-white">{analysis.composition || "Rule of Thirds"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">7. Lens Optics</span>
                      <span className="text-xs font-serif italic text-white">{analysis.lens || "Normal (35-50mm)"}</span>
                    </div>

                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">8. Lighting Setup</span>
                      <span className="text-xs font-serif italic text-white">{analysis.lighting || "Chiaroscuro / Low Key"}</span>
                    </div>
                  </div>

                  {/* Mood & Narrative Function */}
                  {analysis.colorMood && (
                    <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold mb-1">
                        Atmospheric Tone
                      </span>
                      <p className="text-xs font-serif italic text-neutral-200">
                        "{analysis.colorMood}"
                      </p>
                    </div>
                  )}

                  {analysis.narrativeFunction && (
                    <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold mb-1">
                        Director & Narrative Intent
                      </span>
                      <p className="text-xs font-serif italic text-neutral-300 leading-relaxed">
                        {analysis.narrativeFunction}
                      </p>
                      {analysis.directorStyle && (
                        <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 mt-2">
                          Ref: {analysis.directorStyle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-neutral-900/40 border border-white/5 text-center">
                  <Camera className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
                  <p className="font-serif italic text-white text-base mb-1">
                    Unclassified Shot Optics
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-5 leading-relaxed">
                    Identify optics across all 8 StudioBinder dimensions using Gemini multimodal vision.
                  </p>
                  <button
                    onClick={() => onAnalyzeShot(shot)}
                    disabled={shot.isAnalyzing}
                    className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-black bg-white hover:bg-neutral-200 transition-colors shadow flex items-center gap-1.5 mx-auto"
                  >
                    {shot.isAnalyzing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Identify with StudioBinder
                  </button>
                </div>
              )}

              {/* Color Script Palette Details */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
                    Extracted Chrominance Palette
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    L: {(shot.luminance * 100).toFixed(0)}% • W: {shot.warmth > 0 ? `+${(shot.warmth * 100).toFixed(0)}` : (shot.warmth * 100).toFixed(0)}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 h-10 mb-2">
                  {shot.palette.map((color, i) => (
                    <div
                      key={i}
                      onClick={() => copyHex(color)}
                      style={{ backgroundColor: color }}
                      className="h-full rounded border border-white/10 cursor-pointer flex items-end justify-center pb-1 group transition-transform hover:scale-105 relative"
                      title={`Click to copy: ${color}`}
                    >
                      <span className="text-[9px] font-mono text-white/90 bg-black/70 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>

                {copiedHex && (
                  <p className="text-[9px] text-center text-white font-mono mt-1">
                    Copied {copiedHex} to clipboard
                  </p>
                )}
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-widest font-mono text-neutral-600 text-center mt-4">
              Left / Right arrows to navigate • Esc to dismiss
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
