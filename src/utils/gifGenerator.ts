import { GIFEncoder, quantize, applyPalette } from "gifenc";

export interface GifOptions {
  fps?: number;
  width?: number;
  maxFrames?: number;
}

/**
 * Generates an animated GIF data URL for a specific shot slice from a video element
 */
export async function generateShotGif(
  video: HTMLVideoElement,
  startTime: number,
  endTime: number,
  options: GifOptions = {}
): Promise<string> {
  const fps = options.fps || 8;
  const targetWidth = options.width || 360;
  const maxFrames = options.maxFrames || 24;

  const duration = Math.max(0.2, endTime - startTime);
  const frameCount = Math.min(maxFrames, Math.max(4, Math.round(duration * fps)));
  const interval = duration / frameCount;

  const nativeW = video.videoWidth || 640;
  const nativeH = video.videoHeight || 360;
  const width = targetWidth;
  const height = Math.round((width / nativeW) * nativeH);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create canvas context for GIF generation");
  }

  const gif = GIFEncoder();
  const delay = Math.round(1000 / fps);

  const seek = (time: number): Promise<void> => {
    const target = Math.max(0, Math.min(time, video.duration - 0.05));
    if (Math.abs(video.currentTime - target) < 0.02) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let timer: any;
      const onSeeked = () => {
        clearTimeout(timer);
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      timer = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }, 600);
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = target;
    });
  };

  for (let f = 0; f < frameCount; f++) {
    const frameTime = startTime + f * interval;
    await seek(frameTime);

    ctx.drawImage(video, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);

    // Quantize RGB colors into a 256 color palette
    const palette = quantize(data, 128);
    const index = applyPalette(data, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay,
      repeat: 0, // infinite loop
    });
  }

  gif.finish();
  const bytes = gif.bytes();

  // Convert to base64 Data URL
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:image/gif;base64,${btoa(binary)}`;
}
