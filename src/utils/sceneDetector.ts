import { Shot, ExtractionConfig } from "../types";
import { extractColorMetrics } from "./colorExtractor";

interface ProgressData {
  percentage: number;
  currentSecond: number;
  totalSeconds: number;
  shotsFound: number;
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

  // Analytical canvas for fast scene cut detection
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

  const sampleInterval = 1 / config.sampleFps; // e.g. every 0.16s for 6fps
  let previousHist: Float32Array | null = null;
  const shotCutPoints: number[] = [0]; // always starts at 0

  let currentTime = 0;

  const seekVideo = (time: number): Promise<void> => {
    const targetTime = Math.max(0, Math.min(time, duration - 0.05));
    if (Math.abs(video.currentTime - targetTime) < 0.02) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let timeoutId: any;
      const onSeeked = () => {
        clearTimeout(timeoutId);
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      timeoutId = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }, 600);
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = targetTime;
    });
  };

  // 1. Pass 1: Scan video to identify scene transitions
  while (currentTime < duration) {
    if (abortSignal?.aborted) {
      throw new Error("Scene detection cancelled by user");
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
        if (shotCutPoints.length >= config.maxShots) {
          break;
        }
      }
    }

    previousHist = currentHist;
    currentTime += sampleInterval;

    if (onProgress) {
      onProgress({
        percentage: Math.min(50, Math.round((currentTime / duration) * 50)),
        currentSecond: currentTime,
        totalSeconds: duration,
        shotsFound: shotCutPoints.length,
      });
    }
  }

  // Ensure end of video boundary
  if (shotCutPoints[shotCutPoints.length - 1] < duration - 0.2) {
    shotCutPoints.push(duration);
  } else {
    shotCutPoints[shotCutPoints.length - 1] = duration;
  }

  // 2. Pass 2: Extract high quality keyframes and color profiles for each detected shot
  const detectedShots: Shot[] = [];

  for (let i = 0; i < shotCutPoints.length - 1; i++) {
    if (abortSignal?.aborted) {
      throw new Error("Scene detection cancelled by user");
    }

    const shotStart = shotCutPoints[i];
    const shotEnd = shotCutPoints[i + 1];
    const shotDuration = shotEnd - shotStart;

    // Pick representative keyframe at 30% into the shot (settled after cut)
    const keyframeTime = shotStart + Math.min(0.25, shotDuration * 0.3);

    await seekVideo(keyframeTime);
    highResCtx.drawImage(video, 0, 0, highResCanvas.width, highResCanvas.height);

    const keyframeDataUrl = highResCanvas.toDataURL("image/jpeg", 0.88);
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
      const secondPassPercent = 50 + Math.round(((i + 1) / (shotCutPoints.length - 1)) * 50);
      onProgress({
        percentage: secondPassPercent,
        currentSecond: keyframeTime,
        totalSeconds: duration,
        shotsFound: detectedShots.length,
      });
    }
  }

  if (ownsVideoElement) {
    video.src = "";
    video.remove();
  }

  return detectedShots;
}
