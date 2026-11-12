import { DEFAULT_LAUNCH_VEHICLE, normalizeLaunchVehicle } from "../lib/launch-vehicles";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Design, EngineId, Instrument, MissionId, Outcome, RouteId } from "../lib/mission-sim";

export type Phase =
  | "city"
  | "classroom"
  | "training"
  | "research"
  | "menu"
  | "missions"
  | "vehicle"
  | "brief"
  | "route"
  | "routePreview"
  | "objectives"
  | "budget"
  | "fuel"
  | "power"
  | "comms"
  | "instruments"
  | "overview"
  | "craft"
  | "build"
  | "check"
  | "launch"
  | "flight"
  | "encounter"
  | "failure"
  | "rescue"
  | "docking"
  | "landing"
  | "report";

import { CURRENT_STORAGE_KEY, resetAllSessionsAndRestart } from "../lib/session-manager";

export type CityActivity = "classroom" | "training" | "research";

export type { MissionId, RouteId };
export type Lang = "en" | "bn" | "hi" | "es" | "ar" | "fr";

export interface VideoModalState {
  isOpen: boolean;
  videoId: "v01" | "v02" | "v03";
  initialTab: "video" | "quiz";
}

type State = Design & {
  phase: Phase;
  cam: "chase" | "cockpit";
  quality: "high" | "low";
  referenceModel: boolean;
  activeNasaModel?: string | undefined;
  activeCityZone: string | null;
  completedCityActivities: CityActivity[];
  completeCityActivity: (activity: CityActivity) => void;
  // Video and Quiz System for Cadets (Ages 8-14)
  hasSeenIntroVideo: boolean;
  videoModal: VideoModalState | null;
  showCadetIntroModal: boolean;
  openCadetIntro: () => void;
  closeCadetIntro: () => void;
  watchedVideos: string[];
  quizScores: Record<string, { passed: boolean; score: number; total: number }>;
  openVideo: (videoId: "v01" | "v02" | "v03", initialTab?: "video" | "quiz") => void;
  closeVideo: () => void;
  /** Opens the Video Academy at the first lesson whose badge is not yet earned. */
  openAcademy: () => void;
  /** Universal "Back to Home": closes every modal/overlay and returns to the Home landing stage. */
  goHome: () => void;
  /** Primary hub: lands the cadet in Central City Plaza with all overlays closed. */
  enterCityPlaza: () => void;
  markVideoWatched: (videoId: string) => void;
  recordQuizResult: (videoId: string, score: number, total: number) => void;
  setHasSeenIntroVideo: (seen: boolean) => void;
  resetAllSessions: () => void;
  outcome: Outcome | null;
  rescueKit: string[];
  rescued: boolean;
  landing: number;
  landingErrors: number;
  dvSpent: number;
  attempts: number;
  craft: "explorer" | "surveyor" | "guardian";
  budget: number;
  objective: "surface" | "orbit" | "survey";
  lang: Lang;
  muted: boolean;
  captions: boolean;
  learn: string | null;
  ayeshaSeen: string[];
  status: { id: number; text: string; tone: "info" | "ok" | "warn" | "danger" }[];
  set: (p: Partial<State>) => void;
  go: (phase: Phase) => void;
  toggleInstrument: (i: Instrument) => void;
  say: (text: string, tone?: "info" | "ok" | "warn" | "danger") => void;
  newRun: (phase?: Phase) => void;
};

const run = { outcome: null, rescueKit: [], rescued: false, landing: 0, landingErrors: 0, dvSpent: 0 };
const ship: Design = {
  launchVehicle: DEFAULT_LAUNCH_VEHICLE,
  mission: "Mars",
  route: "safe",
  engine: "chemical" as EngineId,
  engines: 1,
  tanks: 4,
  wings: 4,
  rtgs: 0,
  antennas: 1,
  shield: true,
  battery: false,
  instruments: ["camera"],
  fuel: 100,
};
let sid = 0;

