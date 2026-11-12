# Mission Forge — Project Handover & State Documentation

> **Purpose:** This document provides an exhaustive, production-grade technical summary of the Mission Forge project, all recent architectural and visual changes, completed features, and the agreed roadmap for Videos, Navigation, and UI. Any developer or AI assistant can resume directly from this file.

---

## 1. Project Overview & Architecture

- **Project Name:** Mission Forge (Playable 3D Space Mission Educational Game)
- **Tech Stack:**
  - **Framework:** React 18, Vite, TypeScript
  - **3D Engine:** Three.js, `@react-three/fiber`, `@react-three/drei`
  - **State Management:** Single-screen unified store (`zustand` in `src/stores/mission-store.ts`)
  - **Routing:** TanStack Router (`@tanstack/react-router`) with a single-screen canvas architecture where phases overlay on the active 3D canvas
  - **Localization:** `i18next` with 6 languages (en, bn, hi, es, ar, fr) in `src/locales/resources.ts`
  - **Styles:** Tailwind CSS + custom glassmorphic HUD in `src/styles.css`
  - **NASA Assets:** Locally cached in `public/textures/nasa-3d/` and `src/data/` (Blue Marble, LROC Moon, Cassini Saturn) to avoid runtime blocking.

---

## 2. Recent Accomplishments & Changes

### A. 3D Globe & Celestial Bodies (`src/components/game/Presentation.tsx`)
1. **Home Screen Earth Alignment:**
   - Shifted the rotating 3D Earth (`body === "Earth"` on menu) to `x = viewport.width * 0.13, y = 0.08`, with radius `2.10`.
   - Eliminated text collisions with `"Destination"`, `"Commander"`, and `"🎬 Learn · Video Academy"` action buttons.
   - Removed right-edge clipping while keeping Earth prominent and interactive.

2. **Moon 3D Reconstruction ("Choose a World"):**
   - **Issue:** Moon was distorted into an egg/oval shape with a dark projection caused by a flat 1:1 circular photo mapped onto a sphere.
   - **Fix:** Sourced NASA LROC 2K equirectangular map (`2048x1024`) saved to `public/textures/nasa-3d/moon.jpg` and `moon.webp`.
   - **Result:** 100% round, authentic 3D lunar sphere featuring Tycho, Oceanus Procellarum, and Sea of Tranquility without dark artifacts.

3. **Saturn & Rings Authentic Rendering ("Choose a World"):**
   - **Issue 1 (Black Rings):** The ring was using an uncolored alpha mask with dark grey RGB values (~14% albedo) and a standard PBR material. Because the ring is a flat plane tilted at ~26.7°, Three.js directional lighting computed a negative dot product, rendering the rings pitch-black outside the planet.
   - **Fix 1 (Cassini True-Color & Light Scattering):**
     - Sourced NASA Cassini natural-color ring profile (`public/textures/nasa-3d/saturn-rings.png`) with true albedo: creamy ivory B Ring (`#f8eed8`), sharp dark Cassini Division, warm beige A Ring (`#dfd2b8`), and translucent amber crepe C Ring.
     - Added custom polar UV mapping (`u = (r - inner) / (outer - inner)`) in `SaturnRings`.
     - Added `emissiveMap`, `emissive="#f7eed9"`, `emissiveIntensity=0.88`, and `depthWrite=false` to emulate forward/backward scattering of billions of water-ice crystals. Saturn's cloud bands show through the rings naturally.
   - **Issue 2 (Size & Screen Fitting):**
     - Scaled Saturn's globe (`radius: 0.98`) and rings (`inner: 1.16`, `outer: 2.22`).
     - **Overall Bounding Size:** Saturn along with its rings now occupies ~4.4 units in diameter, matching the exact visual footprint of **Moon** (`radius: 2.18`) and **Mars** (`radius: 2.18`).
     - Rings are kept completely static while Saturn's globe spins on its polar axis.
     - Positioned at `x = viewport.width * 0.16`, completely within the screen boundaries with zero right-side clipping.

---

### B. Video Academy & Cosmic Address
1. **Video V03 ("Our Address in the Universe"):**
   - Explains Earth's hierarchical cosmic address:
     $$\text{Earth} \to \text{Solar System} \to \text{Orion Arm (Spur)} \to \text{Milky Way Galaxy} \to \text{Local Group} \to \text{Virgo Supercluster} \to \text{Laniakea}$$
   - Includes interactive 3-question quiz with instant explanation feedback and badge award (`Cadet Cosmic Navigator`).
2. **Video Architecture:**
   - 3 Cadet Videos currently configured:
     - `v01`: Introduction to Mission Forge & Space Exploration
     - `v02`: Spacecraft Systems (Power, Propulsion, Thermal, Communications)
     - `v03`: Our Cosmic Address in the Universe
   - Accessible via:
     - Home page `🎬 Learn · Video Academy` button.
     - First-time Cadet Induction modal (`FirstTimeCadetIntro.tsx`).
     - Flow header Options menu (`🎬 Learn · Video Academy`).
     - In-city learning terminals in Central City Plaza (`CityLearningActivity.tsx`).

---

## 3. Active User Intent & Agreed Roadmap

The user outlined specific navigation and experience refinements to be completed step-by-step:

