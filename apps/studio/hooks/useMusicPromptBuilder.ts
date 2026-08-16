import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Music Generation Prompt Builder Hook
 * Encapsulates state management and localStorage persistence for music prompt builder
 */

export interface PromptBuilderState {
  description: string;
  genre: string;
  genres: string[];
  mood: string;
  tempo: number;
  duration: number;
  voice?: string;
  instruments: string[];
  key: string;
  scale: string;
  intensity: number;
  variants: number;
  quality: 'standard' | 'high' | 'ultra';
}

export interface SavedPrompt {
  id: string;
  name: string;
  timestamp: number;
  state: PromptBuilderState;
}

const INITIAL_STATE: PromptBuilderState = {
  description: '',
  genre: '',
  genres: [],
  mood: 'happy',
  tempo: 120,
  duration: 30,
  voice: undefined,
  instruments: [],
  key: 'C',
  scale: 'Major',
  intensity: 5,
  variants: 1,
  quality: 'standard',
};

const STORAGE_KEY = 'musicPromptBuilder';
const SAVED_PROMPTS_KEY = 'musicPromptBuilderSaved';

/**
 * Hook for managing music prompt builder state with localStorage persistence
 */
export function useMusicPromptBuilder(initialState?: Partial<PromptBuilderState>) {
  const [state, setState] = useState<PromptBuilderState>(() => {
    // Load from localStorage on init
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_STATE, ...JSON.parse(saved), ...initialState };
      }
    } catch (e) {
      console.error('Failed to load prompt from localStorage:', e);
    }
    return { ...INITIAL_STATE, ...initialState };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  // Load saved prompts on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_PROMPTS_KEY);
      if (saved) {
        setSavedPrompts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load saved prompts:', e);
    }
  }, []);

  // Auto-save to localStorage on state change
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save prompt to localStorage:', e);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [state]);

  // Update field
  const updateField = useCallback(<K extends keyof PromptBuilderState>(
    field: K,
    value: PromptBuilderState[K]
  ) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setError(null);
    setProgress(0);
  }, []);

  // Validate state
  const validate = useCallback((): string | null => {
    if (!state.description.trim()) {
      return 'Please enter a music description';
    }
    if (state.genres.length === 0) {
      return 'Please select at least one genre';
    }
    if (state.tempo < 40 || state.tempo > 200) {
      return 'Tempo must be between 40 and 200 BPM';
    }
    if (state.duration < 10 || state.duration > 120) {
      return 'Duration must be between 10 and 120 seconds';
    }
    return null;
  }, [state]);

  // Save current prompt
  const savePrompt = useCallback((name: string): SavedPrompt => {
    const prompt: SavedPrompt = {
      id: `prompt-${Date.now()}`,
      name,
      timestamp: Date.now(),
      state: { ...state },
    };

    setSavedPrompts(prev => {
      const updated = [prompt, ...prev];
      try {
        localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save prompt:', e);
      }
      return updated;
    });

    return prompt;
  }, [state]);

  // Load saved prompt
  const loadPrompt = useCallback((promptId: string) => {
    const prompt = savedPrompts.find(p => p.id === promptId);
    if (prompt) {
      setState(prompt.state);
      setError(null);
    } else {
      setError(`Prompt ${promptId} not found`);
    }
  }, [savedPrompts]);

  // Delete saved prompt
  const deletePrompt = useCallback((promptId: string) => {
    setSavedPrompts(prev => {
      const updated = prev.filter(p => p.id !== promptId);
      try {
        localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete prompt:', e);
      }
      return updated;
    });
  }, []);

  // Generate music
  const generate = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return { success: false, error: validationError };
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Calculate estimated time
      const qualityMultipliers = {
        standard: 45,
        high: 75,
        ultra: 120,
      };
      const estimatedDuration =
        qualityMultipliers[state.quality] +
        (state.duration / 30) * 20;
      setEta(estimatedDuration);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 25;
          if (next >= 95) clearInterval(progressInterval);
          return Math.min(next, 95);
        });
      }, 1000);

      // Make API request
      const response = await fetch('/api/suno/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'text-to-song',
          description: state.description,
          genres: state.genres,
          mood: state.mood,
          tempo: state.tempo,
          instruments: state.instruments,
          duration: state.duration,
          customVoiceId: state.voice,
          key: state.key,
          scale: state.scale,
          intensity: state.intensity,
          variants: state.variants,
          quality: state.quality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API error: ${response.statusText}`
        );
      }

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      return {
        success: true,
        data,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Generation error:', err);

      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [state, validate]);

  // Export current state
  const exportState = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  // Import state from JSON
  const importState = useCallback((json: string): boolean => {
    try {
      const imported = JSON.parse(json) as PromptBuilderState;
      // Validate imported state has required fields
      if (
        !imported.description ||
        !Array.isArray(imported.genres) ||
        typeof imported.mood !== 'string'
      ) {
        throw new Error('Invalid prompt format');
      }
      setState(imported);
      setError(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      setError(message);
      return false;
    }
  }, []);

  return {
    // State
    state,
    isLoading,
    progress,
    eta,
    error,
    savedPrompts,

    // State updates
    setState,
    updateField,
    reset,

    // Validation and generation
    validate,
    generate,

    // Prompt management
    savePrompt,
    loadPrompt,
    deletePrompt,

    // Import/export
    exportState,
    importState,
  };
}

export default useMusicPromptBuilder;