export const useMissionStore = create<State>()(
  persist(
    (set) => ({
      ...ship,
      ...run,
      phase: "menu", // Starts on the cinematic Home Landing Screen (Rotating Earth)
      lang: "en",
      muted: false,
      captions: true,
      learn: null,
      ayeshaSeen: [],
      cam: "chase",
      quality: "high",
      attempts: 0,
      craft: "explorer",
      budget: 2,
      objective: "surface",
      status: [],
      referenceModel: false,
      activeNasaModel: undefined,
      activeCityZone: "space-center",
      completedCityActivities: [],
      completeCityActivity: (activity) =>
        set((s) => ({
          completedCityActivities: s.completedCityActivities.includes(activity)
            ? s.completedCityActivities
            : [...s.completedCityActivities, activity],
        })),
      // Video Academy state
      hasSeenIntroVideo: false,
      videoModal: null,
      showCadetIntroModal: false,
      openCadetIntro: () => set({ showCadetIntroModal: true }),
      closeCadetIntro: () => set({ showCadetIntroModal: false }),
      watchedVideos: [],
      quizScores: {},
      openVideo: (videoId, initialTab = "video") =>
        set({ videoModal: { isOpen: true, videoId, initialTab } }),
      closeVideo: () => set({ videoModal: null }),
      openAcademy: () =>
        set((s) => {
          const next = (["v01", "v02", "v03"] as const).find((id) => !s.quizScores[id]?.passed) ?? "v01";
          return { videoModal: { isOpen: true, videoId: next, initialTab: "video" } };
        }),
      goHome: () =>
        set({ phase: "menu", referenceModel: false, videoModal: null, showCadetIntroModal: false, learn: null }),
      enterCityPlaza: () =>
        set({ phase: "city", activeCityZone: null, referenceModel: false, videoModal: null, showCadetIntroModal: false, learn: null }),
      markVideoWatched: (videoId) =>
        set((s) => ({
          watchedVideos: s.watchedVideos.includes(videoId)
            ? s.watchedVideos
            : [...s.watchedVideos, videoId],
          hasSeenIntroVideo: videoId === "v01" ? true : s.hasSeenIntroVideo,
        })),
      // Retakes never lose an earned badge: keep the best score and a sticky "passed" flag.
      recordQuizResult: (videoId, score, total) =>
        set((s) => {
          const prev = s.quizScores[videoId];
          return {
            quizScores: {
              ...s.quizScores,
              [videoId]: {
                passed: score >= 2 || !!prev?.passed,
                score: Math.max(score, prev?.score ?? 0),
                total,
              },
            },
            hasSeenIntroVideo: videoId === "v01" ? true : s.hasSeenIntroVideo,
          };
        }),
      setHasSeenIntroVideo: (seen) => set({ hasSeenIntroVideo: seen }),
      resetAllSessions: () => {
        resetAllSessionsAndRestart();
      },
      set: (p) => set(p as never),
      go: (phase) => set({ phase, referenceModel: false }),
      toggleInstrument: (i) =>
        set((s) => ({
          instruments: s.instruments.includes(i) ? s.instruments.filter((x) => x !== i) : [...s.instruments, i],
        })),
      say: (text, tone = "info") =>
        set((s) => ({ status: [{ id: ++sid, text, tone }, ...s.status].slice(0, 4) })),
      newRun: (phase = "build") => set((s) => ({ ...run, phase, attempts: s.attempts + 1, status: [] })),
    }),
    {
      name: CURRENT_STORAGE_KEY,
      partialize: (s) => {
        const {
          status,
          videoModal,
          showCadetIntroModal,
          set: _a,
          go: _b,
          toggleInstrument: _c,
          say: _d,
          newRun: _e,
          completeCityActivity: _f,
          openVideo: _g,
          closeVideo: _h,
          markVideoWatched: _i,
          recordQuizResult: _j,
          setHasSeenIntroVideo: _k,
          resetAllSessions: _l,
          openCadetIntro: _m,
          closeCadetIntro: _n,
          openAcademy: _o,
          goHome: _p,
          enterCityPlaza: _q,
          ...rest
        } = s;
        void status;
        void videoModal;
        void showCadetIntroModal;
        return rest as never;
      },
      // Mid-animation phases resume at a safe checkpoint
      merge: (p, c) => {
        const s = { ...c, ...(p as object) } as State;
        s.launchVehicle = normalizeLaunchVehicle(s.launchVehicle);
        if (["launch", "docking"].includes(s.phase)) s.phase = s.phase === "launch" ? "check" : "rescue";
        if (s.phase === "encounter" && !s.outcome) s.phase = "flight";
        return s;
      },
    },
  ),
);

export const designOf = (s: Design): Design => ({
  launchVehicle: normalizeLaunchVehicle(s.launchVehicle),
  mission: s.mission,
  route: s.route,
  engine: s.engine,
  engines: s.engines,
  tanks: s.tanks,
  wings: s.wings,
  rtgs: s.rtgs,
  antennas: s.antennas,
  shield: s.shield,
  battery: s.battery,
  instruments: s.instruments,
  fuel: s.fuel,
});