### 1. Navigation Flow & "Back to Home" Button
- [x] Home page serves as the initial landing stage when entering the app.
- [x] **Universal "Back to Home" Button:** Every screen, modal, and sub-phase provides a visible, labelled `Back to Home` button (short "Home" label on phones). All of them call the single store action `goHome()`, which also closes the Video Academy, Cadet Induction modal and Science Lab so nothing stays open over Home.
  - Setup flow (`missions` … `build`): `GameScreens.tsx` header + Options menu.
  - Operations (`check`, `launch`, `flight`, `encounter`, `failure`, `rescue`, `docking`, `landing`, `report`): `Hud.tsx` header.
  - `city`: `CityOverlay.tsx` header + fast-travel strip. `classroom`/`training`/`research`: `CityLearningActivity.tsx` header.
  - Modals: `CadetVideoAcademy.tsx`, `FirstTimeCadetIntro.tsx`, `LearnLab.tsx` (Science Lab).
- [x] **Flight Plan Menu Tab:** Home "Explore Forge City" and "Flight Plan" buttons, the Options menu "Flight Plan · Explore Forge City" item, the induction modal's "Enter City Directly" and the academy's "Explore Forge City Spaceport" all call `enterCityPlaza()`, which lands in Central City Plaza (player respawns at plaza centre, `activeCityZone` cleared, overlays closed). Missions start from the plaza's "Launch Operations" button (`newRun("missions")`).

### 2. Video Academy & Learn Tab Consolidation
- [x] First video (V01) integration on Home screen and Cadet induction flow.
- [x] **Learn Tab Video Suite:** Every Learn / Video Academy entry point (Home, Options menu, City Plaza header + strip, Academy classroom) calls `openAcademy()`, which opens the academy at the first lesson whose badge is not yet earned. All 3 videos are listed with:
  - [x] Video player modal; native browser caption (CC) menu.
  - [ ] **Caption files still needed:** `SpaceVideo.captions` (in `src/lib/video-catalog.ts`) renders `<track>` elements, but no `.vtt` transcripts exist yet. Add e.g. `public/videos/captions/v01.en.vtt` and `captions: [{ lang: "en", label: "English", src: "/videos/captions/v01.en.vtt" }]` per video. The track shows by default when the store's `captions` setting is on.
  - [x] Interactive quiz system attached to each video.
  - [x] Badge tracking persisted in `useMissionStore.quizScores`, with a badge shelf (`Badges n/3`) in the academy's video bar.
  - [x] Re-watch and re-take at any time. Retakes keep the best score and never remove an earned badge (`recordQuizResult`).

### 3. Choose a World Section
- [x] Moon 100% round with authentic NASA LROC equirectangular map.
- [x] Saturn rings true-color Cassini ivory/gold with translucent crepe ring and Cassini division.
- [x] Saturn + rings total size matched to Moon and Mars.
- [x] Rings kept static and fully inside the screen boundaries.
- [x] Checked Jupiter (`jupiter.jpg` 720×360), Mars (`mars.jpg` 1440×720): both 2:1 equirectangular, same `Surface` material and scene lighting as Moon/Saturn. Consistent.
- [ ] Ceres has no local texture and renders as an untextured colour globe (captioned "Illustrative globe · surface color only"). To match the others, add a NASA Dawn Ceres equirectangular map to `public/textures/nasa-3d/ceres.jpg` and register it in the `maps` object in `Presentation.tsx`.

---

## 4. Key Files & Structure

| File Path | Description |
| :--- | :--- |
| `src/components/game/Presentation.tsx` | Main Three.js Canvas: 3D Earth, Moon, Mars, Ceres, Jupiter, Saturn with rings, lighting, camera controls. |
| `src/components/game/Hud.tsx` | Operations HUD (check → report) with Back to Home header. |
| `src/components/game/GameScreens.tsx` | UI Phase Overlays: Home, Destination selection (`missions`), Launch Vehicle, Route, etc. |
| `src/components/game/ReferenceHud.tsx` | Alternate reference HUD layout (currently not mounted). |
| `src/components/game/city/CityOverlay.tsx` | Forge City Central Plaza 3D walkthrough & interactive district stations. |
| `src/components/game/city/CityLearningActivity.tsx`| In-city learning terminals, quizzes, and multimedia activities. |
| `src/components/game/video/FirstTimeCadetIntro.tsx`| Cadet induction video modal and academy launcher. |
| `src/components/game/video/CadetVideoAcademy.tsx`| Video Academy modal: 3 videos, quizzes, badge shelf. |
| `src/lib/video-catalog.ts` | Video metadata, quizzes, badges, optional caption tracks. |
| `src/stores/mission-store.ts` | Central Zustand store: active phase, active mission, video modal, quiz scores/badges, and navigation actions `goHome()`, `enterCityPlaza()`, `openAcademy()`. |
| `src/locales/resources.ts` | Complete i18n text dictionaries (EN, BN, HI, ES, AR, FR). |
| `public/textures/nasa-3d/` | Local NASA textures: `earth-blue-marble.jpg`, `moon.jpg`, `saturn.jpg`, `saturn-rings.png`, etc. |

---

## 5. Development Instructions

### How to Run Locally
```bash
# Start Vite dev server
npm run dev
# The game runs on http://localhost:8080/
```

### TypeScript Validation
```bash
npx tsc --noEmit
```
*(Always ensure 0 errors before handing off).*

---

## 6. Handover Note for Incoming AI Assistant

> **Instructions for the AI Assistant:**
> 1. Do **NOT** rewrite published git history (connected to Lovable; see `AGENTS.md`).
> 2. Continue from **Section 3: Active User Intent & Agreed Roadmap**.
> 3. Navigation (Back to Home, City Plaza hub) and the 3-video Learn suite are done. Remaining open items: caption `.vtt` files and a Ceres texture (Section 3). New navigation must use `goHome()` / `enterCityPlaza()` / `openAcademy()` rather than `go("menu")` / `go("city")` / `openVideo("v01")`.
> 4. Keep all state in `useMissionStore` and read UI strings via `t()` in `resources.ts`.
