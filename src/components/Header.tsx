import React from "react";
import { Film, BookOpen, Palette, FolderDown, Sparkles } from "lucide-react";

interface HeaderProps {
  shotsCount: number;
  activeTab: "shots" | "colorscript";
  setActiveTab: (tab: "shots" | "colorscript") => void;
  onOpenTaxonomyGuide: () => void;
  onExportAll: () => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  shotsCount,
  activeTab,
  setActiveTab,
  onOpenTaxonomyGuide,
  onExportAll,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Logo & Title in Editorial Serif */}
        <div className="flex items-baseline space-x-2.5">
          <span className="font-serif italic text-2xl sm:text-3xl tracking-tighter text-white select-none">
            CineShot
          </span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold hidden xs:inline">
            Studio / v2.4
          </span>
        </div>

        {/* Center Tabs: Shots Gallery vs Color Script */}
        {shotsCount > 0 && (
          <div className="flex items-center space-x-6 text-xs uppercase tracking-widest font-medium">
            <button
              id="tab-shots-btn"
              onClick={() => setActiveTab("shots")}
              className={`pb-1.5 transition-colors flex items-center gap-2 ${
                activeTab === "shots"
                  ? "text-white border-b border-white font-bold"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Extracted Shots ({shotsCount})</span>
            </button>
            <button
              id="tab-colorscript-btn"
              onClick={() => setActiveTab("colorscript")}
              className={`pb-1.5 transition-colors flex items-center gap-2 ${
                activeTab === "colorscript"
                  ? "text-white border-b border-white font-bold"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color Script</span>
            </button>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center space-x-3 text-xs uppercase tracking-widest font-medium">
          <button
            id="taxonomy-guide-btn"
            onClick={onOpenTaxonomyGuide}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-pink-500/30 text-neutral-300 hover:text-white hover:border-pink-500/60 bg-pink-950/20 transition-all"
            title="StudioBinder & Eyecannndy Cinematography Reference"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline text-pink-200">Eyecandy & Taxonomy</span>
          </button>

          {shotsCount > 0 && (
            <button
              id="export-zip-btn"
              onClick={onExportAll}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors shadow-sm active:scale-95 disabled:opacity-40"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Export Script"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

