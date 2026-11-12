export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface CadetBadge {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  color: string;
}

export interface SpaceVideo {
  id: "v01" | "v02" | "v03";
  title: string;
  subtitle: string;
  badgeTitle: string;
  file: string;
  /** Optional WebVTT caption tracks (e.g. /videos/captions/v01.en.vtt). Rendered as <track> elements. */
  captions?: { lang: string; label: string; src: string }[];
  durationLabel: string;
  audience: string;
  category: string;
  summary: string;
  keyLearnings: string[];
  badge: CadetBadge;
  quiz: QuizQuestion[];
}

export const SPACE_VIDEOS: SpaceVideo[] = [
  {
    id: "v01",
    title: "Why Do We Explore Space?",
    subtitle: "The Importance of Human Space Exploration",
    badgeTitle: "Video 1 · Introductory Orientation",
    file: "/videos/v01-why-explore-space.mp4",
    durationLabel: "Introductory Lesson",
    audience: "Cadets Ages 8–14",
    category: "Space Science & Philosophy",
    summary:
      "Join Dr. Ayesha and the space exploration team to discover why humanity ventures into the cosmos. Learn how satellite technology safeguards life on Earth, how scientific curiosity drives discovery, and how space inventions improve daily life.",
    keyLearnings: [
      "Curiosity & Discovery: Exploring space answers humanity's biggest questions about where we came from and whether life exists elsewhere.",
      "Protecting Life on Earth: Earth-observing satellites monitor hurricanes, track climate shifts, guide GPS navigation, and predict extreme weather.",
      "Real-World Inventions: Space research creates everyday technology — including scratch-resistant lenses, memory foam, ear thermometers, and water filters!",
    ],
    badge: {
      id: "badge-v01",
      name: "Cosmic Explorer Cadet",
      icon: "🌟",
      tagline: "Discovered the purpose and inspiring power of space exploration!",
      color: "from-amber-400 to-yellow-500",
    },
    quiz: [
      {
        id: "v01-q1",
        question: "Why do scientists and astronauts explore space?",
        options: [
          "Only to look for gold and treasure on distant asteroids",
          "To understand our universe, discover new worlds, and answer big questions about life",
          "Because planet Earth has completely run out of room for houses",
        ],
        correctIndex: 1,
        explanation:
          "Scientific curiosity drives space exploration! Understanding other worlds helps us protect Earth and inspires future generations.",
        hint: "Think about what scientists want to discover about the universe!",
      },
      {
        id: "v01-q2",
        question: "Which everyday system on Earth relies directly on satellites in orbit?",
        options: [
          "GPS mapping and real-time weather storm forecasts",
          "Kitchen toasters and blenders",
          "Bicycle pedals and chains",
        ],
        correctIndex: 0,
        explanation:
          "GPS navigation systems on phones and cars, as well as hurricane tracking, depend directly on satellites orbiting Earth!",
        hint: "Think about how your phone knows where you are driving!",
      },
      {
        id: "v01-q3",
        question: "True or False: Inventions designed for space missions are often adapted into products we use on Earth every day (spinoffs).",
        options: [
          "True — memory foam, baby formula improvements, and scratch-resistant lenses came from space research!",
          "False — space technology is never useful on Earth",
        ],
        correctIndex: 0,
        explanation:
          "NASA has documented thousands of spinoff technologies that improve medicine, safety, transportation, and consumer goods on Earth!",
        hint: "Think about items originally engineered to protect astronauts in extreme conditions.",
      },
    ],
  },
  {
    id: "v02",
    title: "Where Does Space Begin?",
    subtitle: "The Kármán Line & Earth's Atmospheric Layers",
    badgeTitle: "Video 2 · Physics & Atmospheres",
    file: "/videos/v02-where-space-begins.mp4",
    durationLabel: "3.5 Minutes",
    audience: "Cadets Ages 8–14",
    category: "Atmospheric Physics",
    summary:
      "Journey from the ground up through Earth's atmosphere! Discover where airplanes fly, where meteors burn up into shooting stars, and where the internationally recognized boundary of space — the Kármán Line — is located.",
    keyLearnings: [
      "The Kármán Line: 100 kilometers (62 miles) above sea level is the recognized edge of outer space.",
      "Atmospheric Layers: Troposphere (weather), Stratosphere (airliners/ozone), Mesosphere (meteors), Thermosphere (auroras/ISS), and Exosphere.",
      "Wings vs. Rockets: Airplanes require air to create wing lift; spacecraft in space travel in a vacuum using rocket thrust and orbital velocity.",
    ],
    badge: {
      id: "badge-v02",
      name: "Atmosphere Ace",
      icon: "🌍",
      tagline: "Mastered the 5 atmospheric layers and crossed the Kármán Line!",
      color: "from-cyan-400 to-blue-500",
    },
    quiz: [
      {
        id: "v02-q1",
        question: "What is the boundary 100 kilometers (62 miles) high where outer space officially begins?",
        options: [
          "The Stratosphere Ridge",
          "The Kármán Line",
          "The Sound Barrier",
        ],
        correctIndex: 1,
        explanation:
          "The Kármán Line, named after engineer Theodore von Kármán, is the worldwide standard boundary between aeronautics and astronautics!",
        hint: "It starts with the letter K and is 100 km above sea level.",
      },
      {
        id: "v02-q2",
        question: "In which layer of Earth's atmosphere do we live and where does almost all weather happen?",
        options: [
          "The Troposphere",
          "The Exosphere",
          "The Thermosphere",
        ],
        correctIndex: 0,
        explanation:
          "The Troposphere is the lowest atmospheric layer extending up to ~12 km, containing breathable air and all rain, snow, and clouds!",
        hint: "It is the lowest layer closest to the ground.",
      },
      {
        id: "v02-q3",
        question: "Why can't an ordinary passenger airplane fly into outer space?",
        options: [
          "Outer space is too cold for jet engines",
          "Airplanes need air flowing over their wings to produce aerodynamic lift; space is a vacuum",
          "Airplanes are painted colors that don't work in space",
        ],
        correctIndex: 1,
        explanation:
          "Without air to generate lift or feed combustion air into jet engines, standard aircraft cannot fly in the vacuum of space!",
        hint: "Think about what an airplane's wings need to stay up in the air.",
      },
    ],
  },
  {
    id: "v03",
    title: "Earth's Address in the Universe",
    subtitle: "Our Cosmic Address: From the Solar System to the Milky Way",
    badgeTitle: "Video 3 · Cosmic Geography & Scale",
    file: "/videos/v03-earth-address.mp4",
    durationLabel: "Cosmic Address Lesson",
    audience: "Cadets Ages 8–14",
    category: "Cosmic Geography & Scale",
    summary:
      "Where is Earth in the vast ocean of space? Join Dr. Ayesha to discover humanity's cosmic postal address! Journey step-by-step from our home planet Earth, through the 8 planets of our Solar System, into the Orion Arm of the Milky Way Galaxy, the Local Group, and into the grand Observable Universe.",
    keyLearnings: [
      "Our Planet & Neighborhood: Earth is the 3rd planet from the Sun in our Solar System, orbiting alongside rocky worlds, gas giants, moons, and asteroids.",
      "The Milky Way Galaxy: Our Solar System orbits inside the spiral Orion Arm of the Milky Way, a giant galaxy of over 100 billion stars spinning in deep space.",
      "The Grand Cosmic Scale: The Milky Way belongs to the Local Group of galaxies, nestled within the Virgo Supercluster, Laniakea, and the boundless Observable Universe!",
    ],
    badge: {
      id: "badge-v03",
      name: "Cosmic Navigator",
      icon: "🌌",
      tagline: "Mastered Earth's complete cosmic address from planet to galaxy and beyond!",
      color: "from-indigo-400 to-fuchsia-500",
    },
    quiz: [
      {
        id: "v03-q1",
        question: "What is Earth's position from the Sun in our Solar System?",
        options: [
          "The 1st planet (closest to the Sun's extreme heat)",
          "The 3rd planet (in the habitable 'Goldilocks' zone with liquid water)",
          "The 7th planet (out in the freezing gas giant region)",
        ],
        correctIndex: 1,
        explanation:
          "Earth is the 3rd planet from the Sun! It sits in the habitable 'Goldilocks Zone' where temperatures are just right for liquid water and life to thrive!",
        hint: "Mercury is 1st, Venus is 2nd... which planet comes next?",
      },
      {
        id: "v03-q2",
        question: "What is the name of the massive spiral galaxy that our Solar System lives in?",
        options: [
          "The Milky Way Galaxy",
          "The Andromeda Galaxy",
          "The Pinwheel Galaxy",
        ],
        correctIndex: 0,
        explanation:
          "Our Solar System is located in the Orion Arm of the Milky Way Galaxy, which contains over 100 to 400 billion stars!",
        hint: "It shares its name with a famous chocolate candy bar!",
      },
      {
        id: "v03-q3",
        question: "If you were writing a cosmic letter to Earth from deep space, what is Earth's cosmic address in order from closest to largest scale?",
        options: [
          "Planet Earth → Mars → The Moon → Alpha Centauri",
          "Planet Earth → Solar System → Milky Way Galaxy → Local Group → Observable Universe",
          "Planet Earth → The Sun → Asteroid Belt → Jupiter",
        ],
        correctIndex: 1,
        explanation:
          "Earth's cosmic address zooms out like a telescope: Planet Earth → Solar System → Milky Way Galaxy → Local Group of Galaxies → Observable Universe!",
        hint: "Start with our planet, then our sun's family, then our galaxy, and finally the universe!",
      },
    ],
  },
];
