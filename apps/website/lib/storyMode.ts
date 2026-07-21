export const characters = {
  daniel: {
    name: 'Daniel',
    role: 'Audio Architect',
    avatar: '🎧',
    bio: 'Specializes in sonic branding and production',
    color: '#39FF14',
    expertise: ['sound', 'mixing', 'mastering'],
    personality: 'Technical, precise, detail-oriented',
  },
  darren: {
    name: 'Darren',
    role: 'Creative Director',
    avatar: '🎬',
    bio: 'Focuses on storytelling and lyrical content',
    color: '#00D9FF',
    expertise: ['lyrics', 'narrative', 'jingles'],
    personality: 'Visionary, expressive, idea-driven',
  },
};

export const storyMilestones = [
  {
    id: 'welcome',
    chapter: 'The Beginning',
    character: 'daniel',
    message: 'Welcome to WISE² Studio. I\'m Daniel. We\'re going to create something amazing together.',
    unlocks: ['command', 'sound'],
    progress: 0,
  },
  {
    id: 'first_song',
    chapter: 'Your First Composition',
    character: 'darren',
    message: 'Hey! I\'m Darren. Ready to tell a story? Let\'s start with lyrics - that\'s where the magic begins.',
    unlocks: ['lyrics', 'jingle'],
    progress: 20,
    requirement: 'generate_lyrics',
  },
  {
    id: 'sound_design',
    chapter: 'Sonic Identity',
    character: 'daniel',
    message: 'Now that you have lyrics, let\'s build the sound. Every emotion needs an audio signature.',
    unlocks: ['live', 'voice'],
    progress: 40,
    requirement: 'create_jingle',
  },
  {
    id: 'mastery',
    chapter: 'Production Mastery',
    character: 'darren',
    message: 'You\'re getting the hang of this. Time to bring everything together - let\'s create content that moves people.',
    unlocks: ['factory', 'showcase'],
    progress: 60,
    requirement: 'complete_project',
  },
  {
    id: 'expert',
    chapter: 'Creative Visionary',
    character: 'daniel',
    message: 'You\'ve mastered the craft. Now it\'s time to push boundaries and create industry-changing content.',
    unlocks: ['all'],
    progress: 100,
    requirement: 'portfolio_projects_5',
  },
];

export type StoryMode = {
  currentMilestone: string;
  completedMilestones: string[];
  progress: number;
  projectsCreated: number;
  lyricsGenerated: number;
};

export const initializeStoryMode = (): StoryMode => ({
  currentMilestone: 'welcome',
  completedMilestones: [],
  progress: 0,
  projectsCreated: 0,
  lyricsGenerated: 0,
});

export const getCharacterDialog = (milestone: (typeof storyMilestones)[0], char: typeof characters.daniel | typeof characters.darren) => {
  return {
    avatar: char.avatar,
    name: char.name,
    role: char.role,
    message: milestone.message,
    color: char.color,
  };
};
