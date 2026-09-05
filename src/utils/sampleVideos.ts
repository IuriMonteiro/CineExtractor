import { SampleVideo } from "../types";

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "cinematic-anthology",
    title: "Cinematic 4-Scene Anthology",
    duration: "0:10",
    genre: "Drama / Noir / Sci-Fi",
    description: "4 distinct cinematic cuts: Desert Golden Hour, Neon Cyberpunk Alley, Emerald Deep Abyss, and Crimson Sunset.",
    url: "/videos/cinematic_anthology.mp4",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
  },
  {
    id: "high-key-action",
    title: "High-Key Action & Nature",
    duration: "0:10",
    genre: "Action / Adventure",
    description: "High-key daylight snow summit, tracking shot forest canopy, azure sky aerial, and dusk sprint.",
    url: "/videos/high_key_action.mp4",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
  },
  {
    id: "nocturne-chiaroscuro",
    title: "Nocturne & Chiaroscuro Sequence",
    duration: "0:10",
    genre: "Thriller / Neo-Noir",
    description: "Deep shadows, high-contrast chiaroscuro corridor, amber streetlamp rim lighting, and midnight fog silhouette.",
    url: "/videos/nocturne_chiaroscuro.mp4",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80",
  },
];

/**
 * Creates a synthetic multi-shot video blob on the fly via canvas MediaRecorder
 * if offline or testing instantly without external network requests!
 */
export async function createSyntheticDemoVideo(): Promise<{ url: string; duration: number }> {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d")!;

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  // Define 4 distinctly colored dramatic scenes with different compositions
  const scenes = [
    {
      name: "Scene 1: Golden Hour Desert",
      bgGradient: ["#f59e0b", "#d97706", "#78350f"],
      type: "Extreme Wide Shot • Golden Hour",
      draw: (t: number) => {
        // Horizon and sun
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(320 + Math.sin(t) * 20, 220, 70, 0, Math.PI * 2);
        ctx.fill();
        // Desert dunes
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.moveTo(0, 250);
        ctx.quadraticCurveTo(200, 200, 400, 260);
        ctx.quadraticCurveTo(550, 310, 640, 240);
        ctx.lineTo(640, 360);
        ctx.lineTo(0, 360);
        ctx.fill();
        // Silhouette character
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(280, 240, 14, 35);
        ctx.beginPath();
        ctx.arc(287, 235, 7, 0, Math.PI * 2);
        ctx.fill();
      },
    },
    {
      name: "Scene 2: Neon Cyberpunk Alley",
      bgGradient: ["#0f172a", "#1e1b4b", "#3b0764"],
      type: "Medium Close-Up • Low Key Neon",
      draw: (t: number) => {
        // Neon lights
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 6;
        ctx.strokeRect(40, 40, 160, 240);
        ctx.strokeStyle = "#ec4899";
        ctx.strokeRect(440, 60, 140, 200);
        // Rain streaks
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
          const x = (i * 35 + t * 200) % 640;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x - 20, 120);
          ctx.stroke();
        }
        // Center dramatic portrait silhouette
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(320, 180, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(260, 235, 120, 125);
        // Rim lighting
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(320, 180, 55, Math.PI * 0.7, Math.PI * 1.3);
        ctx.stroke();
      },
    },
    {
      name: "Scene 3: Deep Sea Abyss",
      bgGradient: ["#022c22", "#064e3b", "#042f2e"],
      type: "Overhead Angle • Chiaroscuro",
      draw: (t: number) => {
        // Bioluminescence particles
        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = "#34d399";
          const px = (i * 45 + Math.sin(t + i) * 30) % 640;
          const py = (i * 25 + Math.cos(t + i) * 20) % 360;
          ctx.beginPath();
          ctx.arc(px, py, 4 + Math.sin(t * 2 + i) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Light shaft from above
        const grad = ctx.createLinearGradient(320, 0, 320, 360);
        grad.addColorStop(0, "rgba(52, 211, 153, 0.4)");
        grad.addColorStop(1, "rgba(52, 211, 153, 0.0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(250, 0);
        ctx.lineTo(390, 0);
        ctx.lineTo(480, 360);
        ctx.lineTo(160, 360);
        ctx.fill();
      },
    },
    {
      name: "Scene 4: High-Key Snow Summit",
      bgGradient: ["#f8fafc", "#e2e8f0", "#cbd5e1"],
      type: "Full Shot • High Key Daylight",
      draw: (t: number) => {
        // Mountain peaks
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(0, 360);
        ctx.lineTo(160, 140);
        ctx.lineTo(320, 260);
        ctx.lineTo(480, 100);
        ctx.lineTo(640, 360);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(130, 175);
        ctx.lineTo(160, 140);
        ctx.lineTo(190, 175);
        ctx.fill();

        // Lone climber red jacket
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(470, 90, 12, 20);
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(476, 85, 5, 0, Math.PI * 2);
        ctx.fill();
      },
    },
  ];

  return new Promise((resolve) => {
    mediaRecorder.start();

    const fps = 24;
    const sceneDuration = 2.5; // 2.5s per scene = 10s total
    const totalFrames = scenes.length * sceneDuration * fps;
    let frame = 0;

    const renderLoop = () => {
      if (frame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const currentSeconds = frame / fps;
      const sceneIndex = Math.min(scenes.length - 1, Math.floor(currentSeconds / sceneDuration));
      const currentScene = scenes[sceneIndex];

      // Draw background
      const grad = ctx.createLinearGradient(0, 0, 640, 360);
      grad.addColorStop(0, currentScene.bgGradient[0]);
      grad.addColorStop(0.5, currentScene.bgGradient[1]);
      grad.addColorStop(1, currentScene.bgGradient[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 360);

      // Draw scene graphics
      currentScene.draw(currentSeconds);

      // Letterbox overlay for cinematic 2.39:1 look
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 640, 32);
      ctx.fillRect(0, 328, 640, 32);

      // Slate text
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "12px monospace";
      ctx.fillText(`${currentScene.name} • ${currentScene.type}`, 20, 22);

      frame++;
      requestAnimationFrame(renderLoop);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      resolve({ url, duration: scenes.length * sceneDuration });
    };

    renderLoop();
  });
}
