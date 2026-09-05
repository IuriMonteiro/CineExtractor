import React from "react";
import {
  Sliders,
  Folder,
  PlayCircle,
  Film,
  Clock,
  Gauge,
  Layers,
  Sparkles,
} from "lucide-react";
import { ExtractionConfig } from "../types";
import { formatTimecode } from "../utils/timeUtils";

interface DetectionControlsProps {
  config: ExtractionConfig;
  onChangeConfig: (updated: Partial<ExtractionConfig>) => void;
  onStartDetection: () => void;
  onCancelDetection: () => void;
  isDetecting: boolean;
  hasVideo: boolean;
  videoDuration?: number;
}

export const DetectionControls: React.FC<DetectionControlsProps> = ({
  config,
  onChangeConfig,
  onStartDetection,
  onCancelDetection,
  isDetecting,
  hasVideo,
  videoDuration = 0,
}) => {
  const maxShotsPresets = [
    { label: "∞ All Cuts", value: 0 },
    { label: "500", value: 500 },
    { label: "1,000", value: 1000 },
    { label: "5,000", value: 5000 },
    { label: "20,000", value: 20000 },
  ];

  return (
    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl mt-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <h3 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-bold">
            Scene Detection & Shot Extraction Engine
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {videoDuration > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-950 border border-white/10 text-neutral-400">
              Duration: {formatTimecode(videoDuration)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono hidden md:inline bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            {config.maxShots === 0 ? "Unlimited (All Cuts ∞)" : `Cap: ${config.maxShots.toLocaleString()} cuts`}
          </span>
        </div>
      </div>

      {/* Primary Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {/* 1. Shot Extraction Capacity (No Limits / Whatever is in the video) */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                Shot Capacity / Limit
              </label>
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                config.maxShots === 0
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                  : "bg-neutral-900 text-white border-white/10"
              }`}>
                {config.maxShots === 0 ? "∞ No Limit (All Cuts)" : `${config.maxShots.toLocaleString()} max`}
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1 mb-2.5">
              {maxShotsPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  disabled={isDetecting}
                  onClick={() => onChangeConfig({ maxShots: preset.value })}
                  className={`py-1 text-[9px] font-mono font-bold rounded transition-colors ${
                    config.maxShots === preset.value
                      ? "bg-white text-black"
                      : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom numerical input & range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={50000}
                step={50}
                value={config.maxShots === 0 ? "" : config.maxShots}
                placeholder="0 = Unlimited (All cuts)"
                disabled={isDetecting}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onChangeConfig({ maxShots: isNaN(val) || val <= 0 ? 0 : val });
                }}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
              />
              {config.maxShots !== 0 && (
                <button
                  type="button"
                  disabled={isDetecting}
                  onClick={() => onChangeConfig({ maxShots: 0 })}
                  className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors border border-white/10"
                  title="Remove limit and extract all cuts"
                >
                  Set ∞ All
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
            {config.maxShots === 0
              ? "Zero limits: Extracts every single scene cut in the video (1,000, 5,000, or 20,000+ shots)."
              : `Extracts up to ${config.maxShots.toLocaleString()} scene cuts before stopping.`}
          </p>
        </div>

        {/* 2. Scan Speed & Sampling Density */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-neutral-400" />
                Scan Density / Speed
              </label>
              <span className="font-mono text-white text-[11px] font-bold">
                {config.sampleFps <= 1.5
                  ? "Movie (1.0 fps)"
                  : config.sampleFps <= 3
                  ? "Balanced (2.5 fps)"
                  : "Precision (5.0 fps)"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <button
                type="button"
                disabled={isDetecting}
                onClick={() => onChangeConfig({ sampleFps: 1.0 })}
                className={`py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  config.sampleFps <= 1.5
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                }`}
                title="1 sample per second. Ultra fast for 30m - 2h movies without browser lag."
              >
                Movie (Fast)
              </button>
              <button
                type="button"
                disabled={isDetecting}
                onClick={() => onChangeConfig({ sampleFps: 2.5 })}
                className={`py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  config.sampleFps > 1.5 && config.sampleFps <= 3.5
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                }`}
                title="2.5 samples per second. Best for 5 to 15 minute clips."
              >
                Balanced
              </button>
              <button
                type="button"
                disabled={isDetecting}
                onClick={() => onChangeConfig({ sampleFps: 5.0 })}
                className={`py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  config.sampleFps > 3.5
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                }`}
                title="5 samples per second. High precision for short 1-3 min trailers or music videos."
              >
                Precision
              </button>
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
            Movie mode scans 1-2 hour films in just 1-2 minutes by stepping at 1-second intervals.
          </p>
        </div>

        {/* 3. Scan Range (Full Video vs Time Range) */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Scan Range Window
              </label>
              <span className="font-mono text-neutral-400 text-[10px]">
                {config.scanRangeMode === "full" ? "Full Duration" : "Custom Window"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2.5">
              <button
                type="button"
                disabled={isDetecting}
                onClick={() => onChangeConfig({ scanRangeMode: "full" })}
                className={`py-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  config.scanRangeMode === "full"
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                }`}
              >
                Full Video
              </button>
              <button
                type="button"
                disabled={isDetecting}
                onClick={() =>
                  onChangeConfig({
                    scanRangeMode: "range",
                    startTime: config.startTime || 0,
                    endTime: config.endTime || (videoDuration > 0 ? Math.min(videoDuration, 600) : 300),
                  })
                }
                className={`py-1 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all ${
                  config.scanRangeMode === "range"
                    ? "bg-white text-black"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
                }`}
              >
                Time Window
              </button>
            </div>

            {/* Custom Range Inputs */}
            {config.scanRangeMode === "range" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                    Start ({formatTimecode(config.startTime)})
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration > 0 ? videoDuration - 10 : 3600}
                    step={10}
                    value={config.startTime}
                    disabled={isDetecting}
                    onChange={(e) =>
                      onChangeConfig({ startTime: Math.max(0, parseInt(e.target.value)) })
                    }
                    className="w-full accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                    End ({formatTimecode(config.endTime || videoDuration || 600)})
                  </span>
                  <input
                    type="range"
                    min={config.startTime + 10}
                    max={videoDuration > 0 ? videoDuration : 7200}
                    step={10}
                    value={config.endTime || videoDuration || 600}
                    disabled={isDetecting}
                    onChange={(e) =>
                      onChangeConfig({ endTime: parseInt(e.target.value) })
                    }
                    className="w-full accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
            {config.scanRangeMode === "full"
              ? "Scans the entire film from beginning to end."
              : `Scanning window: ${formatTimecode(config.startTime)} → ${formatTimecode(
                  config.endTime || videoDuration
                )}`}
          </p>
        </div>
      </div>

      {/* Secondary Controls Grid (Sensitivity, Min Shot, Target, Folder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sensitivity */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Sensitivity
            </label>
            <span className="font-mono text-white text-[11px] font-bold">
              {config.sensitivity}{" "}
              {config.sensitivity < 22
                ? "(High)"
                : config.sensitivity > 30
                ? "(Strict)"
                : "(Balanced)"}
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
            Lower captures subtle cuts; higher triggers hard cuts only.
          </p>
        </div>

        {/* Min Shot Duration */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Min Shot Length
            </label>
            <span className="font-mono text-white text-[11px] font-bold">
              {config.minShotDuration.toFixed(1)}s
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={3.0}
            step={0.1}
            value={config.minShotDuration}
            disabled={isDetecting}
            onChange={(e) => onChangeConfig({ minShotDuration: parseFloat(e.target.value) })}
            className="w-full accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-neutral-500 mt-2">
            Filters out camera shake and strobe flash micro-cuts.
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
            {config.exportMode === "both"
              ? "Captures crisp JPG keyframes with on-demand GIFs."
              : config.exportMode === "images"
              ? "High-speed keyframe captures (fastest)."
              : "Generates animated loops for shots."}
          </p>
        </div>

        {/* Designated Folder Name */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-white/5">
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-neutral-400" />
            ZIP Package Folder
          </label>
          <input
            type="text"
            value={config.folderName}
            disabled={isDetecting}
            onChange={(e) =>
              onChangeConfig({ folderName: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "_") })
            }
            placeholder="CineShot_Project"
            className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
          />
          <p className="text-[10px] text-neutral-500 mt-2">
            Root folder inside downloaded ZIP archive.
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Ready to scan • Up to {config.maxShots} shots • {config.sampleFps <= 1.5 ? "Movie Speed" : config.sampleFps <= 3 ? "Balanced Speed" : "Precision Speed"}
          </span>
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
