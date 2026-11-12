import { useTranslation } from "react-i18next";
import { useMissionStore } from "../../../stores/mission-store";
import { FORGE_CITY_DISTRICTS } from "./city-data";
import { Button } from "../../ui/button";
import { Compass, ChevronRight, Rocket, Building2, Home } from "lucide-react";

export function CityOverlay() {
  const { t } = useTranslation();
  const completed = useMissionStore((s) => s.completedCityActivities);
  const activeZoneId = useMissionStore((s) => s.activeCityZone);
  const go = useMissionStore((s) => s.go);
  const openAcademy = useMissionStore((s) => s.openAcademy);
  const goHome = useMissionStore((s) => s.goHome);
  const newRun = useMissionStore((s) => s.newRun);
  const activeZone = FORGE_CITY_DISTRICTS.find((z) => z.id === activeZoneId);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header Card */}
      <header className="flex items-start justify-between gap-4">
        {/* District Compass Card */}
        <div className="pointer-events-auto rounded-xl border border-cyan-500/30 bg-slate-950/75 p-3.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 text-cyan-400">
            <Compass className="size-4 animate-spin-slow" />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              FORGE CITY · EARTH SPACEPORT HUB
            </span>
          </div>
          <h2 className="mt-0.5 text-base font-extrabold text-slate-100 sm:text-lg">
            {activeZone ? activeZone.name : "Central City Plaza"}
          </h2>
          <p className="text-[11px] text-slate-400">
            {activeZone ? activeZone.sub : "Navigable Pedestrian Campus & District Network"}
          </p>
        </div>

        {/* Navigation & Video Actions */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goHome()}
            className="border-cyan-500/50 bg-slate-900/90 text-xs font-bold text-cyan-300 hover:bg-cyan-950 hover:text-white shadow-md shadow-cyan-950/40"
          >
            <Home className="mr-1.5 size-3.5" /> {t("ui.nav.backHome")}
          </Button>
          <Button
            size="sm"
            onClick={() => openAcademy()}
            className="bg-amber-400 font-extrabold text-slate-950 hover:bg-amber-300 text-xs shadow-md shadow-amber-400/20"
          >
            🎬 {t("ui.nav.videoAcademy")} (3)
          </Button>
          <Button
            size="sm"
            onClick={() => newRun("missions")}
            className="bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-400 text-xs"
          >
            <Rocket className="mr-1 size-3.5" /> Launch Operations
          </Button>
        </div>
      </header>

      {/* Exploration Controls Indicator */}
      <div className="pointer-events-auto self-start rounded-lg border border-slate-800 bg-slate-950/65 px-3 py-2 text-[11px] text-slate-400 backdrop-blur-sm">
        <span className="font-semibold text-slate-200">Exploration Controls:</span> Use{" "}
        <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">W</kbd>
        <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">A</kbd>
        <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">S</kbd>
        <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">D</kbd> or Arrow Keys to walk.
        Hold <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-300">Shift</kbd> to sprint.
      </div>

      {/* Proximity Interaction Prompt */}
      <footer className="flex flex-col items-center">
        {activeZone ? (
          <div className="pointer-events-auto flex max-w-md animate-bounce-subtle items-center justify-between gap-4 rounded-2xl border border-cyan-400/60 bg-cyan-950/85 p-4 shadow-[0_0_30px_rgba(0,229,255,0.25)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeZone.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{activeZone.name}</h3>
                <p className="text-[11px] text-cyan-200">{activeZone.sub}</p>
              </div>
            </div>
            {activeZone.targetPhase && (
              <Button
                onClick={() => activeZone.targetPhase && go(activeZone.targetPhase)}
                className="bg-cyan-400 font-bold text-slate-950 hover:bg-cyan-300"
              >
                Press <span className="mx-1 rounded bg-slate-950 px-1.5 py-0.5 text-xs text-cyan-300">E</span> Enter
                <ChevronRight className="ml-1 size-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs text-slate-300 backdrop-blur-sm">
            <Building2 className="size-3.5 text-cyan-400" />
            <span>Walk toward any district (Space Center, Research Campus, Hangar, Spaceport) to explore.</span>
          </div>
        )}

        {/* District Fast-Travel Strip */}
        <div className="pointer-events-auto mt-4 flex max-w-full flex-wrap justify-center items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/85 p-1.5 backdrop-blur-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goHome()}
            className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white"
          >
            <Home className="size-3.5" /> {t("ui.game.home")}
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          {(["classroom", "training", "research"] as const).map((activity) => (
            <Button key={activity} variant="ghost" size="sm" onClick={() => go(activity)} aria-label={`${t(`cityLearning.${activity}.short`)} — ${t(`cityLearning.${activity}.title`)}${completed.includes(activity) ? ` · ${t("cityLearning.completed")}` : ""}`}>
              {t(`cityLearning.${activity}.short`)}{completed.includes(activity) && <span aria-hidden="true">✓</span>}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAcademy()}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200"
          >
            🎬 {t("ui.nav.videoAcademy")}
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go("missions")}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400"
          >
            🚀 Space Center
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go("build")}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-orange-400"
          >
            🔧 Assembly Hangar
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go("check")}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-rose-400"
          >
            🔥 Launch Pad 39X
          </Button>
        </div>
      </footer>
    </div>
  );
}
