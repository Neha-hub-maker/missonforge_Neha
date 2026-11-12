import { LaunchPreviewProvider, LaunchVehiclePreviewScene, useLaunchPreviewMode } from "./LaunchVehiclePreview";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";

// Prevent R3F pierced-prop crash on Vite/TanStack dev attributes like `data-tsd-source`
const ensureDataProp = (proto: any) => {
  if (proto && !Object.prototype.hasOwnProperty.call(proto, "data")) {
    Object.defineProperty(proto, "data", {
      get() {
        if (!this._data || typeof this._data !== "object") this._data = {};
        // Dev only: TanStack devtools tags elements with data-tsd-source, which R3F
        // pierces into data.tsd.source. Keep data.tsd an object that always accepts it.
        const d = this._data;
        if (typeof d.tsd !== "object" || d.tsd === null) {
          const sink = {};
          Object.defineProperty(d, "tsd", { get: () => sink, set: () => {}, configurable: true, enumerable: false });
        }
        return d;
      },
      set(val) {
        this._data = val;
      },
      configurable: true,
      enumerable: false,
    });
  }
};
ensureDataProp(THREE.Object3D.prototype);
ensureDataProp(THREE.Material.prototype);
ensureDataProp(THREE.BufferGeometry.prototype);
ensureDataProp(THREE.Texture.prototype);
ensureDataProp(THREE.Color.prototype);
ensureDataProp(THREE.Fog.prototype);
import i18n from "../../lib/i18n";
import { LearnLab } from "./LearnLab";
import { Ayesha } from "./Ayesha";
import { useMissionStore } from "../../stores/mission-store";
import { Universe } from "./Universe";
import { BuildScene, DockingScene, LandingScene, LaunchScene } from "./Stages";
import { Hud } from "./Hud";
import { rt } from "./runtime";
import { PlanetScene } from "./Presentation";
import { ForgeCity } from "./city/ForgeCity";
import { CityLearningActivity } from "./city/CityLearningActivity";
import { CityOverlay } from "./city/CityOverlay";
import { CadetVideoAcademy } from "./video/CadetVideoAcademy";
import { FirstTimeCadetIntro } from "./video/FirstTimeCadetIntro";

export function Game() {
  return <LaunchPreviewProvider><GameContent /></LaunchPreviewProvider>;
}

function GameContent() {
  const { hangar } = useLaunchPreviewMode();
  const phase = useMissionStore((s) => s.phase),
    cam = useMissionStore((s) => s.cam),
    quality = useMissionStore((s) => s.quality);
  const lang = useMissionStore((s) => s.lang);
  useEffect(() => {
    void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const drag = useRef<{ x: number; y: number } | null>(null);
  const cockpit = cam === "cockpit" && (phase === "flight" || phase === "encounter");

  // Determine which 3D scene to render in WebGL
  const learning = phase === "classroom" || phase === "training" || phase === "research";
  const sceneKey =
    phase === "vehicle" || (phase === "build" && hangar)
      ? "vehicle-preview"
      : phase === "city" || learning
      ? "city"
      : ["craft", "build", "check"].includes(phase)
      ? "hangar"
      : ["menu", "missions", "vehicle", "brief", "overview", "objectives", "budget", "fuel", "power", "comms", "instruments"].includes(phase)
      ? "planet"
      : phase === "launch"
      ? "launch"
      : phase === "docking"
      ? "docking"
      : phase === "landing" || phase === "report"
      ? "landing"
      : "universe";

  const scene =
    sceneKey === "vehicle-preview" ? (
      <LaunchVehiclePreviewScene />
    ) : sceneKey === "city" ? (
      <ForgeCity />
    ) : sceneKey === "hangar" ? (
      <BuildScene />
    ) : sceneKey === "planet" ? (
      <PlanetScene />
    ) : sceneKey === "launch" ? (
      <LaunchScene />
    ) : sceneKey === "docking" ? (
      <DockingScene />
    ) : sceneKey === "landing" ? (
      <LandingScene />
    ) : (
      <Universe />
    );

  const rotated = () => window.matchMedia("(orientation: portrait)").matches;

  return (
    <div className="mf-game-stage">
      <div className="mf-game-viewport" data-phase={phase}>
        <div
          className={`absolute inset-0 ${learning ? "touch-pan-y" : "touch-none"} select-none overflow-hidden bg-background`}
          onPointerDown={(e) => {
            if (cockpit && e.target instanceof HTMLCanvasElement) drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!drag.current || !cockpit) return;
            let dx = e.clientX - drag.current.x,
              dy = e.clientY - drag.current.y;
            if (rotated()) [dx, dy] = [dy, -dx];
            drag.current = { x: e.clientX, y: e.clientY };
            rt.yaw = Math.max(-1.6, Math.min(1.6, rt.yaw - dx * 0.004));
            rt.pitch = Math.max(-0.9, Math.min(0.9, rt.pitch - dy * 0.004));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onPointerLeave={() => {
            drag.current = null;
          }}
        >
          {/* 3D WebGL Canvas */}
          <Canvas
            // Preview framing uses the logical landscape stage before its portrait rotation.
            resize={{ offsetSize: sceneKey === "vehicle-preview" }}
            dpr={quality === "high" ? [1, 1.5] : 1}
            camera={
              phase === "city"
                ? { position: [0, 8, 20], fov: 60, near: 0.1, far: 2000 }
                : { position: [0, 3, 8], fov: 55, near: 0.005, far: 2000 }
            }
            gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
          >
            <Suspense fallback={null}>
              <group key={sceneKey}>{learning ? null : scene}</group>
            </Suspense>
          </Canvas>

          {/* Overlays according to game phase */}
          {learning ? <CityLearningActivity key={phase} activity={phase} /> : phase === "city" ? <CityOverlay /> : <Hud />}

          <Ayesha />
          <LearnLab />
          <FirstTimeCadetIntro />
          <CadetVideoAcademy />
        </div>
      </div>
    </div>
  );
}
