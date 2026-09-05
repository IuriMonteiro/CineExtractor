import { Shot, ExtractionConfig } from "../types";
import { extractColorMetrics } from "./colorExtractor";

interface ProgressData {
  percentage: number;
  currentSecond: number;
  totalSeconds: number;
  shotsFound: number;
  stage?: string;
}

type ProgressCallback = (progress: ProgressData) => void;

/**
 * Computes a downsampled 64-bin color histogram (4 bins each for R, G, B)
 */
function computeHistogram(data: Uint8ClampedArray): Float32Array {
  const hist = new Float32Array(64);
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.floor(data[i] / 64);
    const g = Math.floor(data[i + 1] / 64);
    const b = Math.floor(data[i + 2] / 64);
    const bin = (r << 4) | (g << 2) | b;
    hist[bin]++;
  }

  // Normalize
  for (let i = 0; i < 64; i++) {
    hist[i] /= totalPixels;
  }

  return hist;
}

/**
 * Calculates Manhattan distance / Chi-square difference between two histograms (0 to 100 scale)
 */
function compareHistograms(h1: Float32Array, h2: Float32Array): number {
  let diff = 0;
  for (let i = 0; i < 64; i++) {
    diff += Math.abs(h1[i] - h2[i]);
  }
  return diff * 50; // scaled roughly 0 to 100
}

/**
 * Automatically detects scene cuts and extracts shot frames from a video element or URL
 */
