import React, { useState } from "react";
import { X, BookOpen, ExternalLink, Camera, Compass, Sun, Layers, Eye, Film } from "lucide-react";

interface TaxonomyReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxonomyReferenceModal: React.FC<TaxonomyReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    "size" | "angle" | "framing" | "movement" | "focus" | "composition" | "lens" | "lighting"
  >("size");

  if (!isOpen) return null;

  const categories = [
    { id: "size", name: "1. Shot Size", icon: Camera },
    { id: "angle", name: "2. Camera Angle", icon: Compass },
    { id: "framing", name: "3. Framing & Staging", icon: Layers },
    { id: "movement", name: "4. Camera Movement", icon: Film },
    { id: "focus", name: "5. Focus & Depth", icon: Eye },
    { id: "composition", name: "6. Composition", icon: Compass },
    { id: "lens", name: "7. Lens & Optics", icon: Camera },
    { id: "lighting", name: "8. Lighting Setup", icon: Sun },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-300 border border-white/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white">
                StudioBinder & Eyecannndy Cinematography Grammar
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                Official 8-axis taxonomy reference used by CineShot's AI analyzer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.studiobinder.com/camera-shots/"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-white border border-white/15 px-3 py-1 rounded-full flex items-center gap-1.5 hidden sm:inline-flex transition-colors"
            >
              <span>StudioBinder Guide</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area with Category Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="md:w-56 p-3 border-b md:border-b-0 md:border-r border-white/10 bg-neutral-950 flex md:flex-col gap-1 overflow-x-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full px-3 py-2 rounded-full text-left text-[10px] uppercase tracking-widest font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-white text-black shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-950/60">
            {activeCategory === "size" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Shot Sizes (Camera Distance & Field of View)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Extreme Wide Shot (EWS)</span>
                    <p className="text-neutral-400 leading-relaxed">Subject is tiny or barely visible. Used to establish vast scale, setting, solitude, or overwhelming environments.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Wide Shot (WS) / Establishing</span>
                    <p className="text-neutral-400 leading-relaxed">Shows the subject from head to toe while prominently displaying spatial context and surroundings.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Full Shot (FS)</span>
                    <p className="text-neutral-400 leading-relaxed">Frames the character head to toe, filling the height of the frame. Highlights action, posture, and wardrobe.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Medium Full / Cowboy Shot (MFS)</span>
                    <p className="text-neutral-400 leading-relaxed">Mid-thigh to head (classic Western holster framing). Shows both character expression and ready action.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Medium Shot (MS)</span>
                    <p className="text-neutral-400 leading-relaxed">Waist up. The standard dialogue and conversational shot size in narrative cinema.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Medium Close-Up (MCU)</span>
                    <p className="text-neutral-400 leading-relaxed">Chest to head. Balances facial emotion and physical gesture without extreme intensity.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Close-Up (CU)</span>
                    <p className="text-neutral-400 leading-relaxed">Head and shoulders. Maximizes emotional connection, subtle reactions, and psychological intimacy.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Extreme Close-Up (ECU)</span>
                    <p className="text-neutral-400 leading-relaxed">Isolates a single detail: eyes, lips, a ticking watch, or a trigger pull. Creates visceral tension.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "angle" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Camera Angles (Vertical & Pitch Perspective)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Eye Level</span>
                    <p className="text-neutral-400 leading-relaxed">Neutral, objective viewpoint mirroring human sightlines.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Low Angle</span>
                    <p className="text-neutral-400 leading-relaxed">Shooting up at the subject. Grants power, dominance, menace, or heroic grandeur.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">High Angle</span>
                    <p className="text-neutral-400 leading-relaxed">Looking down at the subject. Conveys vulnerability, smallness, weakness, or defeat.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Dutch Angle (Canted)</span>
                    <p className="text-neutral-400 leading-relaxed">Horizon line is deliberately tilted. Induces psychological unrest, mania, delirium, or chaos.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Overhead / Bird's Eye (90°)</span>
                    <p className="text-neutral-400 leading-relaxed">Directly top-down. Highlights choreography, geometric floor patterns, or divine detachment.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Ground Level / Worm's Eye</span>
                    <p className="text-neutral-400 leading-relaxed">Camera placed directly on the floor. Emphasizes footsteps, gravel, or towering heights.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "framing" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Framing & Character Staging
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Single</span>
                    <p className="text-neutral-400 leading-relaxed">Only one character in frame. Focuses exclusively on their experience or solitary journey.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Two Shot</span>
                    <p className="text-neutral-400 leading-relaxed">Two characters framed together. Explores chemistry, negotiation, romance, or conflict.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Over-the-Shoulder (OTS)</span>
                    <p className="text-neutral-400 leading-relaxed">Looking past one character's shoulder to see the other. Establishes conversational depth.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Point of View (POV)</span>
                    <p className="text-neutral-400 leading-relaxed">Simulates exact optical vision of a character, putting the viewer directly in their shoes.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Insert / Cutaway</span>
                    <p className="text-neutral-400 leading-relaxed">Close detail on a specific prop (note, clock, compass, key) essential to narrative progression.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Dirty Single</span>
                    <p className="text-neutral-400 leading-relaxed">Single shot with a slice of another person in foreground, reminding us of active presence.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "movement" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Camera Movement & Dynamic Rigs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Static / Locked Off</span>
                    <p className="text-neutral-400 leading-relaxed">Tripod mounted, zero motion. Draws attention purely to actor movement and composition.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Dolly Push-In / Pull-Out</span>
                    <p className="text-neutral-400 leading-relaxed">Physical camera track moving into or away from subject, altering spatial perspective.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Steadicam / Tracking</span>
                    <p className="text-neutral-400 leading-relaxed">Fluid glide through corridors and spaces following characters in motion.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Crane / Jib / Pedestal</span>
                    <p className="text-neutral-400 leading-relaxed">Sweeping vertical lifts that ascend above obstacles to reveal landscapes or climaxes.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Handheld</span>
                    <p className="text-neutral-400 leading-relaxed">Organic breathing camera shake. Adds documentary realism, panic, or immediacy.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Whip Pan</span>
                    <p className="text-neutral-400 leading-relaxed">High-speed motion-blur rotation used for kinetic scene transitions or comedic reveals.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "focus" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Focus & Depth of Field
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Deep Focus</span>
                    <p className="text-neutral-400 leading-relaxed">Foreground, midground, and background are all sharp (Citizen Kane style). Shows complex multi-layer staging.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Shallow Focus (Bokeh)</span>
                    <p className="text-neutral-400 leading-relaxed">Narrow focal plane with creamy out-of-focus background. Isolates subject from noise.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Rack Focus</span>
                    <p className="text-neutral-400 leading-relaxed">Shifting focus between planes within a single shot to redirect viewer attention.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Split Diopter</span>
                    <p className="text-neutral-400 leading-relaxed">Optical lens filter keeping extreme close-up foreground AND deep background simultaneously crisp.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "composition" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Composition & Geometry
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Rule of Thirds</span>
                    <p className="text-neutral-400 leading-relaxed">Aligning subjects along 3x3 grid lines and cross intersections for dynamic balance.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Center Framed / Symmetrical</span>
                    <p className="text-neutral-400 leading-relaxed">Perfect bilateral symmetry (Stanley Kubrick / Wes Anderson style). Conveys order, obsession, or divine fate.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Leading Lines</span>
                    <p className="text-neutral-400 leading-relaxed">Environmental roads, tunnels, or rails guiding the viewer's eye straight toward the focal subject.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Frame Within a Frame</span>
                    <p className="text-neutral-400 leading-relaxed">Doorways, car windows, archways, or mirrors enclosing the subject to emphasize entrapment or surveillance.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "lens" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Lens Optics & Focal Length
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Wide Angle (&lt;28mm)</span>
                    <p className="text-neutral-400 leading-relaxed">Exaggerates depth and speed; makes characters seem further apart than they are.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Standard / Normal (35-50mm)</span>
                    <p className="text-neutral-400 leading-relaxed">Closest approximation of natural human eye perspective with zero spatial distortion.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Telephoto (85mm+)</span>
                    <p className="text-neutral-400 leading-relaxed">Compresses distance, bringing background close to foreground; creates cinematic separation.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Anamorphic (2.39:1)</span>
                    <p className="text-neutral-400 leading-relaxed">Iconic widescreen format with oval out-of-focus highlights and horizontal streak flares.</p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "lighting" && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400">
                  Lighting Setups & Atmosphere
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">High Key</span>
                    <p className="text-neutral-400 leading-relaxed">Bright, even illumination with low contrast and minimal shadows (comedies, musicals, sci-fi).</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Low Key / Chiaroscuro</span>
                    <p className="text-neutral-400 leading-relaxed">Dark moody shadows, stark dramatic contrast (film noir, psychological thrillers, horror).</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Golden Hour</span>
                    <p className="text-neutral-400 leading-relaxed">Low warm sun angle right after sunrise or before sunset with rich amber and long soft shadows.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Silhouette / Backlight</span>
                    <p className="text-neutral-400 leading-relaxed">Subject is dark against a brightly illuminated background, emphasizing form and mystery.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Neon / Stylized Colored</span>
                    <p className="text-neutral-400 leading-relaxed">Saturated colored lights (cyan, magenta, amber) creating distinct neo-noir cyberpunk mood.</p>
                  </div>
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5">
                    <span className="font-serif italic text-sm text-white block mb-1">Rembrandt Lighting</span>
                    <p className="text-neutral-400 leading-relaxed">Classic key light setup creating an illuminated triangle on the shadowed cheek.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500">
            StudioBinder & Eyecannndy Cinematography Guides
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold bg-white text-black hover:bg-neutral-200 transition-colors shadow"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
