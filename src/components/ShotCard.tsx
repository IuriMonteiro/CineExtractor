import React, { useState } from "react";
import {
  Download,
  Film,
  Sparkles,
  Maximize2,
  Loader2,
  Copy,
  Check,
  Play,
  RotateCcw,
} from "lucide-react";
import { Shot } from "../types";
import { downloadDataUrl } from "../utils/exportUtils";

interface ShotCardProps {
  shot: Shot;
  onOpenModal: (shot: Shot) => void;
  onAnalyzeShot: (shot: Shot) => void;
  onGenerateGif: (shot: Shot) => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  onOpenModal,
  onAnalyzeShot,
  onGenerateGif,
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  const handleCopyHex = (color: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadDataUrl(
      shot.keyframeDataUrl,
      `shot_${shot.shotNumber.toString().padStart(3, "0")}.jpg`
    );
  };

  const handleDownloadGif = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shot.gifDataUrl) {
      downloadDataUrl(
        shot.gifDataUrl,
        `shot_${shot.shotNumber.toString().padStart(3, "0")}.gif`
      );
    }
  };

  return (
    <div
      id={`shot-card-${shot.shotNumber}`}
      className="bg-neutral-900/60 border border-white/10 hover:border-white/30 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-2xl flex flex-col group"
    >
      {/* Visual Preview (Keyframe or GIF) */}
      <div
        className="relative aspect-video bg-neutral-950 overflow-hidden cursor-pointer"
        onClick={() => onOpenModal(shot)}
        onMouseEnter={() => {
          if (shot.gifDataUrl) setShowGif(true);
        }}
        onMouseLeave={() => {
          if (shot.gifDataUrl) setShowGif(false);
        }}
      >
        <img
          src={showGif && shot.gifDataUrl ? shot.gifDataUrl : shot.keyframeDataUrl}
          alt={`Shot #${shot.shotNumber}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono uppercase tracking-widest font-bold text-white border border-white/10">
            SHOT #{shot.shotNumber.toString().padStart(2, "0")}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-neutral-400 border border-white/10">
            {shot.duration}s
          </span>
        </div>

        {/* GIF Indicator or Generator indicator */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {shot.gifDataUrl ? (
            <span className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-wider shadow">
              GIF
            </span>
          ) : shot.isGifGenerating ? (
            <span className="px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 border border-white/20">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> GIF
            </span>
          ) : null}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(shot);
            }}
            className="w-6 h-6 rounded bg-black/70 hover:bg-black text-neutral-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            title="Inspect Shot Fullscreen"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Timecode banner */}
        <div className="absolute bottom-2 left-2.5 text-[9px] font-mono text-white/80 bg-black/80 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
          {formatTimecode(shot.startTime)} → {formatTimecode(shot.endTime)}
        </div>
      </div>

      {/* Dominant Color Palette Ribbon */}
      <div className="flex h-1.5 w-full bg-neutral-950 relative">
        {shot.palette.map((hex, i) => (
          <div
            key={i}
            onClick={(e) => handleCopyHex(hex, e)}
            style={{ backgroundColor: hex }}
            className="flex-1 h-full cursor-pointer hover:opacity-80 transition-opacity relative group/color"
            title={`Click to copy: ${hex}`}
          >
            {copiedColor === hex && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-950 text-white text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/30 shadow z-10 whitespace-nowrap">
                {hex}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Shot Metadata & Taxonomy */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Cinematography Taxonomy Tags in Editorial Rows */}
          {shot.analysis ? (
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Shot Size</span>
                <span className="text-xs font-serif italic text-white">{shot.analysis.shotSize || "Standard"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Angle</span>
                <span className="text-xs font-serif italic text-white">{shot.analysis.angle || "Eye Level"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Lighting</span>
                <span className="text-xs font-serif italic text-white">{shot.analysis.lighting || "Natural"}</span>
              </div>

              {shot.analysis.colorMood && (
                <p className="text-[10px] text-neutral-400 font-serif italic pt-1 truncate">
                  "{shot.analysis.colorMood}"
                </p>
              )}
            </div>
          ) : (
            <div className="mb-3 py-1">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                Unclassified optics
              </p>
              <button
                id={`identify-shot-btn-${shot.shotNumber}`}
                onClick={() => onAnalyzeShot(shot)}
                disabled={shot.isAnalyzing}
                className="w-full py-2 px-3 rounded-lg text-[10px] uppercase tracking-[0.15em] font-bold text-white border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {shot.isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing StudioBinder...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Identify Shot (AI)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1">
            {/* Download Still Frame */}
            <button
              onClick={handleDownloadImage}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Download Keyframe Screenshot (JPG)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Generate or Download GIF */}
            {shot.gifDataUrl ? (
              <button
                onClick={handleDownloadGif}
                className="px-2 py-1 rounded border border-white/20 hover:border-white text-white text-[9px] font-mono uppercase flex items-center gap-1 transition-colors"
                title="Download Animated GIF"
              >
                <Download className="w-3 h-3" />
                <span>Save GIF</span>
              </button>
            ) : (
              <button
                onClick={() => onGenerateGif(shot)}
                disabled={shot.isGifGenerating}
                className="px-2 py-1 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white text-[9px] font-mono uppercase flex items-center gap-1 border border-white/10 transition-colors disabled:opacity-40"
                title="Create animated GIF of this shot"
              >
                {shot.isGifGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Film className="w-3 h-3" />
                )}
                <span>Make GIF</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenModal(shot)}
            className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-white transition-colors"
          >
            Inspect →
          </button>
        </div>
      </div>
    </div>
  );
};
