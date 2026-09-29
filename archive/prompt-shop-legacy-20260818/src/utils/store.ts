import { create } from 'zustand';
import { Build, InfluenceMix, VisualDNA, ForemanState } from '@/types';

interface BuildState {
  currentBuild: Build | null;
  systems: any[];
  influence: InfluenceMix;
  visualDNA: VisualDNA;
  foremanState: ForemanState;

  updateInfluence: (systemId: string, value: number) => void;
  updateVisualDNA: (key: keyof VisualDNA, value: any) => void;
  setCurrentBuild: (build: Build) => void;
  setForemanState: (state: Partial<ForemanState>) => void;
  getInfluenceTotal: () => number;
  isInfluenceValid: () => boolean;
}

export const useBuildStore = create<BuildState>((set, get) => ({
  currentBuild: null,
  systems: [],
  influence: {},
  visualDNA: {
    lineStyle: 'smooth',
    colorPalette: 'vibrant',
    lighting: 'soft',
    texture: 'detailed',
    composition: 'balanced',
    mood: 'creative',
    depth: 'layered',
    blendStrength: 75,
  },
  foremanState: {
    currentState: 'idle',
    message: "Aight, lemme see the blueprints.",
    isAnimating: false,
  },

  updateInfluence: (systemId: string, value: number) => {
    set((state) => ({
      influence: {
        ...state.influence,
        [systemId]: Math.max(0, Math.min(100, value)),
      },
    }));

    // React to influence changes
    const total = get().getInfluenceTotal();
    const messages: { [key: number]: string } = {
      0: "Three words? What am I buildin' here, a shed?",
      50: "Boss, I need measurements. Gimme somethin' to work with.",
      99: "Almost there. Just a touch more.",
      100: "There we go. Hundred percent. Now we're up to code.",
    };

    if (total > 100) {
      set((state) => ({
        foremanState: {
          ...state.foremanState,
          message: "Whoa, Picasso. We got " + total + '%. Math ain\'t optional on this job.',
        },
      }));
    } else if (messages[total]) {
      set((state) => ({
        foremanState: {
          ...state.foremanState,
          message: messages[total],
        },
      }));
    }
  },

  updateVisualDNA: (key: keyof VisualDNA, value: any) => {
    set((state) => ({
      visualDNA: {
        ...state.visualDNA,
        [key]: value,
      },
    }));
  },

  setCurrentBuild: (build: Build) => {
    set({
      currentBuild: build,
      influence: build.influence,
      visualDNA: build.visualDNA,
    });
  },

  setForemanState: (state: Partial<ForemanState>) => {
    set((current) => ({
      foremanState: {
        ...current.foremanState,
        ...state,
      },
    }));
  },

  getInfluenceTotal: () => {
    return Object.values(get().influence).reduce((a, b) => a + b, 0);
  },

  isInfluenceValid: () => {
    return get().getInfluenceTotal() === 100;
  },
}));
