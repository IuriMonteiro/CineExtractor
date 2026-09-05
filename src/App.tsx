import React, { useState, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { VideoUploader } from "./components/VideoUploader";
import { DetectionControls } from "./components/DetectionControls";
import { DetectionProgress } from "./components/DetectionProgress";
import { ShotsGallery } from "./components/ShotsGallery";
import { ShotModal } from "./components/ShotModal";
import { ColorScriptView } from "./components/ColorScriptView";
import { TaxonomyReferenceModal } from "./components/TaxonomyReferenceModal";
import { Shot, ExtractionConfig } from "./types";
import { detectScenesFromVideo } from "./utils/sceneDetector";
import { generateShotGif } from "./utils/gifGenerator";
import { exportShotsZip } from "./utils/exportUtils";
import { SAMPLE_VIDEOS } from "./utils/sampleVideos";
import { formatTimecode } from "./utils/timeUtils";

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string | null>(SAMPLE_VIDEOS[0].url);
  const [videoTitle, setVideoTitle] = useState<string>(SAMPLE_VIDEOS[0].title);
  const [shots, setShots] = useState<Shot[]>([]);
  const [activeTab, setActiveTab] = useState<"shots" | "colorscript">("shots");

  const [config, setConfig] = useState<ExtractionConfig>({
    sensitivity: 24,
    minShotDuration: 0.6,
    maxShots: 0, // 0 = Unlimited (no limits: extracts whatever is in the video, 1000, 20000+ cuts)
    sampleFps: 2.5,
    scanRangeMode: "full",
    startTime: 0,
    endTime: 0,
    exportMode: "both",
    folderName: "CineShot_Project",
    gifFps: 8,
    gifResolutionWidth: 380,
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState({
    percentage: 0,
    currentSecond: 0,
    totalSeconds: 0,
    shotsFound: 0,
    stage: "",
  });

  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [isTaxonomyGuideOpen, setIsTaxonomyGuideOpen] = useState(false);
  const [taxonomyInitialCategory, setTaxonomyInitialCategory] = useState<any>("eyecandy");
  const [taxonomyHighlightTechnique, setTaxonomyHighlightTechnique] = useState<string>("");
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [isBatchGeneratingGifs, setIsBatchGeneratingGifs] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Automatically adapt scan settings for feature films (> 30 mins)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => {
      if (video.duration > 1800) {
        // Switch to Movie Speed (1 fps) so full feature film scans without freezing
        setConfig((prev) => ({
          ...prev,
          sampleFps: 1.0,
          maxShots: Math.max(prev.maxShots, 300),
        }));
      }
    };

    video.addEventListener("loadedmetadata", onMeta);
    if (video.duration > 0) onMeta();
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, [videoUrl]);

  const handleVideoSelected = (url: string, fileName: string) => {
    setVideoUrl(url);
    setVideoTitle(fileName);
    setShots([]);
    setActiveTab("shots");
    setConfig((prev) => ({
      ...prev,
      folderName: `CineShot_${fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    }));
  };

  const handleConfigChange = (updated: Partial<ExtractionConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Run auto scene detection
  const handleStartDetection = async () => {
    if (!videoRef.current) return;

    try {
      setIsDetecting(true);
      abortControllerRef.current = new AbortController();

      setDetectionProgress({
        percentage: 0,
        currentSecond: 0,
        totalSeconds: videoRef.current.duration || 10,
        shotsFound: 0,
        stage: "Analyzing chrominance & luminance delta across frames...",
      });

      const detectedShots = await detectScenesFromVideo(
        videoRef.current,
        config,
        (prog) => {
          setDetectionProgress({
            percentage: prog.percentage,
            currentSecond: prog.currentSecond,
            totalSeconds: prog.totalSeconds,
            shotsFound: prog.shotsFound,
            stage:
              prog.percentage < 50
                ? "Pass 1: Identifying Scene Cuts & Transitions..."
                : "Pass 2: Extracting Keyframes & Color Profiles...",
          });
        },
        abortControllerRef.current.signal
      );

      setShots(detectedShots);
      setIsDetecting(false);

      // If user selected GIFs mode or both, trigger background GIF generation
      // For large extractions (> 24 shots), limit initial auto-batch to 12 shots to protect browser memory
      if (config.exportMode === "gifs" || config.exportMode === "both") {
        const batchLimit = detectedShots.length > 24 ? 12 : undefined;
        generateGifsForShots(detectedShots, batchLimit);
      }
    } catch (err: any) {
      console.warn("Detection stopped or failed:", err);
      setIsDetecting(false);
    }
  };

  const handleCancelDetection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsDetecting(false);
  };

  // Generate GIF for a single shot
  const handleGenerateGif = async (shot: Shot) => {
    if (!videoRef.current) return;
    try {
      setShots((prev) =>
        prev.map((s) => (s.id === shot.id ? { ...s, isGifGenerating: true } : s))
      );

      const gifDataUrl = await generateShotGif(
        videoRef.current,
        shot.startTime,
        shot.endTime,
        {
          fps: config.gifFps,
          width: config.gifResolutionWidth,
          maxFrames: 24,
        }
      );

      setShots((prev) =>
        prev.map((s) =>
          s.id === shot.id ? { ...s, gifDataUrl, isGifGenerating: false } : s
        )
      );

      if (selectedShot?.id === shot.id) {
        setSelectedShot((prev) => (prev ? { ...prev, gifDataUrl } : null));
      }
    } catch (err) {
      console.error("Failed to generate GIF for shot:", err);
      setShots((prev) =>
        prev.map((s) => (s.id === shot.id ? { ...s, isGifGenerating: false } : s))
      );
    }
  };

  // Generate GIFs for shots in sequence
  const generateGifsForShots = async (targetShots: Shot[], maxBatchCount?: number) => {
    if (!videoRef.current) return;
    setIsBatchGeneratingGifs(true);

    const ungenerated = targetShots.filter((s) => !s.gifDataUrl);
    const pool = maxBatchCount ? ungenerated.slice(0, maxBatchCount) : ungenerated;

    for (const shot of pool) {
      try {
        setShots((prev) =>
          prev.map((s) => (s.id === shot.id ? { ...s, isGifGenerating: true } : s))
        );

        const gifDataUrl = await generateShotGif(
          videoRef.current,
          shot.startTime,
          shot.endTime,
          {
            fps: config.gifFps,
            width: config.gifResolutionWidth,
            maxFrames: 20,
          }
        );

        setShots((prev) =>
          prev.map((s) =>
            s.id === shot.id ? { ...s, gifDataUrl, isGifGenerating: false } : s
          )
        );

        // Yield slightly between GIFs to keep the browser snappy
        await new Promise((r) => setTimeout(r, 60));
      } catch (err) {
        console.warn(`GIF generation failed for shot ${shot.shotNumber}`, err);
        setShots((prev) =>
          prev.map((s) => (s.id === shot.id ? { ...s, isGifGenerating: false } : s))
        );
      }
    }

    setIsBatchGeneratingGifs(false);
  };

  // AI Shot Identification using StudioBinder & Eyecannndy taxonomy
  const handleAnalyzeShot = async (shot: Shot) => {
    try {
      setShots((prev) =>
        prev.map((s) => (s.id === shot.id ? { ...s, isAnalyzing: true } : s))
      );

      const timecode = formatTimecode(shot.startTime, true);

      const res = await fetch("/api/analyze-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: shot.keyframeDataUrl,
          shotNumber: shot.shotNumber,
          timecode,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setShots((prev) =>
          prev.map((s) =>
            s.id === shot.id
              ? { ...s, analysis: data.analysis, isAnalyzing: false }
              : s
          )
        );

        if (selectedShot?.id === shot.id) {
          setSelectedShot((prev) =>
            prev ? { ...prev, analysis: data.analysis, isAnalyzing: false } : null
          );
        }
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      console.error("Shot analysis error:", err);
      setShots((prev) =>
        prev.map((s) =>
          s.id === shot.id
            ? { ...s, isAnalyzing: false, analysisError: err.message }
            : s
        )
      );
    }
  };

  // Batch AI analyze all shots
  const handleBatchAnalyze = async () => {
    const unanalyzed = shots.filter((s) => !s.analysis);
    if (unanalyzed.length === 0) return;

    setIsBatchAnalyzing(true);

    for (const shot of unanalyzed) {
      await handleAnalyzeShot(shot);
    }

    setIsBatchAnalyzing(false);
  };

  // Export designated folder ZIP
  const handleExportAll = async () => {
    if (shots.length === 0) return;
    try {
      setIsExporting(true);
      await exportShotsZip(
        shots,
        config.folderName || "CineShot_Project",
        true,
        true
      );
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Next and Prev shot modal navigation
  const currentShotIndex = selectedShot
    ? shots.findIndex((s) => s.id === selectedShot.id)
    : -1;

  const handleNextModalShot = () => {
    if (currentShotIndex >= 0 && currentShotIndex < shots.length - 1) {
      setSelectedShot(shots[currentShotIndex + 1]);
    }
  };

  const handlePrevModalShot = () => {
    if (currentShotIndex > 0) {
      setSelectedShot(shots[currentShotIndex - 1]);
    }
  };

  const handleOpenTaxonomyGuide = (category: any = "eyecandy", technique: string = "") => {
    setTaxonomyInitialCategory(category);
    setTaxonomyHighlightTechnique(technique);
    setIsTaxonomyGuideOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        shotsCount={shots.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTaxonomyGuide={() => handleOpenTaxonomyGuide("eyecandy")}
        onExportAll={handleExportAll}
        isExporting={isExporting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Step 1: Video Uploader & Sample Selector */}
        <VideoUploader
          videoUrl={videoUrl}
          onVideoSelected={handleVideoSelected}
          videoRef={videoRef}
          isProcessing={isDetecting}
        />

        {/* Step 2: Auto Detect Scene Controls */}
        <DetectionControls
          config={config}
          onChangeConfig={handleConfigChange}
          onStartDetection={handleStartDetection}
          onCancelDetection={handleCancelDetection}
          isDetecting={isDetecting}
          hasVideo={Boolean(videoUrl)}
          videoDuration={videoRef.current?.duration || 0}
        />

        {/* Progress Bar when scanning */}
        {isDetecting && (
          <DetectionProgress
            percentage={detectionProgress.percentage}
            currentSecond={detectionProgress.currentSecond}
            totalSeconds={detectionProgress.totalSeconds}
            shotsFound={detectionProgress.shotsFound}
            stage={detectionProgress.stage}
          />
        )}

        {/* Step 3: View Tabs (Shots Gallery OR Color Script) */}
        {shots.length > 0 && activeTab === "shots" && (
          <ShotsGallery
            shots={shots}
            onOpenModal={(shot) => setSelectedShot(shot)}
            onAnalyzeShot={handleAnalyzeShot}
            onBatchAnalyze={handleBatchAnalyze}
            isBatchAnalyzing={isBatchAnalyzing}
            onGenerateGif={handleGenerateGif}
            onGenerateAllGifs={() => generateGifsForShots(shots)}
            isBatchGeneratingGifs={isBatchGeneratingGifs}
            onViewColorScript={() => setActiveTab("colorscript")}
            onExportAll={handleExportAll}
            isExporting={isExporting}
          />
        )}

        {shots.length > 0 && activeTab === "colorscript" && (
          <ColorScriptView
            shots={shots}
            onBackToShots={() => setActiveTab("shots")}
            videoTitle={videoTitle}
          />
        )}

        {/* First time prompt helper if no shots yet and not scanning */}
        {shots.length === 0 && !isDetecting && (
          <div className="mt-8 p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Ready for Automatic Scene Detection
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Click <strong className="text-amber-400">"Auto-Detect Scene Changes & Extract Shots"</strong> above to extract scene keyframes, generate animated GIFs, build Pixar-style color scripts, and categorize each shot using StudioBinder cinematography grammar.
            </p>
          </div>
        )}
      </main>

      {/* Deep Shot Inspector Modal with StudioBinder guides */}
      <ShotModal
        shot={selectedShot}
        onClose={() => setSelectedShot(null)}
        onNext={
          currentShotIndex < shots.length - 1 ? handleNextModalShot : undefined
        }
        onPrev={currentShotIndex > 0 ? handlePrevModalShot : undefined}
        onAnalyzeShot={handleAnalyzeShot}
        onGenerateGif={handleGenerateGif}
        onOpenTaxonomyGuide={handleOpenTaxonomyGuide}
      />

      {/* StudioBinder & Eyecannndy Reference Guide Modal */}
      <TaxonomyReferenceModal
        isOpen={isTaxonomyGuideOpen}
        onClose={() => setIsTaxonomyGuideOpen(false)}
        initialCategory={taxonomyInitialCategory}
        highlightTechnique={taxonomyHighlightTechnique}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        CineShot • Powered by Google AI Studio & Gemini 3.8 Flash • StudioBinder & Eyecannndy Taxonomy Reference
      </footer>
    </div>
  );
}
