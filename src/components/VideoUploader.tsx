import React, { useRef, useState } from "react";
import { UploadCloud, Play, Pause, Film, Sparkles, Video as VideoIcon, CheckCircle } from "lucide-react";
import { SAMPLE_VIDEOS, createSyntheticDemoVideo } from "../utils/sampleVideos";
import { SampleVideo } from "../types";
import { formatTimecode } from "../utils/timeUtils";

interface VideoUploaderProps {
  videoUrl: string | null;
  onVideoSelected: (url: string, fileName: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isProcessing: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoUrl,
  onVideoSelected,
  videoRef,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoTitle, setVideoTitle] = useState<string>("No video loaded");
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file (MP4, WebM, MOV, etc.)");
      return;
    }
    setVideoLoadError(null);
    const url = URL.createObjectURL(file);
    setVideoTitle(file.name);
    onVideoSelected(url, file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleVideo) => {
    setVideoLoadError(null);
    setVideoTitle(sample.title);
    onVideoSelected(sample.url, sample.id);
  };

  const handleGenerateProceduralDemo = async () => {
    try {
      setIsGeneratingDemo(true);
      setVideoLoadError(null);
      const demo = await createSyntheticDemoVideo();
      setVideoTitle("Synthetic 4-Scene Cinematic Sequence");
      onVideoSelected(demo.url, "synthetic_cinematic_shots");
    } catch (err) {
      console.error("Failed to generate procedural video", err);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => formatTimecode(sec);

  return (
    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Video Player or Upload Dropzone */}
        <div className="flex-1">
          {videoUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-white/10 group">
              <video
                ref={videoRef}
                src={videoUrl}
                crossOrigin="anonymous"
                className="w-full aspect-video object-contain bg-black"
                playsInline
                onError={() => {
                  setVideoLoadError("Video could not be loaded or decoded. Use a bundled sample or generate a synthetic sequence.");
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  setVideoLoadError(null);
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
              />

              {videoLoadError && (
                <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
                  <Film className="w-10 h-10 text-amber-400 mb-2" />
                  <h3 className="text-lg font-serif italic text-white mb-1">Video Stream Unavailable</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mb-4 font-mono">{videoLoadError}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateProceduralDemo}
                      className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      Use Synthetic Sequence
                    </button>
                    <button
                      onClick={() => handleSelectSample(SAMPLE_VIDEOS[0])}
                      className="px-4 py-2 bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-700 transition-colors border border-white/10"
                    >
                      Load Bundled Sample
                    </button>
                  </div>
                </div>
              )}

              {/* Top status indicator */}
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase tracking-tighter text-neutral-300 font-mono">
                    {isProcessing ? "Analyzing Sequence" : "Video Ready"}
                  </span>
                </div>
              </div>

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5">
                    Currently Loaded
                  </p>
                  <div className="flex items-baseline justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-serif italic text-white truncate max-w-md">
                      {videoTitle}
                    </h1>
                    <span className="font-mono text-[11px] text-neutral-400 bg-neutral-900/90 px-2 py-0.5 rounded border border-white/10">
                      {formatSeconds(currentTime)} / {formatSeconds(duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="play-pause-btn"
                    onClick={togglePlay}
                    disabled={isProcessing}
                    className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-transform active:scale-95 shadow-md font-bold"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  {/* Scrubber */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.05}
                    value={currentTime}
                    disabled={isProcessing}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      setCurrentTime(newTime);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                    }}
                    className="flex-1 accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />

                  <button
                    id="change-video-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="text-[10px] uppercase tracking-widest px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-full border border-white/15 transition-colors"
                  >
                    Change Video
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-video w-full rounded-xl border border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-white bg-white/5 scale-[1.01]"
                  : "border-white/20 bg-neutral-950/60 hover:border-white/40 hover:bg-neutral-950"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-neutral-300" />
              </div>
              <h2 className="text-xl font-serif italic text-white mb-1">
                Drop your video file here, or browse
              </h2>
              <p className="text-xs uppercase tracking-widest text-neutral-500 max-w-sm mt-1">
                MP4 • WebM • MOV • Real-time frame and scene analysis
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Quick Sample Selector & Instant Procedural Video Generator */}
        <div className="lg:w-80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-bold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-neutral-400" />
                Featured Sequences
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600">Sample Clips</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  disabled={isProcessing}
                  className="w-full text-left p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-white/10 hover:border-white/30 transition-all flex items-center gap-3 group"
                >
                  <div className="relative w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-neutral-800 border border-white/5">
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-serif italic text-white truncate group-hover:text-neutral-200 transition-colors">
                      {sample.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 truncate mt-0.5">
                      {sample.genre} • {sample.duration}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Procedural generator button */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              id="generate-synthetic-video-btn"
              onClick={handleGenerateProceduralDemo}
              disabled={isGeneratingDemo || isProcessing}
              className="w-full py-3 px-4 border border-white/20 rounded-lg text-[10px] uppercase tracking-[0.2em] font-bold text-white hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isGeneratingDemo ? "Synthesizing 4-Scene Clip..." : "Generate Synthetic Sequence"}
              </span>
            </button>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-2 text-center">
              Canvas-rendered 4-scene cut sequence for quick testing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