export async function detectScenesFromVideo(
  videoSource: HTMLVideoElement | string,
  config: ExtractionConfig,
  onProgress?: ProgressCallback,
  abortSignal?: AbortSignal
): Promise<Shot[]> {
  let video: HTMLVideoElement;
  let ownsVideoElement = false;

  if (typeof videoSource === "string") {
    video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoSource;
    video.muted = true;
    video.playsInline = true;
    ownsVideoElement = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video metadata"));
    });
  } else {
    video = videoSource;
  }

  const duration = video.duration;
  if (!duration || duration <= 0 || isNaN(duration)) {
    throw new Error("Invalid video duration");
  }

  // Determine scan range (Full duration or custom time range)
  const scanStart = config.scanRangeMode === "range" ? Math.max(0, config.startTime || 0) : 0;
  const scanEnd =
    config.scanRangeMode === "range" && config.endTime > scanStart
      ? Math.min(duration, config.endTime)
      : duration;
  const scanDuration = Math.max(0.1, scanEnd - scanStart);

  // Analytical canvas for fast scene cut detection (small resolution for high throughput)
  const detectCanvas = document.createElement("canvas");
  detectCanvas.width = 160;
  detectCanvas.height = 90;
  const detectCtx = detectCanvas.getContext("2d", { willReadFrequently: true });

  // High-res canvas for keyframe extraction
  const highResCanvas = document.createElement("canvas");
  const nativeW = video.videoWidth || 1280;
  const nativeH = video.videoHeight || 720;
  highResCanvas.width = Math.min(nativeW, 1280);
  highResCanvas.height = Math.round((highResCanvas.width / nativeW) * nativeH);
  const highResCtx = highResCanvas.getContext("2d");

  if (!detectCtx || !highResCtx) {
    throw new Error("Canvas context initialization failed");
  }

  // Adaptive sampling calculation:
  // For long videos (e.g. 5m, 1h, 2h), keep step interval responsive to prevent browser stalling
  let effectiveFps = config.sampleFps || 3;
  if (scanDuration > 3600 && effectiveFps > 1.5) {
    // Feature film > 1 hour: 1.0 to 1.5 fps provides fast, full-movie cut detection in minutes
    effectiveFps = 1.0;
  } else if (scanDuration > 600 && effectiveFps > 2.5) {
    // 10min to 1 hour: 2.0 fps
    effectiveFps = 2.0;
  }
  const sampleInterval = 1 / effectiveFps;

  // Shot limit calculation: if maxShots is 0 or undefined, there is NO limit (extract ALL cuts in video)
  const hasShotLimit = typeof config.maxShots === "number" && config.maxShots > 0;
  const maxAllowedShots = hasShotLimit ? config.maxShots : Infinity;
  let previousHist: Float32Array | null = null;
  const shotCutPoints: number[] = [scanStart]; // starts at scanStart

  let currentTime = scanStart;

  const seekVideo = (time: number): Promise<void> => {
    const targetTime = Math.max(0, Math.min(time, duration - 0.05));
    if (Math.abs(video.currentTime - targetTime) < 0.04) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let timeoutId: any;
      const onSeeked = () => {
        clearTimeout(timeoutId);
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      // 350ms timeout ensures no freeze if a frame seek takes too long on high-bitrate movies
      timeoutId = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }, 350);
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = targetTime;
    });
  };

  // 1. Pass 1: Scan video across specified window to identify scene transitions
  let loopStep = 0;
  while (currentTime < scanEnd) {
    if (abortSignal?.aborted) {
      throw new Error("Scene detection cancelled by user");
    }

    loopStep++;
    // Yield to the browser event loop periodically to prevent UI thread starvation
    if (loopStep % 6 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }

    await seekVideo(currentTime);
    detectCtx.drawImage(video, 0, 0, detectCanvas.width, detectCanvas.height);
    const imgData = detectCtx.getImageData(0, 0, detectCanvas.width, detectCanvas.height).data;
    const currentHist = computeHistogram(imgData);

    if (previousHist) {
      const delta = compareHistograms(previousHist, currentHist);
      const lastCut = shotCutPoints[shotCutPoints.length - 1];
      const timeSinceLastCut = currentTime - lastCut;

      // Check if scene change threshold met and minimum shot duration respected
      if (delta >= config.sensitivity && timeSinceLastCut >= config.minShotDuration) {
        shotCutPoints.push(currentTime);
        if (shotCutPoints.length >= maxAllowedShots) {
          break;
        }
      }
    }

    previousHist = currentHist;
    currentTime += sampleInterval;

    if (onProgress) {
      const progressRatio = Math.min(1, Math.max(0, (currentTime - scanStart) / scanDuration));
      onProgress({
        percentage: Math.min(50, Math.round(progressRatio * 50)),
        currentSecond: currentTime,
        totalSeconds: duration,
        shotsFound: shotCutPoints.length,
      });
    }
  }

  // Ensure end of scan boundary
  if (shotCutPoints[shotCutPoints.length - 1] < scanEnd - 0.2) {
    shotCutPoints.push(scanEnd);
  } else {
    shotCutPoints[shotCutPoints.length - 1] = scanEnd;
  }

  // 2. Pass 2: Extract keyframes and color profiles for each detected shot
  const totalShotsToExtract = shotCutPoints.length - 1;
  const detectedShots: Shot[] = [];

  // Dynamic keyframe resolution based on shot count:
  // For massive extractions (> 300 shots, e.g. 1,000 to 20,000 cuts), 854x480 at 0.74 keeps memory ~25-35KB per shot
  // ensuring the entire movie color script easily fits within browser memory.
  const targetWidth =
    totalShotsToExtract > 1000
      ? Math.min(nativeW, 640)
      : totalShotsToExtract > 300
      ? Math.min(nativeW, 854)
      : Math.min(nativeW, 1280);
  highResCanvas.width = targetWidth;
  highResCanvas.height = Math.max(1, Math.round((targetWidth / nativeW) * nativeH));
  const jpegQuality = totalShotsToExtract > 1000 ? 0.72 : totalShotsToExtract > 300 ? 0.76 : 0.82;

  for (let i = 0; i < totalShotsToExtract; i++) {
    if (abortSignal?.aborted) {
      throw new Error("Scene detection cancelled by user");
    }

    // Yield to the browser event loop regularly to prevent thread locking
    if (i % 2 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }

    const shotStart = shotCutPoints[i];
    const shotEnd = shotCutPoints[i + 1];
    const shotDuration = shotEnd - shotStart;

    // Pick representative keyframe at 30% into the shot (settled after cut)
    const keyframeTime = shotStart + Math.min(0.25, shotDuration * 0.3);

    await seekVideo(keyframeTime);
    highResCtx.drawImage(video, 0, 0, highResCanvas.width, highResCanvas.height);

    const keyframeDataUrl = highResCanvas.toDataURL("image/jpeg", jpegQuality);
    const colorMetrics = extractColorMetrics(highResCanvas);

    const shot: Shot = {
      id: `shot-${i + 1}-${Math.random().toString(36).slice(2, 7)}`,
      shotNumber: i + 1,
      startTime: Number(shotStart.toFixed(2)),
      endTime: Number(shotEnd.toFixed(2)),
      duration: Number(shotDuration.toFixed(2)),
      keyframeTime: Number(keyframeTime.toFixed(2)),
      keyframeDataUrl,
      palette: colorMetrics.palette,
      dominantColor: colorMetrics.dominantColor,
      secondaryColor: colorMetrics.secondaryColor,
      luminance: colorMetrics.luminance,
      warmth: colorMetrics.warmth,
      saturation: colorMetrics.saturation,
    };

    detectedShots.push(shot);

    if (onProgress) {
      const secondPassPercent = 50 + Math.round(((i + 1) / totalShotsToExtract) * 50);
      onProgress({
        percentage: secondPassPercent,
        currentSecond: keyframeTime,
        totalSeconds: duration,
        shotsFound: detectedShots.length,
        stage: `Extracting shot #${i + 1} of ${totalShotsToExtract} (${detectedShots.length} captured)...`,
      });
    }
  }

  if (ownsVideoElement) {
    video.src = "";
    video.remove();
  }

  return detectedShots;
}
