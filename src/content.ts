// All site content lives in this file. Edit facts here; no code changes needed.
// Anything missing is marked with TODO( ... ) and listed in `todos` at the bottom.

export const TODO_MARK = 'TODO:';
const TODO = (what: string): string => `${TODO_MARK} ${what}`;

export interface Link {
  label: string;
  href: string;
}

export interface Block {
  title: string;
  text: string;
}

export interface Stage {
  id: string;
  /** Kilometre number; null for the finish. */
  km: number | null;
  /** Short label for the stage map and tooltips. */
  mapLabel: string;
  /** The h2. */
  title: string;
  /** Banner text shown when the runner stops. */
  banner: string;
  /** Scene id, drawn in src/scenes. */
  scene: string;
  /** Large figure shown with the stage. */
  bigNumber?: { value: string; caption?: string };
  text: string;
  readMore?: string[];
  blocks?: Block[];
  smallLine?: string;
  note?: string;
  stamp?: string;
  links?: Link[];
}

export const site = {
  documentTitle: 'Anupam Sharma: The Road from Himachal',
  description: "An AI product builder's portfolio, played as a 16-bit marathon.",
  name: 'Anupam Sharma',
  speaker: 'Anupam',
  gameTitle: 'The Road from Himachal',
  tagline: 'AI product builder. A portfolio you play as a marathon from Himachal.',
  katakana: 'プレス スタート',
};

export const contact = {
  email: 'sharma.anupam2006@gmail.com',
  mailto: 'mailto:sharma.anupam2006@gmail.com',
  linkedin: 'https://www.linkedin.com/in/anupam-sharma-141530230',
  github: 'https://github.com/Anupamgt',
};

