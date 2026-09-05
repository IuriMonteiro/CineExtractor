import JSZip from "jszip";
import { Shot } from "../types";

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 24);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
}

/**
 * Generates and downloads a ZIP package containing screens, GIFs, CSV shot list, and color script
 */
export async function exportShotsZip(
  shots: Shot[],
  folderName: string = "CineShot_Export",
  includeScreens: boolean = true,
  includeGifs: boolean = true,
  colorScriptCanvas?: HTMLCanvasElement | null
): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder(folderName) || zip;

  // 1. Screens folder
  if (includeScreens) {
    const screensFolder = rootFolder.folder("screens");
    shots.forEach((shot) => {
      const base64 = shot.keyframeDataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
      const fileName = `shot_${shot.shotNumber.toString().padStart(5, "0")}_${formatTimecode(shot.startTime).replace(/:/g, "-")}.jpg`;
      screensFolder?.file(fileName, base64, { base64: true });
    });
  }

  // 2. GIFs folder
  if (includeGifs) {
    const gifsFolder = rootFolder.folder("gifs");
    shots.forEach((shot) => {
      if (shot.gifDataUrl) {
        const base64 = shot.gifDataUrl.replace(/^data:image\/gif;base64,/, "");
        const fileName = `shot_${shot.shotNumber.toString().padStart(5, "0")}.gif`;
        gifsFolder?.file(fileName, base64, { base64: true });
      }
    });
  }

  // 3. StudioBinder style Shot List CSV
  const csvHeaders = [
    "Shot Number",
    "Start Timecode",
    "End Timecode",
    "Duration (s)",
    "Shot Size",
    "Camera Angle",
    "Framing",
    "Camera Movement",
    "Focus & Depth",
    "Composition",
    "Lens Optics",
    "Lighting",
    "Color Mood",
    "Dominant Hex",
    "Palette",
    "Narrative Function",
    "Reference Style",
  ];

  const csvRows = shots.map((s) => [
    s.shotNumber,
    formatTimecode(s.startTime),
    formatTimecode(s.endTime),
    s.duration,
    `"${s.analysis?.shotSize || "Unclassified"}"`,
    `"${s.analysis?.angle || "Eye Level"}"`,
    `"${s.analysis?.framing || "Single"}"`,
    `"${s.analysis?.movement || "Static"}"`,
    `"${s.analysis?.focus || "Standard"}"`,
    `"${s.analysis?.composition || "Balanced"}"`,
    `"${s.analysis?.lens || "Standard 35-50mm"}"`,
    `"${s.analysis?.lighting || "Natural / Mixed"}"`,
    `"${s.analysis?.colorMood || ""}"`,
    s.dominantColor,
    `"${s.palette.join(", ")}"`,
    `"${(s.analysis?.narrativeFunction || "").replace(/"/g, '""')}"`,
    `"${s.analysis?.directorStyle || ""}"`,
  ]);

  const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  rootFolder.file("Shot_List_StudioBinder.csv", csvContent);

  // 4. Color script JSON
  const colorScriptData = {
    exportedAt: new Date().toISOString(),
    totalShots: shots.length,
    shots: shots.map((s) => ({
      shotNumber: s.shotNumber,
      timecode: formatTimecode(s.startTime),
      duration: s.duration,
      palette: s.palette,
      dominantColor: s.dominantColor,
      luminance: s.luminance,
      warmth: s.warmth,
      saturation: s.saturation,
      analysis: s.analysis || null,
    })),
  };
  rootFolder.file("color_script.json", JSON.stringify(colorScriptData, null, 2));

  // 5. If Color Script Canvas provided, add image
  if (colorScriptCanvas) {
    const csData = colorScriptCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    rootFolder.file("Color_Script_Panoramic_Strip.png", csData, { base64: true });
  }

  // Generate ZIP file and trigger browser download
  const blob = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Downloads a single image or GIF
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
