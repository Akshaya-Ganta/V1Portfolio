export type PortfolioEntry = {
  id: string
  name: string
  world?: string
  kind: string
  detail: string
  symbol: string
  terminalLines: string[]
  action: string
}

export const portfolioEntries: Record<string, PortfolioEntry> = {
  start: {
    id: 'start', name: 'START', kind: 'JOURNEY INITIALIZED', detail: 'The map is ready. Begin the route.', symbol: 'START', action: '[ENTER] BEGIN',
    terminalLines: ['> AKSHAYA_OS', 'SYSTEM READY_', 'SELECT A DESTINATION'],
  },
  about: {
    id: 'about', name: 'ABOUT ME', world: 'about', kind: 'USER PROFILE', detail: 'Who I am, what I build, and what I like exploring.', symbol: 'HOME', action: '[ENTER] ACCESS',
    terminalLines: ['> USER PROFILE', 'DEVELOPER / BUILDER / EXPERIMENTER', 'INTERESTS: SPATIAL COMPUTING / AI / GAME DEVELOPMENT', 'CURRENT STATUS: BUILDING SOMETHING._'],
  },
  academics: {
    id: 'academics', name: 'ACADEMICS', world: 'academics', kind: 'ACADEMIC RECORD', detail: 'Education, coursework, and academic milestones.', symbol: 'BOOK', action: '[ENTER] ACCESS',
    terminalLines: ['> ACADEMIC RECORD', 'DEGREE: B.TECH - COMPUTER SCIENCE', 'STATUS: CURRENTLY ENROLLED', 'COURSEWORK: DATA STRUCTURES / DATABASE SYSTEMS'],
  },
  skills: {
    id: 'skills', name: 'SKILLS', world: 'skills', kind: 'SKILL DATABASE', detail: 'Languages, frameworks, tools, and technologies.', symbol: 'TOOLS', action: '[ENTER] ACCESS',
    terminalLines: ['> SKILL DATABASE', 'LANGUAGES: PYTHON / JAVASCRIPT / TYPESCRIPT', 'FRAMEWORKS: REACT / THREE.JS / R3F', 'TOOLS: GIT / DOCKER / N8N / UNITY'],
  },
  projects: {
    id: 'projects', name: 'PROJECTS', world: 'projects', kind: 'PROJECT ARCHIVE', detail: 'Things I built, experimented with, and shipped.', symbol: 'CRT', action: '[ENTER] ACCESS ARCHIVE',
    terminalLines: ['> PROJECT ARCHIVE', 'STATUS: ONLINE_', 'PROJECTS FOUND: 06', '[ENTER] ACCESS ARCHIVE'],
  },
  hackathons: {
    id: 'hackathons', name: 'HACKATHONS', world: 'hackathons', kind: 'HACKATHON ARCHIVE', detail: 'Fast builds, strange constraints, useful pressure.', symbol: 'CUP', action: '[ENTER] ACCESS ARCHIVE',
    terminalLines: ['> HACKATHON ARCHIVE', 'FAST BUILDS / TIGHT DEADLINES', 'DEADLINE PRESSURE DETECTED_', '[ENTER] ACCESS ARCHIVE'],
  },
  ai: {
    id: 'ai', name: 'AI / AUTOMATION', world: 'ai', kind: 'AI MODULE', detail: 'Agents, LLMs, automation, and intelligent systems.', symbol: 'AI', action: '[ENTER] ACCESS MODULE',
    terminalLines: ['> AI MODULE', 'LLM INTEGRATION / AGENTIC WORKFLOWS', 'AUTOMATION / INTELLIGENT SYSTEMS', 'STATUS: EXPERIMENTAL_'],
  },
  gamedev: {
    id: 'gamedev', name: 'GAME DEV', world: 'gamedev', kind: 'GAME ENGINE', detail: 'Interactive worlds, games, and experiments.', symbol: 'GAME', action: '[ENTER] ACCESS WORLD',
    terminalLines: ['> GAME ENGINE', 'INTERACTIVE WORLDS / GAME SYSTEMS', 'ENGINE: UNITY', 'WARNING: PLAYER MAY LOSE TRACK OF TIME._'],
  },
  spatial: {
    id: 'spatial', name: 'SPATIAL / 3D', world: 'spatial', kind: 'SPATIAL MODULE', detail: '3D, spatial computing, AR/VR, and immersive interfaces.', symbol: '3D', action: '[ENTER] ACCESS MODULE',
    terminalLines: ['> SPATIAL MODULE', '3D / SPATIAL COMPUTING / AR / VR', 'IMMERSIVE INTERFACES', 'STATUS: EXPERIMENTAL_'],
  },
  experience: {
    id: 'experience', name: 'EXPERIENCE', world: 'experience', kind: 'FIELD NOTES', detail: 'Places where I learned by building.', symbol: 'CASE', action: '[ENTER] OPEN ARCHIVE',
    terminalLines: ['> FIELD NOTES', 'Places where I learned by building.', 'STATUS: ARCHIVE AVAILABLE_'],
  },
  resume: {
    id: 'resume', name: 'RESUME', world: 'resume', kind: 'RESUME', detail: 'The condensed version of the journey.', symbol: 'FILE', action: '[ENTER] OPEN RESUME',
    terminalLines: ['> RESUME', 'THE CONDENSED VERSION', 'OF THE JOURNEY.', '[ENTER] OPEN RESUME'],
  },
  contact: {
    id: 'contact', name: 'CONTACT', world: 'contact', kind: 'COMMUNICATION TERMINAL', detail: "Let's build something interesting.", symbol: 'MAIL', action: '[ENTER] CONNECT',
    terminalLines: ['> COMMUNICATION TERMINAL', 'EMAIL / GITHUB / LINKEDIN', 'STATUS: OPEN TO CONNECTIONS_'],
  },
  end: {
    id: 'end', name: 'END', kind: 'JOURNEY PAUSED', detail: 'The route ends here, for now.', symbol: 'END', action: '[ESC] RETURN',
    terminalLines: ['> JOURNEY MAP COMPLETE', 'SYSTEM READY_'],
  },
}

export const commandNames = Object.keys(portfolioEntries).filter((id) => id !== 'start' && id !== 'end')
