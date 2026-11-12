import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, Home, ImageOff } from "lucide-react";
import { Button } from "../../ui/button";
import { LessonInteractive, LessonQuiz } from "../LearnLab";
import { BODIES } from "../../../lib/nasa-data";
import { analyze, MISSIONS, type MissionId } from "../../../lib/mission-sim";
import { designOf, useMissionStore, type CityActivity } from "../../../stores/mission-store";

const IMAGES: Record<CityActivity, string> = {
  classroom: "/assets/city%20learning/academy/ROCKET_IMAGE.jpg",
  training: "/assets/city%20learning/training/TRAINING_IMAGE.jpg",
  research: "/assets/city%20learning/research/SOLAR_SYSTEM_IMAGE.jpg",
};
const COMPONENTS = ["payload", "engine", "tanks", "stages"] as const;
const STAGING = ["ignite", "cutoff", "separate", "upper"] as const;
const STAGING_CHOICES = ["separate", "upper", "ignite", "cutoff"] as const;
const CHECKS = ["mass", "fuel", "power", "comms", "weather"] as const;
const DESTINATIONS = Object.keys(MISSIONS) as MissionId[];

function ActivityImage({ activity }: { activity: CityActivity }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  return (
    <figure className="mf-city-learning-image">
      {failed ? (
        <div
          role="img"
          aria-label={t(`cityLearning.${activity}.alt`)}
          className="mf-city-image-fallback"
        >
          <ImageOff aria-hidden="true" />
          <p>{t("cityLearning.imageFallback")}</p>
        </div>
      ) : (
        <img
          src={IMAGES[activity]}
          alt={t(`cityLearning.${activity}.alt`)}
          onError={() => setFailed(true)}
        />
      )}
      <figcaption>{t("cityLearning.illustration")}</figcaption>
    </figure>
  );
}

function Completion({ activity, ready }: { activity: CityActivity; ready: boolean }) {
  const { t } = useTranslation();
  const done = useMissionStore((s) => s.completedCityActivities.includes(activity));
  const complete = useMissionStore((s) => s.completeCityActivity);
  return (
    <section className="mf-city-completion">
      {done ? (
        <p role="status">
          <CheckCircle2 aria-hidden="true" />
          {t("cityLearning.saved")}
        </p>
      ) : (
        <>
          <p>{t("cityLearning.requirements")}</p>
          <Button disabled={!ready} onClick={() => complete(activity)}>
            {t("cityLearning.complete")}
          </Button>
        </>
      )}
    </section>
  );
}

function Academy() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<(typeof COMPONENTS)[number] | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [stage, setStage] = useState(0);
  const [stageFeedback, setStageFeedback] = useState("");
  const [quizPassed, setQuizPassed] = useState(false);
  const openAcademy = useMissionStore((s) => s.openAcademy);
  const openLesson = useMissionStore((s) => s.set);
  return (
    <>
      <section className="mb-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Interactive Video Classroom · Ages 8–14
            </span>
            <h3 className="text-sm font-bold text-slate-100">
              🎬 Cadet Video Academy (3 Core Lessons & Badges)
            </h3>
            <p className="text-xs text-slate-300">
              Watch "Why Do We Explore Space?", "Where Space Begins", and "Earth's Address in the Universe" with interactive quizzes!
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => openAcademy()}
            className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300 text-xs shadow-md shadow-amber-400/20"
          >
            Open Video Cinema
          </Button>
        </div>
      </section>
      <section>
        <h2>{t("cityLearning.academy.components")}</h2>
        <p>{t("cityLearning.academy.componentsHint")}</p>
        <div className="mf-city-options">
          {COMPONENTS.map((id) => (
            <Button
              key={id}
              variant={selected === id ? "default" : "secondary"}
              aria-pressed={selected === id}
              onClick={() => {
                setSelected(id);
                setVisited((v) => (v.includes(id) ? v : [...v, id]));
              }}
            >
              {t(`cityLearning.academy.${id}`)}
              {visited.includes(id) && <CheckCircle2 aria-hidden="true" />}
            </Button>
          ))}
        </div>
        <p className="mf-city-feedback" role="status">
          {selected
            ? t(`cityLearning.academy.${selected}Text`)
            : t("cityLearning.academy.progress", {
                count: visited.length,
                total: COMPONENTS.length,
              })}
        </p>
        <p>
          {t("cityLearning.academy.progress", { count: visited.length, total: COMPONENTS.length })}
        </p>
      </section>
      <section>
        <h2>{t("cityLearning.academy.staging")}</h2>
        <p>{t("cityLearning.academy.stagingHint")}</p>
        <div className="mf-city-options">
          {STAGING_CHOICES.map((id) => (
            <Button
              key={id}
              variant="secondary"
              disabled={STAGING.indexOf(id) < stage}
              onClick={() => {
                if (STAGING[stage] !== id) {
                  setStageFeedback("stageWrong");
                  return;
                }
                setStage(stage + 1);
                setStageFeedback(stage + 1 === STAGING.length ? "stageDone" : "stageRight");
              }}
            >
              {t(`cityLearning.academy.${id}`)}
            </Button>
          ))}
        </div>
        <p>{t("cityLearning.academy.stagingProgress", { count: stage, total: STAGING.length })}</p>
        <p role="status" className="mf-city-feedback">
          {stageFeedback && t(`cityLearning.academy.${stageFeedback}`)}
        </p>
      </section>
      <section>
        <h2>{t("cityLearning.academy.equation")}</h2>
        <LessonInteractive id="rocket" />
        <Button variant="secondary" onClick={() => openLesson({ learn: "rocket" })}>
          {t("cityLearning.academy.lesson")}
        </Button>
      </section>
      <section>
        <h2>{t("cityLearning.academy.quiz")}</h2>
        <LessonQuiz id="rocket" onCorrect={() => setQuizPassed(true)} />
        {quizPassed && <p role="status">{t("cityLearning.academy.quizPassed")}</p>}
      </section>
      <Completion
        activity="classroom"
        ready={visited.length === COMPONENTS.length && stage === STAGING.length && quizPassed}
      />
    </>
  );
}

