/**
 * Utility functions for formatting and parsing video timecodes.
 * Handles short clips (< 1 min), mid-length (5-15 mins), and full feature films (1h - 3h+).
 */

export function formatTimecode(seconds: number, includeFrames: boolean = false): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (includeFrames) {
    const frames = Math.floor((seconds % 1) * 24);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  }

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parses time strings formatted as "MM:SS" or "HH:MM:SS" into seconds
 */
export function parseTimecode(str: string): number {
  if (!str) return 0;
  const parts = str.trim().split(":").map((p) => parseFloat(p) || 0);
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length >= 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}
