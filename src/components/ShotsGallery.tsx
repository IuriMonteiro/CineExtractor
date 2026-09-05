import React, { useState, useMemo } from "react";
import {
  Film,
  Sparkles,
  Download,
  Filter,
  Palette,
  CheckCircle2,
  Loader2,
  FolderDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(48);
  const [jumpShotNumber, setJumpShotNumber] = useState<string>("");

  const filteredShots = useMemo(() => {
    return shots.filter((shot) => {
      // Search filter (by shot number or technique or keyword)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = shot.shotNumber.toString() === query || query === `#${shot.shotNumber}`;
        const matchTechnique = shot.analysis?.eyecandyTechniques?.some((t) =>
          t.name.toLowerCase().includes(query)
        );
        const matchSize = shot.analysis?.shotSize?.toLowerCase().includes(query);
        const matchMovement = shot.analysis?.movement?.toLowerCase().includes(query);
        if (!matchNumber && !matchTechnique && !matchSize && !matchMovement) {
          return false;
        }
      }

      if (filterType === "all") return true;
      if (filterType === "with_gif") return Boolean(shot.gifDataUrl);
      if (filterType === "with_ai") return Boolean(shot.analysis);
      if (filterType === "with_eyecandy") {
        return Boolean(shot.analysis?.eyecandyTechniques && shot.analysis.eyecandyTechniques.length > 0);
      }
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
  }, [shots, filterType, searchQuery]);

  // Reset to page 1 on filter or search change
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredShots.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const displayedShots = useMemo(() => {
    if (pageSize === 0) return filteredShots;
    const start = (validPage - 1) * pageSize;
    return filteredShots.slice(start, start + pageSize);
  }, [filteredShots, validPage, pageSize]);

  const handleJumpToShot = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpShotNumber, 10);
    if (isNaN(num)) return;

    // Find index of that shot in the filtered array
    const targetIdx = filteredShots.findIndex((s) => s.shotNumber === num);
    if (targetIdx !== -1) {
      if (pageSize > 0) {
        const targetPage = Math.floor(targetIdx / pageSize) + 1;
        setCurrentPage(targetPage);
      }
      setJumpShotNumber("");
    }
  };

  const analyzedCount = shots.filter((s) => s.analysis).length;
  const gifCount = shots.filter((s) => s.gifDataUrl).length;
  const eyecandyCount = shots.filter((s) => s.analysis?.eyecandyTechniques && s.analysis.eyecandyTechniques.length > 0).length;

  return (
    <div className="mt-8 space-y-6">
      {/* Top Bar & Batch Controls */}
      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif italic text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-neutral-400" />
              Extracted Cuts ({shots.length.toLocaleString()})
            </h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-950 text-neutral-400 font-mono border border-white/10">
              {analyzedCount}/{shots.length} Classified • {gifCount} GIFs
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1.5">
            Every scene cut captured. Categorized with StudioBinder taxonomy.
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
                <span>Analyzing Cuts...</span>
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

      {/* Filter, Search & Pagination Controls Bar */}
      <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
                filterType === "all" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
              }`}
            >
              All ({shots.length})
            </button>
            <button
              onClick={() => handleFilterChange("with_ai")}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
                filterType === "with_ai" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
              }`}
            >
              AI Identified ({analyzedCount})
            </button>
            <button
              onClick={() => handleFilterChange("with_eyecandy")}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
                filterType === "with_eyecandy" ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/20" : "bg-neutral-950 text-pink-400/80 border-pink-500/20 hover:text-pink-300"
              }`}
            >
              Eyecandy FX ({eyecandyCount})
            </button>
            <button
              onClick={() => handleFilterChange("with_gif")}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
                filterType === "with_gif" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
              }`}
            >
              With GIFs ({gifCount})
            </button>
            <button
              onClick={() => handleFilterChange("closeups")}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
                filterType === "closeups" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
              }`}
            >
              Close-Ups
            </button>
            <button
              onClick={() => handleFilterChange("wide")}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-colors whitespace-nowrap ${
                filterType === "wide" ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
              }`}
            >
              Wide Shots
            </button>
          </div>

          {/* Search & Jump Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Search filter */}
            <div className="relative flex-1 lg:w-48">
              <Search className="w-3 h-3 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shots..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 bg-neutral-950 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Jump to Shot # */}
            <form onSubmit={handleJumpToShot} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={shots.length}
                placeholder="Jump #..."
                value={jumpShotNumber}
                onChange={(e) => setJumpShotNumber(e.target.value)}
                className="w-20 px-2 py-1 bg-neutral-950 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest font-bold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-white/10"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Pagination Subbar if multiple pages or large datasets */}
        {filteredShots.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-white/5 gap-3">
            {/* Page Count & Summary */}
            <div className="text-[11px] font-mono text-neutral-400">
              {pageSize === 0 ? (
                <span>Showing all {filteredShots.length.toLocaleString()} cuts</span>
              ) : (
                <span>
                  Showing cuts{" "}
                  <strong className="text-white">
                    {((validPage - 1) * pageSize + 1).toLocaleString()}–
                    {Math.min(validPage * pageSize, filteredShots.length).toLocaleString()}
                  </strong>{" "}
                  of <strong className="text-white">{filteredShots.length.toLocaleString()}</strong> (Page{" "}
                  {validPage} of {totalPages})
                </span>
              )}
            </div>

            {/* Pagination Controls */}
            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={validPage <= 1}
                  className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validPage <= 1}
                  className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-3 py-1 rounded-lg bg-neutral-950 border border-white/10 text-xs font-mono text-white">
                  {validPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validPage >= totalPages}
                  className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validPage >= totalPages}
                  className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
              <span>Per page:</span>
              {[24, 48, 96, 0].map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    pageSize === sz
                      ? "bg-white text-black border-white font-bold"
                      : "bg-neutral-950 text-neutral-400 border-white/5 hover:text-white"
                  }`}
                >
                  {sz === 0 ? "All" : sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Shot Cards */}
      {displayedShots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedShots.map((shot) => (
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
            No shots matching this filter or search query.
          </p>
        </div>
      )}

      {/* Bottom Pagination Bar for smooth browsing without scrolling back up */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between bg-neutral-900/40 border border-white/5 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-neutral-400">
            Page <strong className="text-white">{validPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong> (
            {filteredShots.length.toLocaleString()} total shots)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setCurrentPage(1);
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              disabled={validPage <= 1}
              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              disabled={validPage <= 1}
              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-3 py-1 rounded-lg bg-neutral-950 border border-white/10 text-xs font-mono text-white">
              {validPage} / {totalPages}
            </span>

            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              disabled={validPage >= totalPages}
              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setCurrentPage(totalPages);
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              disabled={validPage >= totalPages}
              className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white border border-white/10 disabled:opacity-30"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