function Training() {
  const { t } = useTranslation();
  const s = useMissionStore();
  const a = analyze(designOf(s));
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [decision, setDecision] = useState<"assume" | "hold" | null>(null);
  const [checked, setChecked] = useState(false);
  const good = {
    mass: a.wet <= a.launch.limitKg,
    fuel: a.dvMargin >= 0.1,
    power: a.powerMargin >= 0.15,
    comms: s.antennas >= 2,
    weather: false,
  };
  const values = {
    mass: t("cityLearning.readiness.massValue", {
      mass: Math.round(a.wet).toLocaleString(),
      limit: a.launch.limitKg.toLocaleString(),
    }),
    fuel: t("cityLearning.readiness.fuelValue", {
      available: a.dv.toFixed(2),
      required: a.required.toFixed(2),
      margin: Math.round(a.dvMargin * 100),
    }),
    power: t("cityLearning.readiness.powerValue", {
      generation: a.generation,
      draw: a.draw,
      margin: Math.round(a.powerMargin * 100),
    }),
    comms: t("cityLearning.readiness.commsValue", { count: s.antennas }),
    weather: t("cityLearning.readiness.weatherValue"),
  };
  return (
    <>
      <p className="mf-city-data-note">{t("cityLearning.readiness.model")}</p>
      <h2>
        {t("cityLearning.readiness.mission", { mission: t(`exp.destinations.${s.mission}.name`) })}
      </h2>
      <div className="mf-city-checklist">
        {CHECKS.map((id) => (
          <section key={id}>
            <h3>{t(`cityLearning.readiness.${id}`)}</h3>
            <p>{values[id]}</p>
            <span className={good[id] ? "mf-ok" : "mf-bad"}>
              {t(`cityLearning.readiness.${good[id] ? "good" : "attention"}`)}
            </span>
            <Button
              variant="secondary"
              aria-pressed={reviewed.includes(id)}
              onClick={() => setReviewed((v) => (v.includes(id) ? v : [...v, id]))}
            >
              {t(`cityLearning.readiness.${reviewed.includes(id) ? "reviewed" : "review"}`)}:{" "}
              {t(`cityLearning.readiness.${id}`)}
            </Button>
            {reviewed.includes(id) && (
              <p role="status" className="mf-city-feedback">
                {t(`cityLearning.readiness.${id}Text`)}
              </p>
            )}
          </section>
        ))}
      </div>
      <p>
        {t("cityLearning.readiness.reviewedCount", {
          count: reviewed.length,
          total: CHECKS.length,
        })}
      </p>
      <section>
        <h2>{t("cityLearning.readiness.question")}</h2>
        <div className="mf-city-options">
          {(["assume", "hold"] as const).map((id) => (
            <Button
              variant="secondary"
              key={id}
              aria-pressed={decision === id}
              onClick={() => {
                setDecision(id);
                setChecked(false);
              }}
            >
              {t(`cityLearning.readiness.${id}`)}
            </Button>
          ))}
        </div>
        <Button disabled={!decision} onClick={() => setChecked(true)}>
          {t("cityLearning.readiness.check")}
        </Button>
        {checked && (
          <p role="status" className="mf-city-feedback">
            {t(`cityLearning.readiness.${decision === "hold" ? "correct" : "wrong"}`)}
          </p>
        )}
      </section>
      <Completion
        activity="training"
        ready={reviewed.length === CHECKS.length && checked && decision === "hold"}
      />
    </>
  );
}