export const stages: Stage[] = [
  {
    id: 'km0',
    km: 0,
    mapLabel: 'KM 0 Himachal',
    title: 'Himachal and Punjab',
    banner: 'CHECKPOINT',
    scene: 'km0',
    text:
      "I'm from a mix of Himachal and Punjab, and I live in Chandigarh. As a kid I got hooked on logical reasoning books. I loved finding the pattern in a problem, and I realised I was good at it.",
    note: 'still how I work: find the pattern in the mess.',
  },
  {
    id: 'km1',
    km: 1,
    mapLabel: 'KM 1 IIT Patna',
    title: 'IIT Patna',
    banner: 'CHECKPOINT',
    scene: 'km1',
    bigNumber: { value: '2027' },
    text:
      'I study civil and environmental engineering at IIT Patna, class of 2027. I found product through like-minded mentors and seniors who wanted to do something different and not take the usual software engineering route that many students at other IITs follow. I was an associate at the Finance Club, and one of the coordinators, who is now at Blinkit, became my mentor.',
    readMore: [
      'Fund Manager for Anwesha, our fest, directing the budget for 45,000 people.',
      'Media and PR sub-coordinator for Celesta, managing media and sponsorship outreach.',
      'Part of the NJACK technical cohort, running AI workshops and a product analytics group.',
    ],
    note: 'civil engineering taught me to build things people stand on.',
  },
  {
    id: 'km2',
    km: 2,
    mapLabel: 'KM 2 FleetX',
    title: 'FleetX',
    banner: 'TURNING POINT',
    scene: 'km2',
    text:
      'FleetX is where I became obsessed with users. In summer 2025 I was a product management intern at FleetX, a fleet management company. I scoped an in-app driver training platform, using SQL on driver violation data to set when training gets assigned automatically. I designed it for two kinds of users, implementation managers and drivers. I also scoped a self-serve knowledge base for new clients, and helped design an AI crawler that tagged knowledge-base articles automatically.',
    blocks: [
      {
        title: 'The moment',
        text:
          'While I was working on the product, I realised I was thinking about it twenty-four seven. That is when it clicked. I had become obsessed with the customer, and that changed how I work.',
      },
    ],
    note: 'after this, everything I built started with a person, not a feature.',
    stamp: 'FleetX, May to July 2025',
  },
  {
    id: 'km3',
    km: 3,
    mapLabel: 'KM 3 IIT Ropar',
    title: 'IIT Ropar',
    banner: 'CHECKPOINT',
    scene: 'km3',
    text:
      'Summer 2026, IIT Ropar sensing research centre. I built MineArchive, a boundary archive for sand-mining sites, from a first version to 1.0 in eight releases, and it is in use by the Punjab government. I wrote the product requirements for GeoDB, a geospatial database with an AI sandbox that writes and fixes its own analysis code, and directed its build.',
    readMore: [
      "I also co-authored FloodCast-GEE, an explainable AI framework for urban flood risk, accepted at IEEE AP-GARSS 2026, where I'm the presenting author. My B.Tech project models landslide risk in Aizawl, Mizoram.",
    ],
    links: [
      { label: 'github.com/Anupamgt/minearchive', href: 'https://github.com/Anupamgt/minearchive' },
      { label: 'github.com/Anupamgt/geodb', href: 'https://github.com/Anupamgt/geodb' },
      { label: 'github.com/Anupamgt/lsi-ml-pipeline', href: 'https://github.com/Anupamgt/lsi-ml-pipeline' },
    ],
  },
  {
    id: 'km4',
    km: 4,
    mapLabel: 'KM 4 Baltej Infra',
    title: 'Baltej Infra',
    banner: 'CHECKPOINT',
    scene: 'km4',
    bigNumber: { value: '26 users', caption: 'in month one, across 2 highway projects' },
    text:
      'My role at Baltej Infra, a road construction firm, started in November 2024. Daily progress reports were coming in as WhatsApp photos and Excel sheets. I built SiteWatch, an app where each site engineer files the day\'s report from a phone. In its first month, 26 people used it: 1 admin, 6 supervisors and 19 site engineers.',
    blocks: [
      {
        title: 'The decision that mattered',
        text:
          'I made the Excel export match the old workbook, column for column, so nobody downstream had to change anything. Adoption mattered more than a cleaner format. Every edit and corrective action is audit-logged, which the firm cared about more than speed, and reporting lag dropped by about an hour.', // taste-skill-ignore: verbatim copy
      },
      {
        title: 'The pushback',
        text:
          'The hardest part was adoption. Early on it was difficult to explain to the stakeholders what problems we were facing, and I had to get through that before anyone would change how they worked. The real job was convincing non-technical construction company founders to move to a tech product.',
      },
    ],
    smallLine: "I also built the company's public website, with a catalogue of 21 projects and a careers page.",
    note: 'next, save reports offline, because connectivity on site is patchy.',
    stamp: 'SiteWatch, August 2026',
    links: [
      { label: 'github.com/Anupamgt/SiteWatch', href: 'https://github.com/Anupamgt/SiteWatch' },
      { label: 'github.com/Anupamgt/baltej-infra-website', href: 'https://github.com/Anupamgt/baltej-infra-website' },
    ],
  },
  {
    id: 'km5',
    km: 5,
    mapLabel: 'KM 5 Build season',
    title: 'Build season',
    banner: 'CHECKPOINT',
    scene: 'km5',
    text:
      '2026 was my build season. I build AI products end to end: I write the requirements, direct AI coding agents through the build, and check every result.',
  },
  {
    id: 'km6',
    km: 6,
    mapLabel: 'KM 6 Chai tapri',
    title: 'Chai tapri',
    banner: 'CHECKPOINT',
    scene: 'km6',
    text:
      "Off the road. I'm a state-level powerlifter. I competed in the under 93 kilogram category in 2026. Lifting taught me to trust slow, honest progress: the bar either moves or it doesn't. An injury made me step away from competitive lifting in October 2026, so I changed class. Now I lift three full-body days a week and I'm building my running toward thirty kilometres a week.",
  },
  {
    id: 'km7',
    km: 7,
    mapLabel: 'KM 7 Refuel station',
    title: 'Refuel station',
    banner: 'CHECKPOINT',
    scene: 'km7',
    text: '',
  },
  {
    id: 'finish',
    km: null,
    mapLabel: 'Finish',
    title: 'Finish',
    banner: '',
    scene: 'finish',
    text: '',
  },
];

