import * as THREE from "three";

// Ensure Three.js prototypes gracefully handle pierced JSX properties with multiple hyphens (like data-tsd-source from Vite/Tanstack)
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

/**
 * Shared architectural PBR materials for Forge City
 * Inspired by GitCity's material palette, tailored for a crisp aerospace research campus.
 */
export const CITY_MATERIALS = {
  // Building Facades
  whiteComposite: new THREE.MeshStandardMaterial({
    color: "#F1F5F9",
    roughness: 0.35,
    metalness: 0.2,
  }),
  silverTitanium: new THREE.MeshStandardMaterial({
    color: "#94A3B8",
    roughness: 0.25,
    metalness: 0.8,
  }),
  darkAerospace: new THREE.MeshStandardMaterial({
    color: "#0F172A",
    roughness: 0.4,
    metalness: 0.6,
  }),
  
  // Glazing / Windows
  cyanCurtainGlass: new THREE.MeshStandardMaterial({
    color: "#38BDF8",
    roughness: 0.1,
    metalness: 0.85,
    emissive: "#0284C7",
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.85,
  }),
  solarAtriumGlass: new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    roughness: 0.05,
    metalness: 0.9,
    emissive: "#00E5FF",
    emissiveIntensity: 0.35,
  }),
  illuminatedWindow: new THREE.MeshStandardMaterial({
    color: "#E2E8F0",
    emissive: "#BAE6FD",
    emissiveIntensity: 0.6,
    roughness: 0.2,
  }),

  // Pavement & Ground
  plazaConcrete: new THREE.MeshStandardMaterial({
    color: "#CBD5E1",
    roughness: 0.6,
    metalness: 0.1,
  }),
  asphaltRoad: new THREE.MeshStandardMaterial({
    color: "#1E293B",
    roughness: 0.8,
    metalness: 0.1,
  }),
  roadMarking: new THREE.MeshStandardMaterial({
    color: "#F8FAFC",
    roughness: 0.4,
  }),
  curbStone: new THREE.MeshStandardMaterial({
    color: "#94A3B8",
    roughness: 0.7,
  }),
  campusGreen: new THREE.MeshStandardMaterial({
    color: "#15803D",
    roughness: 0.9,
  }),

  // Structural & Industrial
  gantrySteel: new THREE.MeshStandardMaterial({
    color: "#475569",
    roughness: 0.4,
    metalness: 0.85,
  }),
  warningYellow: new THREE.MeshStandardMaterial({
    color: "#EAB308",
    roughness: 0.5,
  }),
  hazardRed: new THREE.MeshStandardMaterial({
    color: "#EF4444",
    roughness: 0.4,
    metalness: 0.5,
  }),
};

/**
 * Procedural building facade generator inspired by GitCity's bay-and-eave architecture
 */
export function createFaçadeBays(
  width: number,
  height: number,
  depth: number,
  floors: number,
  baysX: number,
  hasEntrance: boolean = false
) {
  const group = new THREE.Group();
  const floorHeight = height / floors;
  const bayWidth = width / baysX;

  // Solid structural frame
  const frameGeo = new THREE.BoxGeometry(width, height, depth);
  const frameMesh = new THREE.Mesh(frameGeo, CITY_MATERIALS.whiteComposite);
  frameMesh.position.y = height / 2;
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  // Recessed window bays on front and rear
  for (let f = 0; f < floors; f++) {
    // Skip entrance area on ground floor if entrance requested
    if (f === 0 && hasEntrance) continue;

    for (let b = 0; b < baysX; b++) {
      const wx = -width / 2 + bayWidth * (b + 0.5);
      const wy = floorHeight * (f + 0.5);

      // Front window strip
      const winGeo = new THREE.BoxGeometry(bayWidth * 0.78, floorHeight * 0.65, 0.2);
      const winMesh = new THREE.Mesh(winGeo, CITY_MATERIALS.cyanCurtainGlass);
      winMesh.position.set(wx, wy, depth / 2 + 0.05);
      group.add(winMesh);

      // Back window strip
      const winBack = winMesh.clone();
      winBack.position.set(wx, wy, -depth / 2 - 0.05);
      group.add(winBack);
    }
  }

  // Roof parapet & mechanical penthouse (inspired by GitCity's roof kit)
  const parapetHeight = 0.8;
  const parapetGeo = new THREE.BoxGeometry(width + 0.2, parapetHeight, depth + 0.2);
  const parapet = new THREE.Mesh(parapetGeo, CITY_MATERIALS.silverTitanium);
  parapet.position.y = height + parapetHeight / 2;
  group.add(parapet);

  // Roof HVAC / Communications Antenna
  const hvacGeo = new THREE.BoxGeometry(width * 0.35, 1.4, depth * 0.35);
  const hvac = new THREE.Mesh(hvacGeo, CITY_MATERIALS.darkAerospace);
  hvac.position.set(0, height + 0.7, 0);
  group.add(hvac);

  const antGeo = new THREE.CylinderGeometry(0.08, 0.12, 4.5, 8);
  const ant = new THREE.Mesh(antGeo, CITY_MATERIALS.gantrySteel);
  ant.position.set(width * 0.25, height + 2.25, depth * 0.2);
  group.add(ant);

  return group;
}
