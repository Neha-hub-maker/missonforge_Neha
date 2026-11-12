import { LaunchVehiclePreviewPanel, useLaunchPreviewMode } from "./LaunchVehiclePreview";
import { LaunchVehicleSelector, LaunchCapabilitySummary } from "./LaunchVehicleSelector";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, Home, Menu, Play, Rocket, Settings2, Sparkles, UserRound, X } from "lucide-react";
import { Button } from "../ui/button";
import { BODIES, SOURCES } from "../../lib/nasa-data";
import { analyze, ENGINES, fmt, INSTRUMENTS, MISSIONS, ROUTES, type EngineId, type Instrument, type MissionId, type RouteId } from "../../lib/mission-sim";
import { designOf, useMissionStore, type Phase } from "../../stores/mission-store";
import { LivePositions } from "./LivePositions";
import { LANGS } from "../../locales/resources";
import { AyeshaAvatar } from "./Ayesha";
import { useVoice, VoiceBar } from "./voice";
import { SceneControls } from "./Presentation";
import { getMissionModel } from "./Spacecraft";

const ids: MissionId[] = ["Moon", "Mars", "Ceres", "Jupiter", "Saturn"];
const steps: Phase[] = ["missions", "vehicle", "brief", "route", "routePreview", "objectives", "budget", "fuel", "power", "comms", "instruments", "overview", "craft", "build", "check"];
const nameKey: Partial<Record<Phase, string>> = { missions: "planet", vehicle: "vehicle", brief: "mission", route: "routePick", routePreview: "routePreview", objectives: "objectives", budget: "budget", fuel: "fuel", power: "power", comms: "comms", instruments: "instruments", overview: "overview", craft: "craft", build: "build", check: "score" };

function Frame({ phase, children }: { phase: Phase; children: ReactNode }) {
  const s = useMissionStore(); const { t } = useTranslation(); const [menu, setMenu] = useState(false); const [mentor, setMentor] = useState(false);
  const current = steps.indexOf(phase);
  return <div className="gm-screen gm-flow">
    <header className="gm-header">
      <Button variant="ghost" className="gm-mark" onClick={() => s.goHome()} aria-label={t("ui.nav.backHome")}>◈ <strong>MISSION <span>FORGE</span></strong></Button>
      {current >= 0 && <div className="gm-flow-progress"><span>{String(current + 1).padStart(2, "0")} / {steps.length}</span><div><i style={{ width: `${(current + 1) / steps.length * 100}%` }} /></div><b>{phase === "vehicle" ? t("launchVehicle.title") : t(`ui.flow.${nameKey[phase]}`)}</b></div>}
      <div className="gm-header-tools">
        {phase !== "menu" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => s.goHome()}
            aria-label={t("ui.nav.backHome")}
            title={t("ui.nav.backHome")}
            className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-slate-900/70 text-xs font-bold text-cyan-300 hover:text-white"
          >
            <Home size={15} /> <span className="sm:hidden">{t("ui.game.home")}</span><span className="hidden sm:inline">{t("ui.nav.backHome")}</span>
          </Button>
        )}
        <span className="gm-signal">{t("exp.simulation")}</span>
        <Button variant="ghost" size="icon" onClick={() => setMentor(true)} aria-label={t("ui.ayesha.name")} title={t("ui.ayesha.name")}><UserRound size={19} /></Button>
        <Button variant="ghost" size="icon" onClick={() => setMenu(!menu)} aria-label={t("ui.game.options")}><Menu size={19} /></Button>
      </div>
    </header>
    {children}
    {menu && <div className="gm-backdrop" onClick={() => setMenu(false)}><section className="gm-dialog" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="gm-close" aria-label={t("ui.learn.close")} onClick={() => setMenu(false)}><X /></Button><h2>{t("ui.game.options")}</h2><Button variant="secondary" onClick={() => { s.goHome(); setMenu(false); }}><Home size={16} /> {t("ui.nav.backHome")}</Button><Button variant="secondary" onClick={() => { s.enterCityPlaza(); setMenu(false); }}><Compass /> {t("ui.nav.flightPlan")} · {t("ui.nav.cityPlaza")}</Button><label>{t("ui.voice.language")}<select value={s.lang} onChange={e => s.set({ lang: e.target.value as typeof s.lang })}>{LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label><Button variant="secondary" onClick={() => s.set({ quality: s.quality === "high" ? "low" : "high" })}><Settings2 /> {t("ui.game.graphics")}: {s.quality}</Button><Button variant="secondary" onClick={() => { s.openAcademy(); setMenu(false); }}><Sparkles /> {t("ui.nav.learn")} · {t("ui.nav.videoAcademy")}</Button><Button variant="secondary" onClick={() => { s.set({ learn: "index" }); setMenu(false); }}><BookOpen /> {t("ui.learn.title")}</Button><p>NASA NSSDCA · NASA/JPL Horizons · NASA Image and Video Library</p></section></div>}
    {mentor && <Mentor onClose={() => setMentor(false)} />}
  </div>;
}

