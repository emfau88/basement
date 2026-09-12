export type ProjectType = 'game' | 'app' | 'archive'
export type ProjectKey =
  | 'territory_tide'
  | 'core_arena'
  | 'pocket_pier'
  | 'kessel_krawall'
  | 'mirror'
  | 'zerohero'
  | 'between'
  | 'chargegeist'
  | 'cozy_bunker'
  | 'cloudtop_run'
  | 'tinywar2'
  | 'more_than_wombat'

export interface DisplayCalibration {
  brightness: number
  saturation: number
  contrast: number
}

export interface Project {
  id: ProjectKey
  title: string
  category: string
  type: ProjectType
  image: string
  summary: string
  facts: ReadonlyArray<readonly [label: string, value: string]>
  links: ReadonlyArray<readonly [label: string, url: string]>
  display: DisplayCalibration
  screenTag?: string
}

const DEFAULT_DISPLAY: DisplayCalibration = {
  brightness: 0.92,
  saturation: 0.96,
  contrast: 0.98,
}

const projectImage = (filename: string) => `${import.meta.env.BASE_URL}assets/projects/${filename}`

export const projects: Record<ProjectKey, Project> = {
  territory_tide: {
    id: 'territory_tide',
    title: 'Territory Tide',
    category: 'Featured Game',
    type: 'game',
    image: projectImage('territory-tide.webp'),
    summary: 'A mobile-first browser strategy game evolving out of HEXFRONT / hexwars. The focus is clear territory control, cleaner combat readability and portal-ready presentation.',
    facts: [['Status', 'In development'], ['Format', 'Browser strategy'], ['Focus', 'Territory control'], ['Stack', 'HTML5 / JavaScript']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/'], ['GitHub', 'https://github.com/emfau88/hexwars']],
    display: { brightness: 0.7, saturation: 0.9, contrast: 0.94 },
    screenTag: 'TACTICS / CAMPAIGN',
  },
  core_arena: {
    id: 'core_arena',
    title: 'Core Arena',
    category: 'Featured Game',
    type: 'game',
    image: projectImage('core-arena.webp'),
    summary: 'A top-down arena shooter prototype with bots, match flow and presentation work. Used here as a showcase for higher-action gameplay inside the portfolio.',
    facts: [['Status', 'Prototype'], ['Format', 'Top-down action'], ['Focus', 'Arena combat'], ['Stack', 'HTML5 / JavaScript']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']],
    display: { brightness: 0.91, saturation: 0.96, contrast: 0.98 },
    screenTag: 'ARENA / BOTS',
  },
  pocket_pier: {
    id: 'pocket_pier', title: 'Pocket Pier', category: 'Featured Game', type: 'game',
    image: projectImage('pocket-pier.webp'),
    summary: 'A calmer, more colorful browser project built around a cozy harbor atmosphere. It helps balance the harder-edged strategy and action projects visually.',
    facts: [['Status', 'Playable'], ['Format', 'Casual browser game'], ['Focus', 'Cozy atmosphere'], ['Stack', 'HTML5 / JavaScript']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: { brightness: 0.94, saturation: 0.96, contrast: 0.98 }, screenTag: 'COZY / FISHING',
  },
  kessel_krawall: {
    id: 'kessel_krawall', title: 'Kessel-Krawall', category: 'Featured Game', type: 'game',
    image: projectImage('kessel-krawall.webp'),
    summary: 'An autobattler-style concept that adds variety to the portfolio’s games section and gives the main monitor a more playful visual contrast.',
    facts: [['Status', 'Prototype'], ['Format', 'Autobattler'], ['Focus', 'System design'], ['Stack', 'HTML5 / JavaScript']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: { brightness: 0.9, saturation: 0.95, contrast: 0.98 }, screenTag: 'AUTOBATTLER',
  },
  mirror: {
    id: 'mirror', title: 'Mirror', category: 'Featured App', type: 'app', image: projectImage('mirror.webp'),
    summary: 'A design-oriented Android app used here as part of the web/app showcase. It gives the studio a second lane beyond games and makes the portfolio feel broader.',
    facts: [['Status', 'Published concept'], ['Format', 'Android app'], ['Focus', 'Reflection / clarity'], ['Stack', 'Flutter']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY, screenTag: 'CLARITY / REFLECTION',
  },
  zerohero: {
    id: 'zerohero', title: 'ZeroHero', category: 'Featured App', type: 'app', image: projectImage('zerohero.webp'),
    summary: 'A habit-focused mobile project with stronger product-style visuals. It works well for the cleaner app-oriented workstation on the right side of the room.',
    facts: [['Status', 'Published concept'], ['Format', 'Android app'], ['Focus', 'Habits / progression'], ['Stack', 'Flutter']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY, screenTag: 'HABITS / QUESTS',
  },
  between: {
    id: 'between', title: 'between', category: 'Featured App', type: 'app', image: projectImage('between.webp'),
    summary: 'A report- and relationship-oriented interface concept. It helps diversify the app screen content and adds a more editorial look to the web desk.',
    facts: [['Status', 'Published concept'], ['Format', 'Android app'], ['Focus', 'Reports / connection'], ['Stack', 'Flutter']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY, screenTag: 'RELATIONSHIP REPORTS',
  },
  chargegeist: {
    id: 'chargegeist', title: 'ChargeGeist', category: 'Featured App', type: 'app', image: projectImage('chargegeist.webp'),
    summary: 'A more game-like mobile app with stronger character and collection vibes. Good for making the app workstation feel less generic and more personal.',
    facts: [['Status', 'Published concept'], ['Format', 'Android app'], ['Focus', 'Collection mechanics'], ['Stack', 'Flutter']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY, screenTag: 'COLLECTION GAME',
  },
  cozy_bunker: {
    id: 'cozy_bunker', title: 'Cozy Bunker', category: 'Archive', type: 'archive', image: projectImage('cozy-bunker.webp'),
    summary: 'An older archived project shown on the CRT so the studio acknowledges previous explorations instead of hiding them completely.',
    facts: [['Status', 'Archived'], ['Format', 'Game concept'], ['Focus', 'Exploration'], ['Section', 'Archive']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY,
  },
  cloudtop_run: {
    id: 'cloudtop_run', title: 'Cloudtop Run', category: 'Archive', type: 'archive', image: projectImage('cloudtop-run.webp'),
    summary: 'An archived browser project used here to make the archive zone feel like a real portfolio memory bank rather than a decorative prop.',
    facts: [['Status', 'Archived'], ['Format', 'Game concept'], ['Focus', 'Prototype history'], ['Section', 'Archive']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY,
  },
  tinywar2: {
    id: 'tinywar2', title: 'TinyWar 2.0', category: 'Archive', type: 'archive', image: projectImage('tinywar-2.webp'),
    summary: 'An earlier strategy-related project that fits naturally into the archive screen and strengthens the sense of development over time.',
    facts: [['Status', 'Archived'], ['Format', 'Strategy concept'], ['Focus', 'Iteration history'], ['Section', 'Archive']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY,
  },
  more_than_wombat: {
    id: 'more_than_wombat', title: 'More Than Wombat', category: 'Archive', type: 'archive', image: projectImage('wombat.webp'),
    summary: 'A lighter archived project that adds some personality to the CRT loop and keeps the archive from feeling visually monotonous.',
    facts: [['Status', 'Archived'], ['Format', 'Game / experiment'], ['Focus', 'Portfolio breadth'], ['Section', 'Archive']],
    links: [['Portfolio', 'https://emfau88.github.io/Portfolio3/']], display: DEFAULT_DISPLAY,
  },
}

export const gameProjectKeys = ['territory_tide', 'core_arena', 'pocket_pier', 'kessel_krawall'] as const
export const webProjectKeys = ['mirror', 'zerohero', 'between', 'chargegeist'] as const
export const archiveProjectKeys = ['cozy_bunker', 'cloudtop_run', 'tinywar2', 'more_than_wombat'] as const
export const featuredProjectKeys = ['territory_tide', 'core_arena', 'pocket_pier', 'mirror'] as const