function Research() {
  const { t } = useTranslation();
  const [destination, setDestination] = useState<MissionId>("Moon");
  const [recorded, setRecorded] = useState<MissionId[]>([]);
  const [answer, setAnswer] = useState<"solid" | "gasAnswer" | null>(null);
  const [checked, setChecked] = useState(false);
  const b = BODIES[destination],
    m = MISSIONS[destination];
  const solarAu = destination === "Moon" ? BODIES.Earth.au : b.au;
  const sunlight = 100 / solarAu ** 2;
  const facts = [
    ["diameter", b.diameterKm],
    ["gravity", b.gravity],
    [destination === "Moon" ? "moonDistance" : "distance", b.au],
    [destination === "Moon" ? "moonPeriod" : "period", b.periodDays],
  ] as const;
  return (
    <>
      <div className="mf-city-options" role="group" aria-label={t("ui.game.destination")}>
        {DESTINATIONS.map((id) => (
          <Button
            variant={destination === id ? "default" : "secondary"}
            key={id}
            aria-pressed={destination === id}
            onClick={() => setDestination(id)}
          >
            {t(`exp.destinations.${id}.name`)}
          </Button>
        ))}
      </div>
      <section>
        <h2>{t(`exp.destinations.${destination}.name`)}</h2>
        <p className="mf-city-data-note">{t("cityLearning.explorer.reference")}</p>
        <dl className="mf-city-facts">
          {facts.map(([key, value]) => (
            <div key={key}>
              <dt>{t(`cityLearning.explorer.${key}`)}</dt>
              <dd>{value.toLocaleString(undefined, { maximumFractionDigits: 5 })}</dd>
            </div>
          ))}
        </dl>
        {b.atmosphere === "gas" && <p>{t("cityLearning.explorer.gas")}</p>}
        <a
          href={
            destination === "Ceres"
              ? "https://science.nasa.gov/dwarf-planets/ceres/"
              : "https://nssdc.gsfc.nasa.gov/planetary/factsheet/"
          }
          target="_blank"
          rel="noreferrer"
        >
          {t(`cityLearning.explorer.${destination === "Ceres" ? "ceresSource" : "source"}`)}
        </a>
        <p className="mf-city-data-note">{t("cityLearning.explorer.calculated")}</p>
        <p>
          {t("cityLearning.explorer.sunlight")}: <strong>{sunlight.toFixed(2)}%</strong>
        </p>
        <p className="mf-city-data-note">{t("cityLearning.explorer.simulated")}</p>
        <dl className="mf-city-facts">
          <div>
            <dt>{t("cityLearning.explorer.dv")}</dt>
            <dd>{m.dv}</dd>
          </div>
          <div>
            <dt>{t("cityLearning.explorer.days")}</dt>
            <dd>{m.days}</dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          onClick={() => setRecorded((v) => (v.includes(destination) ? v : [...v, destination]))}
        >
          {t(`cityLearning.explorer.${recorded.includes(destination) ? "recorded" : "mark"}`)}
        </Button>
      </section>
      <p>
        {t("cityLearning.explorer.progress", {
          count: recorded.length,
          total: DESTINATIONS.length,
        })}
      </p>
      <section>
        <h2>{t("cityLearning.explorer.question")}</h2>
        <div className="mf-city-options">
          {(["solid", "gasAnswer"] as const).map((id) => (
            <Button
              variant="secondary"
              key={id}
              aria-pressed={answer === id}
              onClick={() => {
                setAnswer(id);
                setChecked(false);
              }}
            >
              {t(`cityLearning.explorer.${id}`)}
            </Button>
          ))}
        </div>
        <Button disabled={!answer} onClick={() => setChecked(true)}>
          {t("cityLearning.explorer.check")}
        </Button>
        {checked && (
          <p role="status" className="mf-city-feedback">
            {t(`cityLearning.explorer.${answer === "gasAnswer" ? "correct" : "wrong"}`)}
          </p>
        )}
      </section>
      <Completion
        activity="research"
        ready={recorded.length === DESTINATIONS.length && checked && answer === "gasAnswer"}
      />
    </>
  );
}

export function CityLearningActivity({ activity }: { activity: CityActivity }) {
  const { t, i18n } = useTranslation();
  const goHome = useMissionStore((s) => s.goHome);
  const enterCityPlaza = useMissionStore((s) => s.enterCityPlaza);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <main className="mf-city-learning" dir={i18n.dir()} aria-labelledby="city-learning-title">
      <header>
        <div>
          <p className="gm-kicker">{t("cityLearning.hub")}</p>
          <h1 id="city-learning-title" tabIndex={-1} ref={heading}>
            {t(`cityLearning.${activity}.title`)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => goHome()} aria-label={t("ui.nav.backHome")} className="text-cyan-300 hover:text-white">
            <Home className="mr-1.5 size-4" /> {t("ui.nav.backHome")}
          </Button>
          <Button variant="secondary" onClick={() => enterCityPlaza()}>
            <ArrowLeft aria-hidden="true" />
            {t("cityLearning.return")}
          </Button>
        </div>
      </header>
      <div className="mf-city-learning-grid">
        <aside>
          <ActivityImage activity={activity} />
          <p>{t(`cityLearning.${activity}.intro`)}</p>
        </aside>
        <div className="mf-city-learning-content">
          {activity === "classroom" ? (
            <Academy />
          ) : activity === "training" ? (
            <Training />
          ) : (
            <Research />
          )}
        </div>
      </div>
    </main>
  );
}
