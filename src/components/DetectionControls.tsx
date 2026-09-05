import React from "react";
import { Sliders, Folder, PlayCircle, Image, Sparkles, Film } from "lucide-react";
import { ExtractionConfig } from "../types";

interface DetectionControlsProps {
  config: ExtractionConfig;
  onChangeConfig: (updated: Partial<ExtractionConfig>) => void;
  onStartDetection: () => void;
  onCancelDetection: () => void;
  isDetecting: boolean;
  hasVideo: boolean;
}

export const DetectionControls: React.FC<DetectionControlsProps> = ({
  config,
  onChangeConfig,
  onStartDetection,
  onCancelDetection,
  isDetecting,
  hasVideo,
}) => {
  return (
    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl mt-5">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-bold">
            Scene Extraction & Detection Parameters
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono hidden sm:inline">
          Chrominance & Luminance Delta Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sensitivity */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Sensitivity
            </label>
            <span className="font-mono text-white text-[11px] font-bold">
              {config.sensitivity} {config.sensitivity < 22 ? "(High)" : config.sensitivity > 30 ? "(Strict)" : "(Balanced)"}
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={45}
            step={1}
            value={config.sensitivity}
            disabled={isDetecting}
            onChange={(e) => onChangeConfig({ sensitivity: parseInt(e.target.value) })}
            className="w-full accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-neutral-500 mt-2">
            Lower threshold triggers subtle transitions; higher captures hard cuts only.
          </p>
        </div>

        {/* Min Shot Duration */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Min Length
            </label>
            <span className="font-mono text-white text-[11px] font-bold">
              {config.minShotDuration.toFixed(1)}s
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={2.5}
            step={0.1}
            value={config.minShotDuration}
            disabled={isDetecting}
            onChange={(e) => onChangeConfig({ minShotDuration: parseFloat(e.target.value) })}
            className="w-full accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-neutral-500 mt-2">
            Eliminates camera whip pans and flash micro-cuts.
          </p>
        </div>

        {/* Output Mode (Screens, GIFs, Both) */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
            Extraction Target
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onChangeConfig({ exportMode: "images" })}
              disabled={isDetecting}
              className={`text-[10px] uppercase tracking-wider py-1.5 rounded-lg font-bold transition-all ${
                config.exportMode === "images"
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              Screens
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ exportMode: "gifs" })}
              disabled={isDetecting}
              className={`text-[10px] uppercase tracking-wider py-1.5 rounded-lg font-bold transition-all ${
                config.exportMode === "gifs"
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              GIFs
            </button>
            <button
              type="button"
              onClick={() => onChangeConfig({ exportMode: "both" })}
              disabled={isDetecting}
              className={`text-[10px] uppercase tracking-wider py-1.5 rounded-lg font-bold transition-all ${
                config.exportMode === "both"
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              Both
            </button>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2">
            Extract still frames, animated GIFs, or both.
          </p>
        </div>

        {/* Designated Folder Name */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-neutral-400" />
            Designated Folder
          </label>
          <input
            type="text"
            value={config.folderName}
            disabled={isDetecting}
            onChange={(e) => onChangeConfig({ folderName: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "_") })}
            placeholder="CineShot_Project"
            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
          />
          <p className="text-[10px] text-neutral-500 mt-2">
            Root directory name inside downloaded ZIP package.
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ready to detect scene changes & synthesize color script</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isDetecting ? (
            <button
              id="cancel-detect-btn"
              onClick={onCancelDetection}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
            >
              Cancel Scanning
            </button>
          ) : (
            <button
              id="start-detect-btn"
              onClick={onStartDetection}
              disabled={!hasVideo}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold text-black bg-white hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Auto-Detect Scene Changes & Extract Shots</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