function Mentor({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation(); const voice = useVoice(); const text = t("ayeshaTips.build");
  return <div className="gm-backdrop" onClick={() => { voice.stop(); onClose(); }}><section className="gm-dialog" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="gm-close" aria-label={t("ui.learn.close")} onClick={() => { voice.stop(); onClose(); }}><X /></Button><div className="gm-mentor-head"><AyeshaAvatar /><div><h2>{t("ui.ayesha.name")}</h2><p>{t("ui.ayesha.role")}</p></div></div><p className="gm-mentor-tip">{text}</p><VoiceBar text={text} voice={voice} /><Button onClick={() => { voice.stop(); onClose(); }}>{t("ui.ayesha.dismiss")}</Button></section></div>;
}

function Actions({ back, next, label, onNext }: { back: Phase; next: Phase; label?: string | undefined; onNext?: (() => void) | undefined }) {
  const s = useMissionStore(); const { t } = useTranslation();
  return <footer className="gm-flow-actions"><Button variant="ghost" onClick={() => s.go(back)}><ArrowLeft /> {t("ui.flow.back")}</Button><Button onClick={() => { onNext?.(); s.go(next); }}>{label ?? t("ui.flow.next")} <ArrowRight /></Button></footer>;
}
function Layout({ phase, title, eyebrow, info, children, back, next, nextLabel, onNext, media }: { phase: Phase; title: string; eyebrow?: string; info?: ReactNode; children: ReactNode; back: Phase; next: Phase; nextLabel?: string; onNext?: () => void; media?: ReactNode }) {
  const { t } = useTranslation();
  return <Frame phase={phase}><main className="gm-flow-main"><aside className="gm-flow-panel"><div className="gm-flow-scroll"><p className="gm-kicker">{eyebrow ?? t("exp.flightPlan")}</p><h1>{title}</h1>{info && <div className="gm-flow-info">{info}</div>}<div className="gm-flow-choices">{children}</div></div><Actions back={back} next={next} label={nextLabel} onNext={onNext} /></aside><div className="gm-flow-stage">{media}</div></main></Frame>;
}
function Start() {
  const s = useMissionStore(); const { t } = useTranslation();
  return <Frame phase="menu"><main className="gm-home"><div className="gm-home-copy">
    <p className="gm-kicker">{t("exp.eyebrow")}</p><h1>{t("exp.title").split("\n").map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</h1>
    <p className="mf-home-intro">{t("exp.intro")}</p>
    <div className="gm-actions">
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          size="lg"
          onClick={() => {
            if (!s.hasSeenIntroVideo) {
              s.openCadetIntro();
            } else {
              s.enterCityPlaza();
            }
          }}
          className="bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-400"
        >
          <Rocket /> {t("ui.nav.cityPlaza")} <ArrowRight />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => s.quickLaunch()} title={t("ui.home.quickHint")}>
          <Play /> {t("ui.home.quick")} <ArrowRight />
        </Button>
      </div>
      <div>
        <Button
          variant="secondary"
          onClick={() => s.openAcademy()}
          className="border-amber-400/40 bg-slate-900/80 hover:bg-amber-950/40 text-amber-300 hover:text-amber-200"
        >
          <Sparkles className="size-4" /> {t("ui.nav.learn")} · {t("ui.nav.videoAcademy")}
        </Button>
      </div>
    </div>
    {s.attempts > 0 && <Button className="mf-resume" variant="ghost" onClick={() => s.go("build")}>{t("ui.home.continue")}<ArrowRight /></Button>}
  </div><aside className="mf-home-proof" aria-label={t("ui.home.proofTitle")}><span>{t("ui.home.proofTitle")}</span><ul><li><i className="is-live" />{t("ui.home.proof1")}</li><li><i className="is-live" />{t("ui.home.proof2")}</li><li><i />{t("ui.home.proof3")}</li></ul></aside>
  <footer className="mf-home-footer"><span>{t("exp.earthCredit")}</span><span>{t("exp.independent")}</span></footer></main></Frame>;
}
function DestinationCaption({ mission }: { mission: MissionId }) {
  const { t } = useTranslation(); const body = BODIES[mission];
  return <div className="mf-destination-caption"><p className="gm-kicker">{t("exp.destination")}</p><h2>{t(`exp.destinations.${mission}.name`)}</h2><p>{t(`exp.destinations.${mission}.detail`)}</p><div className="gm-facts"><span>{t("ui.game.gravity")}<b>{body.gravity} m/s²</b></span><span>{t("ui.game.distance")}<b>{body.au} AU</b></span></div><small>{t(mission === "Ceres" ? "exp.proceduralCredit" : "exp.modelCredit")}</small></div>;
}
function Planet() {
  const s = useMissionStore(); const { t } = useTranslation();
  return <Layout phase="missions" title={t("ui.flow.planet")} info={t("ui.game.chooseHint")} back="city" next="vehicle" nextLabel={t("launchVehicle.choose")} media={<DestinationCaption mission={s.mission} />}>
    <div className="gm-world-list">{ids.map((id, i) => <Button key={id} variant="ghost" aria-pressed={s.mission === id} className={`gm-choice ${s.mission === id ? "on" : ""}`} onClick={() => s.set({ mission: id })}><span className="mf-world-index">{String(i + 1).padStart(2, "0")}</span><span>{t(`exp.destinations.${id}.name`)}{id === "Mars" && <em className="mf-recommended">{t("exp.recommended")}</em>}<small>{t(`exp.destinations.${id}.note`)}</small></span>{s.mission === id && <Check />}</Button>)}</div>
  </Layout>;
}
function Vehicle() {
  const { t } = useTranslation();
  return <Layout phase="vehicle" title={t("launchVehicle.title")} back="missions" next="brief" media={<LaunchVehiclePreviewPanel />}><LaunchVehicleSelector /></Layout>;
}
function Objective() {
  const s = useMissionStore(); const { t } = useTranslation(); const b = BODIES[s.mission];
  return <Layout phase="brief" title={t("ui.flow.mission")} back="vehicle" next="route" nextLabel={t("ui.flow.routePick")} media={<DestinationCaption mission={s.mission} />}>
    <div className="gm-objective-list">{(["surface", "orbit", "survey"] as const).map(id => <Button key={id} variant="ghost" aria-pressed={s.objective === id} className={`gm-choice ${s.objective === id ? "on" : ""}`} onClick={() => s.set({ objective: id })}><span>{t(`ui.flow.${id}`)}<small>{t(id === "surface" && b.atmosphere === "gas" ? "exp.gasHint" : `exp.${id}Hint`)}</small></span>{s.objective === id && <Check />}</Button>)}</div><p className="gm-source">{SOURCES.factsheet}</p>
  </Layout>;
}
function RoutePick() {
  const s = useMissionStore(); const { t } = useTranslation();
  return <Layout phase="route" title={t("ui.flow.routePick")} back="brief" next="routePreview" nextLabel={t("ui.flow.review")} info={t(`exp.destinations.${s.mission}.note`)} media={<div className="gm-scene-caption"><Compass size={26} /><span>{t("ui.game.dragMap")}</span><small>{t("exp.mapNote")}</small></div>}>
    {(Object.keys(ROUTES) as RouteId[]).map(id => <Button key={id} variant="ghost" aria-pressed={s.route === id} className={`gm-choice ${s.route === id ? "on" : ""}`} onClick={() => s.set({ route: id })}><span>{t(`exp.route_${id}`)}<small>{t(`exp.routeNote_${id}`)}</small><small>{Math.round(MISSIONS[s.mission].days * ROUTES[id].time)} d · {(MISSIONS[s.mission].dv * ROUTES[id].dv).toFixed(2)} km/s</small></span>{s.route === id && <Check />}</Button>)}
    <p className="gm-source">{t("ui.home.routeNote")}</p>
  </Layout>;
}
function RoutePreview() {
  const s = useMissionStore(); const { t } = useTranslation(); const a = analyze(designOf(s));
  return <Layout phase="routePreview" title={t("ui.flow.routePreview")} back="route" next="objectives" nextLabel={t("ui.flow.confirmRoute")} info={`${s.mission} · ${t(`exp.route_${s.route}`)}`} media={<div className="gm-scene-caption"><Compass size={26} /><span>{t("ui.game.dragMap")}</span><small>{t("exp.mapNote")}</small></div>}>
    <div className="gm-stat"><span>{t("ui.game.transit")}</span><b>{a.days} d</b></div><div className="gm-stat"><span>{t("ui.game.required")} Δv</span><b>{a.required.toFixed(2)} km/s</b></div><div className="gm-stat"><span>{t("ui.game.distance")}</span><b>{BODIES[s.mission].au} AU</b></div><LivePositions body={MISSIONS[s.mission].body} />
  </Layout>;
}
function ChoiceStep({ phase }: { phase: "objectives" | "budget" | "fuel" | "power" | "comms" | "instruments" }) {
  const s = useMissionStore(); const { t } = useTranslation(); const a = analyze(designOf(s));
  const chain: Phase[] = ["routePreview", "objectives", "budget", "fuel", "power", "comms", "instruments", "overview"];
  const pos = chain.indexOf(phase); const learn = () => s.set({ learn: phase === "power" || phase === "comms" ? "light" : phase === "objectives" ? "orbit" : "rocket" });
  const step = (label: string, value: number, min: number, max: number, change: (v: number) => void) => <div className="gm-step"><span>{label}</span><Button variant="secondary" size="icon" disabled={value <= min} aria-label={t("exp.remove", { label })} onClick={() => change(value - 1)}>−</Button><b>{value}</b><Button variant="secondary" size="icon" disabled={value >= max} aria-label={t("exp.add", { label })} onClick={() => change(value + 1)}>+</Button></div>;
  return <Layout phase={phase} title={t(`ui.flow.${phase}`)} back={chain[pos - 1] ?? "routePreview"} next={chain[pos + 1] ?? "overview"} media={<div className="gm-resource-display"><p>{s.mission} / {t(`exp.route_${s.route}`)}</p><strong>{phase === "fuel" ? `${a.dv.toFixed(2)} km/s` : phase === "power" ? `${a.generation} kW` : phase === "comms" ? `${s.antennas} ×` : phase === "instruments" ? `${a.science}` : phase === "budget" ? `${fmt(a.wet)} kg` : `${a.days} d`}</strong><small>{t("ui.flow.gameEstimate")} · {t("exp.resourceNote")}</small></div>}>
    {phase === "objectives" && <>{step(t("ui.game.engineCount"), s.engines, 1, 3, v => s.set({ engines: v }))}<p className="gm-note">{t("ui.game.engine")} · {ENGINES[s.engine].name}</p></>}
    {phase === "budget" && <div className="gm-budget-list">{([1, 2, 3] as const).map(v => <Button variant="ghost" key={v} className={`gm-choice ${s.budget === v ? "on" : ""}`} onClick={() => s.set({ budget: v })}><span>{t(`ui.flow.${(["limited", "balanced", "expanded"] as const)[v - 1]}`)}<small>{t(`exp.budget_${v}`)}</small></span>{s.budget === v && <Check />}</Button>)}<p className="gm-note">{t("exp.budgetNote")}</p></div>}
    {phase === "fuel" && <>{step(t("ui.game.tanks"), s.tanks, 1, 4, v => s.set({ tanks: v }))}<label className="gm-range">{t("ui.game.fuelLoad")} <b>{s.fuel}%</b><input type="range" min="20" max="100" value={s.fuel} onChange={e => s.set({ fuel: +e.target.value })} /></label></>}
    {phase === "power" && <>{step(t("ui.game.solar"), s.wings, 0, 6, v => s.set({ wings: v }))}{step(t("ui.game.rtg"), s.rtgs, 0, 4, v => s.set({ rtgs: v }))}<Button variant={s.battery ? "default" : "secondary"} onClick={() => s.set({ battery: !s.battery })}>{t("ui.game.battery")} {s.battery && <Check />}</Button></>}
    {phase === "comms" && <>{step(t("ui.game.antennas"), s.antennas, 1, 2, v => s.set({ antennas: v }))}<Button variant={s.shield ? "default" : "secondary"} onClick={() => s.set({ shield: !s.shield })}>{t("ui.game.shield")} {s.shield && <Check />}</Button></>}
    {phase === "instruments" && (Object.keys(INSTRUMENTS) as Instrument[]).map(id => <Button key={id} variant="ghost" className={`gm-choice ${s.instruments.includes(id) ? "on" : ""}`} onClick={() => s.toggleInstrument(id)}><span>{INSTRUMENTS[id].name}<small>{INSTRUMENTS[id].mass} kg · {INSTRUMENTS[id].kw} kW</small></span>{s.instruments.includes(id) && <Check />}</Button>)}
    <Button variant="ghost" className="gm-learn-button" onClick={learn}><BookOpen /> {t("ui.flow.learn")}</Button><p className="gm-source">{SOURCES.orion} · {SOURCES.factsheet}</p>
  </Layout>;
}
function Overview() {
  const s = useMissionStore(); const { t } = useTranslation(); const a = analyze(designOf(s));
  return <Layout phase="overview" title={t("ui.flow.overview")} back="instruments" next="craft" nextLabel={t("ui.flow.craft")} media={<DestinationCaption mission={s.mission} />}>
    <LaunchCapabilitySummary /><div className="gm-stat"><span>{t("ui.flow.mission")}</span><b>{t(`ui.flow.${s.objective}`)}</b></div><div className="gm-stat"><span>{t("ui.game.route")}</span><b>{t(`exp.route_${s.route}`)}</b></div><div className="gm-stat"><span>{t("ui.game.transit")}</span><b>{a.days} d</b></div><div className="gm-stat"><span>{t("ui.game.mass")}</span><b>{fmt(a.wet)} kg</b></div><div className="gm-stat"><span>{t("ui.game.power")}</span><b>{a.generation} / {a.draw} kW</b></div><div className="gm-stat"><span>{t("ui.game.installed")}</span><b>{s.instruments.length}</b></div>
  </Layout>;
}
const presets = {
  explorer: { engine: "chemical", engines: 1, tanks: 4, wings: 4, rtgs: 0, antennas: 1, shield: true, battery: false, instruments: ["camera"] },
  surveyor: { engine: "ion", engines: 1, tanks: 2, wings: 6, rtgs: 1, antennas: 2, shield: false, battery: true, instruments: ["camera", "spectrometer"] },
  guardian: { engine: "chemical", engines: 2, tanks: 4, wings: 4, rtgs: 2, antennas: 2, shield: true, battery: true, instruments: ["camera", "radiation"] },
} as const;
function Craft() {
  const s = useMissionStore(); const { t } = useTranslation(); const [preset, setPreset] = useState<string | null>(null);
  const info = getMissionModel(s.mission);
  return <Layout phase="craft" title={t("ui.flow.craft")} back="overview" next="build" nextLabel={preset ? t("ui.flow.design") : t("exp.keepDesign")} onNext={() => { if (preset) { const id = preset as keyof typeof presets; s.set({ craft: id, ...presets[id], instruments: [...presets[id].instruments] }); } }} media={<div className="gm-scene-caption"><Rocket size={27} /><span>{info.name}</span><small>{info.agency} · {info.historicalMission}</small></div>}>
    <p className="gm-note">Authentic NASA Model: {info.name} ({info.agency}) · {info.notes}</p>{(["explorer", "surveyor", "guardian"] as const).map(id => <Button key={id} variant="ghost" aria-pressed={preset === id} className={`gm-choice ${preset === id ? "on" : ""}`} onClick={() => setPreset(id)}><span>{t(`ui.flow.${id}`)}<small>{ENGINES[presets[id].engine].name} · {presets[id].wings} × {t("ui.game.solar")}</small></span>{preset === id && <Check />}</Button>)}<p className="gm-source">NASA 3D Resources · {info.name}</p>
  </Layout>;
}
type Category = "vehicle" | "engine" | "fuel" | "power" | "comms" | "science";
function Hangar() {
  const s = useMissionStore(); const { t } = useTranslation(); const a = analyze(designOf(s)); const [tab, setTab] = useState<Category>("engine"); const categories: Category[] = ["vehicle", "engine", "fuel", "power", "comms", "science"];
  const { setHangar } = useLaunchPreviewMode();
  useEffect(() => { setHangar(tab === "vehicle"); return () => setHangar(false); }, [tab, setHangar]);
  const craftInfo = getMissionModel(s.mission);
  const step = (label: string, value: number, min: number, max: number, change: (v: number) => void) => <div className="gm-step"><span>{label}</span><Button variant="secondary" size="icon" disabled={value <= min} aria-label={t("exp.remove", { label })} onClick={() => change(value - 1)}>−</Button><b>{value}</b><Button variant="secondary" size="icon" disabled={value >= max} aria-label={t("exp.add", { label })} onClick={() => change(value + 1)}>+</Button></div>;
  return <Frame phase="build"><main className="gm-hangar"><div className="gm-hangar-head"><p className="gm-kicker">{t("ui.flow.build")}</p><h1>{t("ui.game.assemble")}</h1><span>{s.mission} · {ENGINES[s.engine].name}</span></div><aside className="gm-hangar-categories">{categories.map(id => <Button key={id} variant="ghost" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{id === "vehicle" ? t("launchVehicle.title") : t(`ui.game.${id}`)} <ArrowRight /></Button>)}</aside><div className="gm-craft-view">{tab === "vehicle" ? <LaunchVehiclePreviewPanel /> : <><span className="gm-craft-tag">🛰️ {craftInfo.name} · {craftInfo.agency}</span><div className="mf-craft-tools"><span>{t("ui.game.dragCraft")}</span><SceneControls /></div></>}</div><aside className="gm-hangar-controls"><h2>{tab === "vehicle" ? t("launchVehicle.title") : t(`ui.game.${tab}`)}</h2><div className="gm-control-scroll">
    {tab === "vehicle" && <LaunchVehicleSelector />}
    {tab === "engine" && <>{(Object.keys(ENGINES) as EngineId[]).map(id => <Button key={id} variant="ghost" aria-pressed={s.engine === id} className={`gm-part ${s.engine === id ? "on" : ""}`} onClick={() => s.set({ engine: id })}><span><b>{ENGINES[id].name}</b><small>{ENGINES[id].isp} s Isp · {ENGINES[id].thrust}</small></span>{s.engine === id && <Check />}</Button>)}{step(t("ui.game.engineCount"), s.engines, 1, 3, v => s.set({ engines: v }))}</>}
    {tab === "fuel" && <>{step(t("ui.game.tanks"), s.tanks, 1, 4, v => s.set({ tanks: v }))}<label className="gm-range">{t("ui.game.fuelLoad")} <b>{s.fuel}%</b><input type="range" min="20" max="100" value={s.fuel} onChange={e => s.set({ fuel: +e.target.value })}/></label></>}
    {tab === "power" && <>{step(t("ui.game.solar"), s.wings, 0, 6, v => s.set({ wings: v }))}{step(t("ui.game.rtg"), s.rtgs, 0, 4, v => s.set({ rtgs: v }))}<Button variant={s.battery ? "default" : "secondary"} onClick={() => s.set({ battery: !s.battery })}>{t("ui.game.battery")} {s.battery && <Check />}</Button></>}
    {tab === "comms" && <>{step(t("ui.game.antennas"), s.antennas, 1, 2, v => s.set({ antennas: v }))}<Button variant={s.shield ? "default" : "secondary"} onClick={() => s.set({ shield: !s.shield })}>{t("ui.game.shield")} {s.shield && <Check />}</Button></>}
    {tab === "science" && (Object.keys(INSTRUMENTS) as Instrument[]).map(id => <Button key={id} variant="ghost" className={`gm-part ${s.instruments.includes(id) ? "on" : ""}`} onClick={() => s.toggleInstrument(id)}><span><b>{INSTRUMENTS[id].name}</b><small>{INSTRUMENTS[id].mass} kg · {INSTRUMENTS[id].kw} kW</small></span>{s.instruments.includes(id) && <Check />}</Button>)}<p className="gm-source">{SOURCES.orion} · {SOURCES.rl10} · {SOURCES.nstar}</p></div></aside>
    <footer className="gm-hangar-bottom"><Button variant="ghost" onClick={() => s.go("craft")}><ArrowLeft /> {t("ui.flow.back")}</Button><div className="gm-performance"><span>{t("ui.game.mass")}<b>{fmt(a.wet)} kg</b></span><span className={a.dvMargin < 0 ? "is-danger" : a.dvMargin < 0.1 ? "is-warning" : "is-go"}>Δv <b>{a.dv.toFixed(2)} / {a.required.toFixed(2)} km/s</b></span><span className={a.powerMargin < 0 ? "is-danger" : "is-go"}>{t("ui.game.power")}<b>{a.generation} / {a.draw} kW</b></span><span>{t("ui.game.readiness")}<b>{Math.max(1,a.readiness)} / 100</b></span></div><Button onClick={() => s.go("check")}>{t("ui.game.toCheck")} <ArrowRight /></Button></footer>
  </main></Frame>;
}
export function GameScreens({ phase }: { phase: Phase }) {
  switch (phase) {
    case "menu": return <Start />;
    case "missions": return <Planet />;
    case "vehicle": return <Vehicle />;
    case "brief": return <Objective />;
    case "route": return <RoutePick />;
    case "routePreview": return <RoutePreview />;
    case "objectives": case "budget": case "fuel": case "power": case "comms": case "instruments": return <ChoiceStep phase={phase} />;
    case "overview": return <Overview />;
    case "craft": return <Craft />;
    case "build": return <Hangar />;
    default: return null;
  }
}
