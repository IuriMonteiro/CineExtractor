export interface ColorInfo {
  palette: string[];
  dominantColor: string;
  secondaryColor: string;
  luminance: number; // 0 to 1
  warmth: number; // -1 to +1
  saturation: number; // 0 to 1
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getWarmth(r: number, g: number, b: number): number {
  // Red/yellow are warm (>0), cyan/blue are cool (<0)
  const warmPart = (r * 1.1 + g * 0.4);
  const coolPart = (b * 1.5);
  const diff = (warmPart - coolPart) / 255;
  return Math.max(-1, Math.min(1, diff));
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

/**
 * Extracts dominant palette, dominant & secondary color, luminance, and warmth from an HTMLCanvasElement
 */
export function extractColorMetrics(canvas: HTMLCanvasElement): ColorInfo {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      palette: ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"],
      dominantColor: "#1e293b",
      secondaryColor: "#334155",
      luminance: 0.3,
      warmth: 0,
      saturation: 0.2,
    };
  }

  // Downsample to a fast analytical grid e.g. 64x36
  const sampleW = 64;
  const sampleH = 36;
  const offCanvas = document.createElement("canvas");
  offCanvas.width = sampleW;
  offCanvas.height = sampleH;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) {
    return {
      palette: ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"],
      dominantColor: "#1e293b",
      secondaryColor: "#334155",
      luminance: 0.3,
      warmth: 0,
      saturation: 0.2,
    };
  }

  offCtx.drawImage(canvas, 0, 0, sampleW, sampleH);
  const imgData = offCtx.getImageData(0, 0, sampleW, sampleH).data;

  // Simple color quantization bucket map (4x4x4 RGB bins = 64 color bins)
  const colorBuckets = new Map<number, { r: number; g: number; b: number; count: number }>();
  let totalLuminance = 0;
  let totalWarmth = 0;
  let totalSaturation = 0;
  const pixelCount = sampleW * sampleH;

  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];

    totalLuminance += getLuminance(r, g, b);
    totalWarmth += getWarmth(r, g, b);
    totalSaturation += getSaturation(r, g, b);

    // Quantize 8-bit to 4-bit bins
    const qr = Math.floor(r / 32);
    const qg = Math.floor(g / 32);
    const qb = Math.floor(b / 32);
    const key = (qr << 8) | (qg << 4) | qb;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.count++;
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  // Sort buckets by frequency
  const sortedBuckets = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

  // Pick diverse top colors
  const selectedColors: { r: number; g: number; b: number }[] = [];
  for (const bucket of sortedBuckets) {
    const avgR = Math.round(bucket.r / bucket.count);
    const avgG = Math.round(bucket.g / bucket.count);
    const avgB = Math.round(bucket.b / bucket.count);

    // Check color distance against already chosen to avoid duplicate shades
    const isDistinct = selectedColors.every((c) => {
      const dist = Math.sqrt((c.r - avgR) ** 2 + (c.g - avgG) ** 2 + (c.b - avgB) ** 2);
      return dist > 35; // Minimum color distance
    });

    if (isDistinct) {
      selectedColors.push({ r: avgR, g: avgG, b: avgB });
      if (selectedColors.length >= 6) break;
    }
  }

  // Fill up if fewer than 5
  while (selectedColors.length < 5 && sortedBuckets.length > selectedColors.length) {
    const next = sortedBuckets[selectedColors.length];
    selectedColors.push({
      r: Math.round(next.r / next.count),
      g: Math.round(next.g / next.count),
      b: Math.round(next.b / next.count),
    });
  }

  const palette = selectedColors.map((c) => rgbToHex(c.r, c.g, c.b));
  const dominantColor = palette[0] || "#1e293b";
  const secondaryColor = palette[1] || palette[0] || "#334155";

  return {
    palette: palette.length >= 5 ? palette : [...palette, "#1e293b", "#334155", "#475569"].slice(0, 5),
    dominantColor,
    secondaryColor,
    luminance: Number((totalLuminance / pixelCount).toFixed(3)),
    warmth: Number((totalWarmth / pixelCount).toFixed(3)),
    saturation: Number((totalSaturation / pixelCount).toFixed(3)),
  };
}
