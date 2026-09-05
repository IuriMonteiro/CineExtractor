import React, { useState } from "react";
import {
  Film,
  Sparkles,
  Download,
  Filter,
  Palette,
  CheckCircle2,
  Loader2,
  FolderDown,
} from "lucide-react";
import { Shot } from "../types";
import { ShotCard } from "./ShotCard";

interface ShotsGalleryProps {
  shots: Shot[];
  onOpenModal: (shot: Shot) => void;
  onAnalyzeShot: (shot: Shot) => void;
  onBatchAnalyze: () => void;
  isBatchAnalyzing: boolean;
  onGenerateGif: (shot: Shot) => void;
  onGenerateAllGifs: () => void;
  isBatchGeneratingGifs: boolean;
  onViewColorScript: () => void;
  onExportAll: () => void;
  isExporting: boolean;
}

export const ShotsGallery: React.FC<ShotsGalleryProps> = ({
  shots,
  onOpenModal,
  onAnalyzeShot,
  onBatchAnalyze,
  isBatchAnalyzing,
  onGenerateGif,
  onGenerateAllGifs,
  isBatchGeneratingGifs,
  onViewColorScript,
  onExportAll,
  isExporting,
}) => {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredShots = shots.filter((shot) => {
    if (filterType === "all") return true;
    if (filterType === "with_gif") return Boolean(shot.gifDataUrl);
    if (filterType === "with_ai") return Boolean(shot.analysis);
    if (filterType === "closeups") {
      const size = shot.analysis?.shotSize?.toLowerCase() || "";
      return size.includes("close") || size.includes("cu");
    }
    if (filterType === "wide") {
      const size = shot.analysis?.shotSize?.toLowerCase() || "";
      return size.includes("wide") || size.includes("ews") || size.includes("ws");
    }
    return true;
  });

  const analyzedCount = shots.filter((s) => s.analysis).length;
  const gifCount = shots.filter((s) => s.gifDataUrl).length;

  return (
    <div className="mt-8 space-y-6">
      {/* Top Bar & Batch Controls */}
      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif italic text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-neutral-400" />
              Extracted Shots ({shots.length})
            </h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-950 text-neutral-400 font-mono border border-white/10">
              {analyzedCount}/{shots.length} Classified • {gifCount} GIFs
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1.5">
            Keyframes and animated sequences categorized with StudioBinder taxonomy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Batch Analyze with AI */}
          <button
            id="batch-analyze-btn"
            onClick={onBatchAnalyze}
            disabled={isBatchAnalyzing || shots.length === 0}
            className="px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-black bg-white hover:bg-neutral-200 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40"
          >
            {isBatchAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing All...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Identify All Shots</span>
              </>
            )}
          </button>

          {/* Batch Make GIFs */}
          <button
            id="batch-gifs-btn"
            onClick={onGenerateAllGifs}
            disabled={isBatchGeneratingGifs || shots.length === 0}
            className="px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-white border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
          >
            {isBatchGeneratingGifs ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering GIFs...</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5" />
                <span>Create All GIFs</span>
              </>
            )}
          </button>

          {/* View Color Script */}
          <button
            id="generate-color-script-btn"
            onClick={onViewColorScript}
            className="px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-white bg-neutral-950 border border-white/30 hover:border-white transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Generate Color Script</span>
          </button>

          {/* Export Designated Folder ZIP */}
          <button
            id="batch-export-zip-btn"
            onClick={onExportAll}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-neutral-300 bg-neutral-950 hover:bg-neutral-800 border border-white/10 hover:border-white/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
          >
            <FolderDown className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export Folder (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors ${
              filterType === "all" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
            }`}
          >
            All ({shots.length})
          </button>
          <button
            onClick={() => setFilterType("with_ai")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors ${
              filterType === "with_ai" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
            }`}
          >
            Identified AI ({analyzedCount})
          </button>
          <button
            onClick={() => setFilterType("with_gif")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors ${
              filterType === "with_gif" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
            }`}
          >
            With GIFs ({gifCount})
          </button>
          <button
            onClick={() => setFilterType("closeups")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors ${
              filterType === "closeups" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
            }`}
          >
            Close-Ups
          </button>
          <button
            onClick={() => setFilterType("wide")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors ${
              filterType === "wide" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
            }`}
          >
            Wide Shots
          </button>
        </div>

        <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 hidden sm:inline">
          Showing {filteredShots.length} shots
        </span>
      </div>

      {/* Grid of Shot Cards */}
      {filteredShots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredShots.map((shot) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              onOpenModal={onOpenModal}
              onAnalyzeShot={onAnalyzeShot}
              onGenerateGif={onGenerateGif}
            />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-12 text-center">
          <p className="font-serif italic text-neutral-400 text-sm">
            No shots matching this filter.
          </p>
        </div>
      )}
    </div>
  );
};
