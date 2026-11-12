import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Trophy,
  Compass,
  Home,
} from "lucide-react";
import { useMissionStore } from "../../../stores/mission-store";
import { SPACE_VIDEOS, type SpaceVideo, type QuizQuestion } from "../../../lib/video-catalog";
import { Button } from "../../ui/button";

export function CadetVideoAcademy() {
  const modal = useMissionStore((s) => s.videoModal);
  const closeVideo = useMissionStore((s) => s.closeVideo);
  const markVideoWatched = useMissionStore((s) => s.markVideoWatched);
  const recordQuizResult = useMissionStore((s) => s.recordQuizResult);
  const quizScores = useMissionStore((s) => s.quizScores);
  const watchedVideos = useMissionStore((s) => s.watchedVideos);
  const resetAllSessions = useMissionStore((s) => s.resetAllSessions);
  const goHome = useMissionStore((s) => s.goHome);
  const enterCityPlaza = useMissionStore((s) => s.enterCityPlaza);
  const captionsOn = useMissionStore((s) => s.captions);
  const { t } = useTranslation();

  const [activeVideoId, setActiveVideoId] = useState<"v01" | "v02" | "v03">(
    modal?.videoId || "v01"
  );
  const [tab, setTab] = useState<"video" | "quiz">(modal?.initialTab || "video");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (modal?.videoId) {
      setActiveVideoId(modal.videoId);
      setTab(modal.initialTab || "video");
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsChecked(false);
      setCurrentScore(0);
      setQuizFinished(false);
      setVideoEnded(false);
    }
  }, [modal]);

  const activeVideo: SpaceVideo =
    (SPACE_VIDEOS.find((v) => v.id === activeVideoId) ?? SPACE_VIDEOS[0])!;
  const activeQuiz = activeVideo.quiz;
  const currentQ: QuizQuestion = (activeQuiz[currentQIndex] ?? activeQuiz[0])!;
  const prevResult = quizScores[activeVideoId];

  // Switch video
  const handleSelectVideo = (id: "v01" | "v02" | "v03") => {
    setActiveVideoId(id);
    setTab("video");
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setCurrentScore(0);
    setQuizFinished(false);
    setVideoEnded(false);
    setShowHint(false);
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
    markVideoWatched(activeVideoId);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsChecked(true);
    if (selectedOption === currentQ.correctIndex) {
      setCurrentScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < activeQuiz.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setShowHint(false);
    } else {
      // Quiz finished
      const finalScore =
        selectedOption === currentQ.correctIndex ? currentScore : currentScore;
      recordQuizResult(activeVideoId, finalScore, activeQuiz.length);
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setCurrentScore(0);
    setQuizFinished(false);
    setShowHint(false);
  };

  const earnedCount = SPACE_VIDEOS.filter((v) => quizScores[v.id]?.passed).length;

  if (!modal?.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cadet Space Video Academy"
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 sm:p-4 md:p-6 backdrop-blur-md"
    >
      <div className="relative flex h-full max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl shadow-cyan-950/60 text-slate-100">
        {/* Top Header Bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-cyan-500/20 bg-slate-900/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Mission Forge · Cadet Space Academy
                </span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Ages 8–14
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-100 sm:text-lg">
                {activeVideo.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={goHome}
              aria-label={t("ui.nav.backHome")}
              className="border border-cyan-500/50 bg-slate-900 text-xs font-bold text-cyan-300 hover:bg-cyan-950 hover:text-white"
            >
              <Home className="mr-1 size-3.5" />
              <span className="sm:hidden">{t("ui.game.home")}</span>
              <span className="hidden sm:inline">{t("ui.nav.backHome")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset all sessions? This will wipe your progress and restart as a brand-new cadet.")) {
                  resetAllSessions();
                }
              }}
              className="hidden sm:inline-flex border-slate-700 bg-slate-900 text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200"
              title="Delete all sessions and restart freshly"
            >
              <RefreshCw className="mr-1 size-3.5" />
              Reset All Sessions
            </Button>

            <button
              onClick={closeVideo}
              aria-label="Close Space Academy"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        {/* Video Selector Tabs Bar */}
        <nav
          aria-label="Video selection"
          className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-800 bg-slate-950/70 p-2 sm:px-6"
        >
          {SPACE_VIDEOS.map((v, idx) => {
            const isSelected = v.id === activeVideoId;
            const isWatched = watchedVideos.includes(v.id);
            const scoreData = quizScores[v.id];
            return (
              <button
                key={v.id}
                onClick={() => handleSelectVideo(v.id)}
                className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition whitespace-nowrap ${
                  isSelected
                    ? "border-cyan-400/80 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-500/20"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">
                      {v.title}
                    </span>
                    {scoreData?.passed && (
                      <span className="text-[11px]" title="Quiz Passed!">
                        ⭐
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {scoreData
                      ? `Score: ${scoreData.score}/${scoreData.total}`
                      : isWatched
                      ? "Watched · Quiz Ready"
                      : v.durationLabel}
                  </div>
                </div>
              </button>
            );
          })}
          {/* Persisted badge shelf (useMissionStore.quizScores) */}
          <div
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-1.5"
            aria-label={`${t("ui.nav.badges")} ${earnedCount}/${SPACE_VIDEOS.length}`}
          >
            <Award className="size-3.5 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {t("ui.nav.badges")} {earnedCount}/{SPACE_VIDEOS.length}
            </span>
            {SPACE_VIDEOS.map((v) => (
              <span
                key={v.id}
                title={v.badge.name}
                className={quizScores[v.id]?.passed ? "text-base" : "text-base opacity-25 grayscale"}
              >
                {v.badge.icon}
              </span>
            ))}
          </div>
        </nav>

        {/* Mode Switcher: Video vs Quiz */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("video")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === "video"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Play className="size-3.5" />
              Watch Video
            </button>
            <button
              onClick={() => {
                setTab("quiz");
                handleRestartQuiz();
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === "quiz"
                  ? "bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Sparkles className="size-3.5" />
              Interactive Quiz & Badge
              {prevResult?.passed && <span className="text-amber-500">✓</span>}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            {tab === "video" ? (
              <span>Watch the briefing, then test your knowledge!</span>
            ) : (
              <span>Answer correctly to earn the Cadet Badge</span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "video" ? (
            /* ================= VIDEO VIEW ================= */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Player Card */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-black shadow-lg">
                  <video
                    key={activeVideo.file}
                    ref={videoRef}
                    controls
                    playsInline
                    preload="metadata"
                    onEnded={handleVideoEnded}
                    className="size-full object-contain bg-black"
                    src={activeVideo.file}
                  >
                    {activeVideo.captions?.map((c, i) => (
                      <track key={c.src} kind="captions" src={c.src} srcLang={c.lang} label={c.label} default={i === 0 && captionsOn} />
                    ))}
                  </video>

                  {videoEnded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 p-6 text-center backdrop-blur-sm animate-fade-in">
                      <Sparkles className="size-10 text-amber-400 animate-bounce-subtle" />
                      <h3 className="mt-2 text-xl font-bold text-white">
                        Briefing Complete!
                      </h3>
                      <p className="mt-1 max-w-md text-xs text-slate-300">
                        Excellent work watching the orientation video! You are now ready to take the interactive quiz and unlock your badge.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <Button
                          onClick={() => {
                            setTab("quiz");
                            handleRestartQuiz();
                          }}
                          className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
                        >
                          <Trophy className="mr-1.5 size-4" /> Take Interactive Quiz
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setVideoEnded(false);
                            videoRef.current?.play();
                          }}
                          className="border-slate-700 bg-slate-900 text-xs"
                        >
                          <RotateCcw className="mr-1.5 size-3.5" /> Replay Video
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      {activeVideo.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {activeVideo.subtitle}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setTab("quiz");
                      handleRestartQuiz();
                    }}
                    className="bg-amber-400 text-xs font-bold text-slate-950 hover:bg-amber-300 shadow-sm shadow-amber-400/20"
                  >
                    Take Quiz <ChevronRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Sidebar: Key Learnings & Badge Preview */}
              <div className="flex flex-col gap-4">
                {/* Learnings Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                    <BookOpen className="size-4" />
                    <span>Cadet Learning Mission</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {activeVideo.summary}
                  </p>

                  <h4 className="mt-4 text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Core Concepts
                  </h4>
                  <ul className="mt-2 space-y-2 text-xs text-slate-300">
                    {activeVideo.keyLearnings.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-cyan-400" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Badge Card */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/80 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeVideo.badge.icon}</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                        Badge Award
                      </div>
                      <h4 className="text-sm font-bold text-amber-200">
                        {activeVideo.badge.name}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {activeVideo.badge.tagline}
                      </p>
                    </div>
                  </div>
                  {prevResult?.passed ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300">
                      <span className="font-semibold">Badge Unlocked!</span>
                      <span>Score: {prevResult.score}/{prevResult.total} ⭐</span>
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-slate-400 italic">
                      Score at least 2 correct answers on the quiz to unlock this badge!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= QUIZ VIEW ================= */
            <div className="mx-auto max-w-2xl">
              {!quizFinished ? (
                <div className="flex flex-col gap-5">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                        Interactive Cadet Quiz
                      </span>
                      <h3 className="text-base font-bold text-slate-100">
                        Question {currentQIndex + 1} of {activeQuiz.length}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      {activeQuiz.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-8 rounded-full transition ${
                            i === currentQIndex
                              ? "bg-cyan-400"
                              : i < currentQIndex
                              ? "bg-emerald-400"
                              : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-5 shadow-lg">
                    <p className="text-base sm:text-lg font-semibold text-white leading-snug">
                      {currentQ.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="flex flex-col gap-2.5">
                    {currentQ.options.map((opt, i) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === currentQ.correctIndex;
                      let btnStyle =
                        "border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80";

                      if (isChecked) {
                        if (isCorrect) {
                          btnStyle =
                            "border-emerald-500 bg-emerald-950/60 text-emerald-200 shadow-sm shadow-emerald-500/20";
                        } else if (isSelected && !isCorrect) {
                          btnStyle =
                            "border-rose-500 bg-rose-950/60 text-rose-200";
                        } else {
                          btnStyle = "border-slate-800/50 bg-slate-900/30 text-slate-500 opacity-60";
                        }
                      } else if (isSelected) {
                        btnStyle =
                          "border-cyan-400 bg-cyan-950/50 text-cyan-100 shadow-md shadow-cyan-500/20";
                      }

                      return (
                        <button
                          key={i}
                          disabled={isChecked}
                          onClick={() => setSelectedOption(i)}
                          className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition ${btnStyle}`}
                        >
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                              isChecked && isCorrect
                                ? "bg-emerald-500 text-slate-950"
                                : isSelected
                                ? "bg-cyan-400 text-slate-950"
                                : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 text-sm font-medium">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {isChecked && (
                    <div
                      className={`rounded-xl border p-4 text-xs leading-relaxed animate-fade-in ${
                        selectedOption === currentQ.correctIndex
                          ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-200"
                          : "border-rose-500/50 bg-rose-950/40 text-rose-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm mb-1">
                        {selectedOption === currentQ.correctIndex ? (
                          <>
                            <CheckCircle2 className="size-4 text-emerald-400" />
                            <span>Correct! Excellent thinking Cadet!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="size-4 text-rose-400" />
                            <span>Not quite right!</span>
                          </>
                        )}
                      </div>
                      <p>{currentQ.explanation}</p>
                    </div>
                  )}

                  {/* Hint Toggle */}
                  {currentQ.hint && !isChecked && (
                    <div>
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        <HelpCircle className="size-3.5" />
                        <span>{showHint ? "Hide Hint" : "Need a hint?"}</span>
                      </button>
                      {showHint && (
                        <p className="mt-1 text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                          Hint: {currentQ.hint}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quiz Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTab("video")}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Back to Video
                    </Button>

                    {!isChecked ? (
                      <Button
                        disabled={selectedOption === null}
                        onClick={handleCheckAnswer}
                        className="bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-400"
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-emerald-400 font-bold text-slate-950 hover:bg-emerald-300"
                      >
                        {currentQIndex + 1 < activeQuiz.length
                          ? "Next Question"
                          : "View Final Results"}
                        <ChevronRight className="ml-1 size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* ================= QUIZ COMPLETE SCREEN ================= */
                <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-400/40 shadow-xl shadow-amber-500/10">
                    <Trophy className="size-10 text-amber-400 animate-bounce-subtle" />
                  </div>

                  <span className="mt-4 text-xs font-bold uppercase tracking-widest text-cyan-400">
                    Quiz Evaluation Completed
                  </span>
                  <h3 className="mt-1 text-2xl font-extrabold text-white">
                    {currentScore >= 2 ? "Congratulations Cadet!" : "Good Effort Cadet!"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    You scored <strong className="text-cyan-300">{currentScore}</strong> out of{" "}
                    <strong>{activeQuiz.length}</strong>!
                  </p>

                  {/* Star Rating */}
                  <div className="mt-3 flex gap-1.5 text-2xl">
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={
                          star <= currentScore
                            ? "text-amber-400 animate-pulse-subtle"
                            : "text-slate-700"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Badge Presentation Card */}
                  <div className="mt-6 w-full max-w-md rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950 p-5 shadow-lg shadow-amber-950/40">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{activeVideo.badge.icon}</span>
                      <div className="text-left">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                          {currentScore >= 2 || prevResult?.passed ? "Badge Earned!" : "Badge Locked"}
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {activeVideo.badge.name}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {activeVideo.badge.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Step Actions */}
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRestartQuiz}
                      className="border-slate-700 bg-slate-900 text-xs"
                    >
                      <RotateCcw className="mr-1.5 size-3.5" /> Retake Quiz
                    </Button>

                    {activeVideoId === "v01" && (
                      <Button
                        onClick={() => handleSelectVideo("v02")}
                        className="bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-400"
                      >
                        Next Video: Where Space Begins <ChevronRight className="ml-1 size-4" />
                      </Button>
                    )}

                    {activeVideoId === "v02" && (
                      <Button
                        onClick={() => handleSelectVideo("v03")}
                        className="bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-400"
                      >
                        Next Video: Earth's Cosmic Address <ChevronRight className="ml-1 size-4" />
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        enterCityPlaza();
                      }}
                      className="bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400"
                    >
                      <Compass className="mr-1.5 size-4" />
                      Explore Forge City Spaceport
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