export interface Item {
  id: string;
  name: string;
  line: string;
  details: string;
  tag: 'My repo' | 'Team, my part';
  /** Pixel icon id, drawn in src/art/icons. */
  icon: string;
  note?: string;
  links: Link[];
}

export const items: { flagship: Item[]; team: Item[] } = {
  flagship: [
    {
      id: 'mandate',
      name: 'Mandate',
      line: 'Spending limits for AI payment agents.',
      details:
        'A proxy that gives AI agents capped, revocable and audited spending power on Razorpay, in test mode. Across 50 seeded attempts it made zero false approvals and zero false denials, with a median decision time of 77 milliseconds, and it passed a 10-case red-team suite.',
      tag: 'My repo',
      icon: 'shield-coin',
      links: [{ label: 'github.com/Anupamgt/mandate', href: 'https://github.com/Anupamgt/mandate' }],
    },
    {
      id: 'qcommerce',
      name: 'Q-Commerce Retention Lab',
      line: 'Caught a churn model that was too good to be true.',
      details:
        "I showed that a published Blinkit churn model's 99.5 percent accuracy came from data leakage, then rebuilt the analysis on 12,000 simulated users and 112,766 orders.",
      tag: 'My repo',
      icon: 'bag-chart',
      links: [
        { label: 'github.com/Anupamgt/blinkit_churn_analysis', href: 'https://github.com/Anupamgt/blinkit_churn_analysis' },
        { label: 'anupamgt.github.io/blinkit_churn_analysis (live dashboard)', href: 'https://anupamgt.github.io/blinkit_churn_analysis' },
      ],
    },
    {
      id: 'recruiter',
      name: 'AI Recruiter',
      line: 'Ranks candidates with hybrid AI search.',
      details:
        'Built for the Redrob Hackathon in June 2026. It combines meaning-based search with keyword search, then an AI judge writes an interview guide for each shortlisted candidate.',
      tag: 'My repo',
      icon: 'magnifier-card',
      links: [{ label: 'github.com/Anupamgt/ai-recruiter-poc', href: 'https://github.com/Anupamgt/ai-recruiter-poc' }],
    },
  ],
  team: [
    {
      id: 'nexus',
      name: 'Nexus Loop',
      line: 'Quality monitoring for support AI agents.',
      details:
        'Yellow.ai TechQuest, team Mayush Aura. We came third of six with 95 out of 100. My part: the product requirements, the prototype, the operator\'s approval screen, and the decision wording that the evaluators called the most precise in the group.',
      tag: 'Team, my part',
      icon: 'loop-arrow',
      note: 'next, verify every fix by replay, not just one of three.',
      links: [],
    },
    {
      id: 'bolnai',
      name: 'Bolnai',
      line: 'A voice AI help desk for clinics.',
      details:
        'Answers missed clinic calls in English, Hindi and Hinglish. My part: the product requirements, the content strategy and the go-to-market plan. My teammate builds the voice agent. Not live yet.',
      tag: 'Team, my part',
      icon: 'phone-waves',
      links: [{ label: 'github.com/Anupamgt/tts-agent-1', href: 'https://github.com/Anupamgt/tts-agent-1' }],
    },
    {
      id: 'digitaltwin',
      name: 'DigitalTwin.ai',
      line: 'An early-warning layer for vehicle assembly lines.',
      details: 'AIC hackathon, round 2, team Waterpark Enthusiasts. My part: the idea and its execution.',
      tag: 'Team, my part',
      icon: 'factory',
      links: [
        {
          label: 'github.com/Anupamgt/WaterparkEnthusiasts_DigitalTwin.ai',
          href: 'https://github.com/Anupamgt/WaterparkEnthusiasts_DigitalTwin.ai',
        },
      ],
    },
    {
      id: 'gateway',
      name: 'Gateway Skills',
      line: 'Turns AI agent history into reusable skills.',
      details:
        'An AI gateway console that keeps agent runs only when a team opts in, then turns repeated successful work into reusable agent skills. My part: the idea and its execution.',
      tag: 'Team, my part',
      icon: 'scroll',
      links: [{ label: 'github.com/Anupamgt/gateway-skills', href: 'https://github.com/Anupamgt/gateway-skills' }],
    },
  ],
};

