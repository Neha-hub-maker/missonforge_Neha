import { useMissionStore } from "../../../stores/mission-store";
import { Button } from "../../ui/button";
import { useTranslation } from "react-i18next";
import { Play, Sparkles, Compass, Rocket, Home } from "lucide-react";
import mentorDoctorImg from "../../../assets/mentor-doctor.jpg";

export function FirstTimeCadetIntro() {
  const isOpen = useMissionStore((s) => s.showCadetIntroModal);
  const closeCadetIntro = useMissionStore((s) => s.closeCadetIntro);
  const openVideo = useMissionStore((s) => s.openVideo);
  const setHasSeenIntro = useMissionStore((s) => s.setHasSeenIntroVideo);
  const goHome = useMissionStore((s) => s.goHome);
  const enterCityPlaza = useMissionStore((s) => s.enterCityPlaza);
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="First Time Space Cadet Orientation"
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-400/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-cyan-900/60 text-slate-100">
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Top Header Row with Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Rocket className="size-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              MISSION FORGE · CADET INDUCTION
            </span>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
              New Cadet Orientation
            </span>
          </div>

          <button
            onClick={goHome}
            aria-label={t("ui.nav.backHome")}
            className="flex items-center gap-1 rounded-lg border border-cyan-500/40 px-2 py-1 text-xs font-bold text-cyan-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Home className="size-4" /> {t("ui.game.home")}
          </button>
        </div>

        {/* Mentor Greeting Card */}
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-4">
          <div className="relative shrink-0">
            <img
              src={mentorDoctorImg}
              alt="Dr. Ayesha - Cadet Mentor"
              className="size-16 rounded-full border-2 border-cyan-400 object-cover shadow-md"
            />
            <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white">Dr. Ayesha</h4>
              <span className="text-[11px] text-cyan-400 font-medium">· Mission Scientist & Mentor</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              "Welcome to Mission Forge, Cadet! Before you design rockets and blast into the solar system, watch this special orientation video to discover why humanity explores the cosmos and how satellites protect life on Earth!"
            </p>
          </div>
        </div>

        {/* Video Feature Highlight Card */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Video 1 of 3: Introductory Lesson</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">Ages 8–14</span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-white">
            Why Do We Explore Space? The Importance of Space Exploration
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Watch the video briefing, then complete the interactive 3-question quiz to earn your first space badge: <strong>Cosmic Explorer Cadet 🌟</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            onClick={() => {
              closeCadetIntro();
              openVideo("v01");
            }}
            className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 font-extrabold text-slate-950 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/30 text-sm"
          >
            <Play className="mr-2 size-4 fill-slate-950" />
            Watch Briefing (V01) & Quiz
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setHasSeenIntro(true);
              enterCityPlaza();
            }}
            className="border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Compass className="mr-1.5 size-4" />
            Enter City Directly
          </Button>
        </div>

        {/* Reassurance note for re-watching */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          💡 <em>You can re-watch all 3 videos and retake quizzes anytime from the Forge City Academy, Main Menu, or Navigation Bar!</em>
        </p>
      </div>
    </div>
  );
}
