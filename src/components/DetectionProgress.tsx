import React from "react";
import { Film, CheckCircle2 } from "lucide-react";
import { formatTimecode } from "../utils/timeUtils";

interface DetectionProgressProps {
  percentage: number;
  currentSecond: number;
  totalSeconds: number;
  shotsFound: number;
  stage: string;
}

export const DetectionProgress: React.FC<DetectionProgressProps> = ({
  percentage,
  currentSecond,
  totalSeconds,
  shotsFound,
  stage,
}) => {
  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl my-5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <div>
            <h4 className="text-sm font-serif italic text-white">
              {stage || "Scanning video frames for scene transitions..."}
            </h4>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-0.5">
              Histogram delta & high-resolution keyframe capture
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-white tracking-tight">
            {percentage}%
          </span>
          <p className="text-[10px] font-mono text-neutral-400">
            {formatTimecode(currentSecond)} / {formatTimecode(totalSeconds)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5 mb-5">
        <div
          className="h-full bg-white transition-all duration-150 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats counter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 block font-bold">
            Shots Discovered
          </span>
          <span className="text-lg font-serif italic text-white flex items-center gap-2 mt-1">
            <Film className="w-4 h-4 text-neutral-400" />
            {shotsFound}
          </span>
        </div>

        <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 block font-bold">
            Current Pass
          </span>
          <span className="text-xs font-serif italic text-neutral-200 mt-1 block">
            {percentage < 50 ? "Boundary Transition Scan" : "Color & Keyframe Extraction"}
          </span>
        </div>

        <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 block font-bold">
            Status
          </span>
          <span className="text-xs font-mono text-neutral-300 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            Client Pipeline Active
          </span>
        </div>
      </div>
    </div>
  );
};
