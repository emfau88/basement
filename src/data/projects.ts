export type ProjectType = 'game' | 'app' | 'archive'
export type ProjectKey =
  | 'territory_tide'
  | 'core_arena'
  | 'pocket_pier'
  | 'kessel_krawall'
  | 'rooster_rage'
  | 'terra_divina'
  | 'galalaxy'
  | 'strategy_galalaxy'
  | 'mirror'
  | 'zerohero'
  | 'between'
  | 'chargegeist'
  | 'mewtrack'
  | 'marschlegenden'
  | 'cozy_bunker'
  | 'cloudtop_run'
  | 'tinywar2'
  | 'more_than_wombat'
  | 'voidline_farhaven'

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

export const projectPreviewImage = (project: Project): string => project.image.replace(/\.webp$/, '-preview.webp')

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
  rooster_rage: {
    id: 'rooster_rage', title: 'Rooster Rage', category: 'Featured Game', type: 'game',
    image: projectImage('rooster-rage.webp'),
    summary: 'A mobile-first action roguelite with three battle roosters, evolving egg weapons, escalating waves and a multi-phase boss.',
    facts: [['Status', 'Active build'], ['Format', 'Action roguelite'], ['Focus', 'Readable swarm combat'], ['Stack', 'Phaser / TypeScript']],
    links: [['Play', 'https://emfau88.github.io/RoosterRage/'], ['GitHub', 'https://github.com/emfau88/RoosterRage']],
    display: { brightness: 0.95, saturation: 1, contrast: 1 }, screenTag: 'SWARMS / BUILDCRAFT',
  },
  terra_divina: {
    id: 'terra_divina', title: 'Terra Divina', category: 'Featured Game', type: 'game',
    image: projectImage('terra-divina.webp'),
    summary: 'A divine browser sandbox about creating, guiding and destroying a living world while factions and scenarios emerge from the simulation.',
    facts: [['Status', 'Playable experiment'], ['Format', 'World sandbox'], ['Focus', 'Emergent simulation'], ['Stack', 'HTML5 / JavaScript']],
    links: [['Play', 'https://emfau88.github.io/Terra-Divina/'], ['GitHub', 'https://github.com/emfau88/Terra-Divina']],
    display: { brightness: 0.94, saturation: 1, contrast: 1 }, screenTag: 'SANDBOX / SIMULATION',
  },
  galalaxy: {
    id: 'galalaxy', title: 'Galalaxy', category: 'Featured Game', type: 'game',
    image: projectImage('galalaxy.webp'),
    summary: 'A portrait-first arcade space survivor with escalating fleet sectors and visible weapon, engine and defensive evolution.',
    facts: [['Status', 'Playable'], ['Format', 'Arcade survivor'], ['Focus', 'Ship evolution'], ['Stack', 'HTML5 Canvas']],
    links: [['Play', 'https://emfau88.github.io/galalaxy/'], ['GitHub', 'https://github.com/emfau88/galalaxy']],
    display: { brightness: 0.96, saturation: 1, contrast: 1 }, screenTag: 'ARCADE / EVOLUTION',
  },
  strategy_galalaxy: {
    id: 'strategy_galalaxy', title: 'Strategy Galalaxy', category: 'Featured Game', type: 'game',
    image: projectImage('strategy-galalaxy.webp'),
    summary: 'A portrait-first live lane-war experiment where two fleets fight continuously while energy, drone waves and deployed squads shape the front.',
    facts: [['Status', 'Active build'], ['Format', 'Live lane war'], ['Focus', 'Fleet pressure'], ['Stack', 'HTML5 / TypeScript']],
    links: [['Play', 'https://emfau88.github.io/strategy-galalaxy/'], ['GitHub', 'https://github.com/emfau88/strategy-galalaxy']],
    display: { brightness: 0.96, saturation: 1, contrast: 1 }, screenTag: 'FLEETS / LIVE DEPLOY',
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
  mewtrack: {
    id: 'mewtrack', title: 'MewTrack', category: 'Published App', type: 'app', image: projectImage('mewtrack.webp'),
    summary: 'A private photo-progress tracker built around reproducible profile comparisons, local history and a focused no-subscription workflow.',
    facts: [['Status', 'Published'], ['Format', 'Android app'], ['Focus', 'Private photo progress'], ['Platform', 'Google Play']],
    links: [['Google Play', 'https://play.google.com/store/apps/details?id=com.chargegeist.mew']],
    display: { brightness: 0.95, saturation: 1, contrast: 1 }, screenTag: 'PRIVATE / PHOTO PROGRESS',
  },
  marschlegenden: {
    id: 'marschlegenden', title: 'MarschLegenden', category: 'Published App', type: 'app', image: projectImage('marschlegenden.webp'),
    summary: 'A digital hall of fame for long-distance marches, finished events, accumulated kilometers and a persistent personal event history.',
    facts: [['Status', 'Published'], ['Format', 'Android app'], ['Focus', 'Extreme hiking history'], ['Stack', 'React Native']],
    links: [['Google Play', 'https://play.google.com/store/apps/details?id=com.chargegeist.marchlegends']],
    display: { brightness: 1.12, saturation: 1, contrast: 1.02 }, screenTag: 'EVENTS / HISTORY',
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
    id: 'more_than_wombat', title: 'More Than Wombat', category: 'Featured Game', type: 'game', image: projectImage('wombat.webp'),
    summary: 'A comic-styled 2.5D arcade brawler with short sessions, readable hit feedback, stage interactions and character-specific specials.',
    facts: [['Status', 'Active build'], ['Format', '2.5D arcade brawler'], ['Focus', 'Character combat'], ['Stack', 'Browser game']],
    links: [['Play', 'https://emfau88.github.io/MoreThanWombat/'], ['GitHub', 'https://github.com/emfau88/MoreThanWombat']],
    display: { brightness: 0.94, saturation: 0.98, contrast: 1 }, screenTag: 'BRAWLER / CHARACTER',
  },
  voidline_farhaven: {
    id: 'voidline_farhaven', title: 'Voidline: Farhaven', category: 'Archive', type: 'archive', image: projectImage('voidline-farhaven.webp'),
    summary: 'A retired space-exploration prototype about scanning cold sectors, salvaging signals and expanding the persistent Farhaven outpost.',
    facts: [['Status', 'Archived'], ['Format', 'Space explorer'], ['Focus', 'Outpost progression'], ['Section', 'Archive']],
    links: [['Prototype', 'https://emfau88.github.io/Voidline-Tactic/'], ['GitHub', 'https://github.com/emfau88/Voidline-Tactic']],
    display: { brightness: 0.92, saturation: 0.95, contrast: 1 },
  },
}

export const gameProjectKeys = [
  'territory_tide', 'core_arena', 'pocket_pier', 'kessel_krawall', 'rooster_rage',
  'more_than_wombat', 'terra_divina', 'galalaxy', 'strategy_galalaxy',
] as const
export const webProjectKeys = ['mirror', 'zerohero', 'between', 'chargegeist', 'mewtrack'] as const
export const archiveProjectKeys = ['cozy_bunker', 'cloudtop_run', 'tinywar2', 'voidline_farhaven'] as const
export const featuredProjectKeys = ['rooster_rage', 'more_than_wombat', 'terra_divina', 'marschlegenden'] as const