export const itemCount = items.flagship.length + items.team.length;

export const highScores = {
  title: 'High scores',
  rows: [
    'Amazon ML Challenge 2025: top 1.5 percent of 15,000-plus teams.',
    'Adobe India Hackathon 2025: top 200 of 10,000-plus teams.',
    'EY Techathon 2025: top 100 of 8,000-plus teams.',
  ],
};

export const chai = {
  chalkboard: ['Squat 207.5 kg.', 'Bench 130 kg.', 'Deadlift 245 kg.'],
  save: {
    heading: 'Game saved',
    rows: [
      { label: 'Distance', value: '6 km' },
      { label: 'Items collected', value: String(itemCount) },
      { label: 'Class', value: 'lifter, now runner' },
    ],
    chai: { one: 'Chai: 1 cutting', two: 'Chai: 2 cutting' },
    kettlePrompt: 'One more cutting?',
  },
};

export const status = {
  rows: [
    { label: 'Name', value: 'Anupam Sharma' },
    { label: 'Class', value: 'AI product builder' },
    { label: 'Origin', value: 'Himachal and Punjab' },
    { label: 'Base', value: 'Chandigarh' },
  ],
  skills: [
    {
      id: 'user-sense',
      name: 'User sense',
      text: 'I find what the person actually needs before I scope anything.',
      icon: 'person',
      jumpTo: [2, 4],
    },
    {
      id: 'ship-own',
      name: 'Ship and own',
      text: "I put it in front of real users and stay with it until it's used.",
      icon: 'flag',
      jumpTo: [3, 4],
    },
    {
      id: 'ai-builder',
      name: 'AI builder',
      text: 'I write the requirements, direct AI agents through the build, and check the result.',
      icon: 'chip',
      jumpTo: [5],
    },
  ],
  recordTitle: 'Record',
  record: [
    "26 users in SiteWatch's first month.",
    '8 MineArchive releases in about 10 weeks.',
    "0 false approvals in Mandate's 50 test attempts.",
    '3rd of 6 in the Yellow.ai TechQuest.',
    '1 paper accepted at IEEE AP-GARSS 2026.',
  ],
};

export const finish = {
  stageClear: 'Stage clear',
  continueTitle: 'Continue?',
  nextStage: TODO("what I'm looking for"),
  nextStagePrefix: 'Next stage:',
  earliestStart: 'Earliest start: January 2027.',
  buttons: [
    { label: 'Email me', href: contact.mailto, primary: true },
    { label: 'LinkedIn', href: contact.linkedin, primary: false },
    { label: 'GitHub', href: contact.github, primary: false },
  ],
  credits: [
    'The Road from Himachal',
    'Player: Anupam Sharma',
    'Designed and built by Anupam Sharma',
    'Thank you for playing',
  ],
  playAgain: 'Press start to play again',
};

export const title = {
  quickRun: 'Quick run, 1 minute',
  fullRun: 'Full run',
};

export const ui = {
  readModeLabel: 'Read mode',
  skipLink: 'Skip to content',
  checkpointBanner: 'CHECKPOINT',
  readMore: 'Read more',
  readLess: 'Show less',
  dialogueMore: 'More',
};

/** Anything below is still missing and needs a real value from Anupam. */
export const todos: string[] = [
  'finish.nextStage: what I am looking for (Continue screen).',
  'public/og.png: regenerate with scripts/og.py once the real runner sprite is in.',
  'public/sprites/runner_sheet_1x.png and portrait_32.png: placeholders until the real sprites are added.',
  'public/shots/minearchive.png and public/shots/sitewatch.png: not added yet; stages draw a fallback.',
  'Pictures of the flagship items (Mandate, Q-Commerce Retention Lab, AI Recruiter): icons only until real shots exist.',
];
