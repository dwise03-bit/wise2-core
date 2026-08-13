'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { analytics } from '@/lib/analytics';
import { PROJECT_CATEGORIES } from '@/lib/wise-imp/knowledge';
import type { WiseImpAction } from '@/lib/wise-imp/actions';
import type { IntakeAnswer } from '@/lib/wise-imp/intake-mapping';

export type GlowColor = 'blue' | 'green' | 'magenta' | 'gold';
export type MascotState = 'idle' | 'wave' | 'thinking' | 'celebrate';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface IntakeState {
  active: boolean;
  mode: 'conversational' | 'form';
  categoryId: string | null;
  step: number;
  contactName: string;
  email: string;
  phone: string;
  businessName: string;
  answers: IntakeAnswer[];
  submitting: boolean;
  submitted: boolean;
  submitError: string | null;
}

interface State {
  open: boolean;
  glowColor: GlowColor;
  mascotState: MascotState;
  messages: ChatMessage[];
  conversationId: string;
  loading: boolean;
  aiUnavailable: boolean;
  pendingAction: WiseImpAction | null;
  intake: IntakeState;
  handoff: { active: boolean; summary: string } | null;
}

const GLOW_STORAGE_KEY = 'wise-imp-glow-color';

const initialIntake: IntakeState = {
  active: false,
  mode: 'conversational',
  categoryId: null,
  step: 0,
  contactName: '',
  email: '',
  phone: '',
  businessName: '',
  answers: [],
  submitting: false,
  submitted: false,
  submitError: null,
};

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readStoredGlow(): GlowColor {
  if (typeof window === 'undefined') return 'blue';
  const stored = window.localStorage.getItem(GLOW_STORAGE_KEY);
  return stored === 'blue' || stored === 'green' || stored === 'magenta' || stored === 'gold' ? stored : 'blue';
}

type Action =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_GLOW'; color: GlowColor }
  | { type: 'SET_MASCOT_STATE'; state: MascotState }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_AI_UNAVAILABLE'; unavailable: boolean }
  | { type: 'SET_PENDING_ACTION'; action: WiseImpAction | null }
  | { type: 'START_INTAKE'; categoryId?: string }
  | { type: 'SET_INTAKE_MODE'; mode: 'conversational' | 'form' }
  | { type: 'SET_INTAKE_FIELD'; field: 'contactName' | 'email' | 'phone' | 'businessName' | 'categoryId'; value: string }
  | { type: 'ADD_INTAKE_ANSWER'; answer: IntakeAnswer }
  | { type: 'INTAKE_BACK' }
  | { type: 'INTAKE_STEP'; step: number }
  | { type: 'INTAKE_SUBMIT_START' }
  | { type: 'INTAKE_SUBMIT_SUCCESS' }
  | { type: 'INTAKE_SUBMIT_ERROR'; error: string }
  | { type: 'RESET_INTAKE' }
  | { type: 'START_HANDOFF'; summary: string }
  | { type: 'CLEAR_HANDOFF' }
  | { type: 'CLEAR_CONVERSATION' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN':
      return { ...state, open: true };
    case 'CLOSE':
      return { ...state, open: false };
    case 'SET_GLOW':
      return { ...state, glowColor: action.color };
    case 'SET_MASCOT_STATE':
      return { ...state, mascotState: action.state };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_AI_UNAVAILABLE':
      return { ...state, aiUnavailable: action.unavailable };
    case 'SET_PENDING_ACTION':
      return { ...state, pendingAction: action.action };
    case 'START_INTAKE':
      return {
        ...state,
        intake: { ...initialIntake, active: true, categoryId: action.categoryId ?? null },
      };
    case 'SET_INTAKE_MODE':
      return { ...state, intake: { ...state.intake, mode: action.mode } };
    case 'SET_INTAKE_FIELD':
      return { ...state, intake: { ...state.intake, [action.field]: action.value } };
    case 'ADD_INTAKE_ANSWER':
      return {
        ...state,
        intake: { ...state.intake, answers: [...state.intake.answers, action.answer], step: state.intake.step + 1 },
      };
    case 'INTAKE_BACK':
      return {
        ...state,
        intake: {
          ...state.intake,
          step: Math.max(0, state.intake.step - 1),
          answers: state.intake.answers.slice(0, Math.max(0, state.intake.answers.length - 1)),
        },
      };
    case 'INTAKE_STEP':
      return { ...state, intake: { ...state.intake, step: action.step } };
    case 'INTAKE_SUBMIT_START':
      return { ...state, intake: { ...state.intake, submitting: true, submitError: null } };
    case 'INTAKE_SUBMIT_SUCCESS':
      return { ...state, intake: { ...state.intake, submitting: false, submitted: true } };
    case 'INTAKE_SUBMIT_ERROR':
      return { ...state, intake: { ...state.intake, submitting: false, submitError: action.error } };
    case 'RESET_INTAKE':
      return { ...state, intake: initialIntake };
    case 'START_HANDOFF':
      return { ...state, handoff: { active: true, summary: action.summary } };
    case 'CLEAR_HANDOFF':
      return { ...state, handoff: null };
    case 'CLEAR_CONVERSATION':
      return { ...state, messages: [], pendingAction: null, intake: initialIntake, handoff: null };
    default:
      return state;
  }
}

function initState(): State {
  return {
    open: false,
    glowColor: 'blue',
    mascotState: 'idle',
    messages: [],
    conversationId: makeId(),
    loading: false,
    aiUnavailable: false,
    pendingAction: null,
    intake: initialIntake,
    handoff: null,
  };
}

export function useWiseImpStore(pagePath: string) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const mascotResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Glow color is the one piece of state that should survive a full reload —
  // read/write localStorage directly rather than lifting to a global module
  // singleton, since WiseImp mounts once at the layout level and already
  // persists across client-side navigation on its own.
  useEffect(() => {
    dispatch({ type: 'SET_GLOW', color: readStoredGlow() });
  }, []);

  const setGlowColor = useCallback((color: GlowColor) => {
    dispatch({ type: 'SET_GLOW', color });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GLOW_STORAGE_KEY, color);
    }
    analytics.track('wise_imp_glow_color_selected', { color });
  }, []);

  const flashMascot = useCallback((mascotState: MascotState, durationMs = 2200) => {
    dispatch({ type: 'SET_MASCOT_STATE', state: mascotState });
    if (mascotResetTimer.current) clearTimeout(mascotResetTimer.current);
    mascotResetTimer.current = setTimeout(() => {
      dispatch({ type: 'SET_MASCOT_STATE', state: 'idle' });
    }, durationMs);
  }, []);

  const open = useCallback(() => {
    dispatch({ type: 'OPEN' });
    flashMascot('wave');
    analytics.track('wise_imp_widget_opened');
  }, [flashMascot]);

  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || state.loading) return;

      const userMessage: ChatMessage = { id: makeId(), role: 'user', content: trimmed, timestamp: Date.now() };
      dispatch({ type: 'ADD_MESSAGE', message: userMessage });
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_AI_UNAVAILABLE', unavailable: false });
      flashMascot('thinking', 60_000);

      try {
        const response = await fetch('/api/wise-imp/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            conversationId: state.conversationId,
            pagePath,
            messageHistory: state.messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (response.status === 503) {
          dispatch({ type: 'SET_AI_UNAVAILABLE', unavailable: true });
          analytics.track('wise_imp_error', { kind: 'ai_unavailable' });
          return;
        }
        if (!response.ok) {
          dispatch({ type: 'SET_AI_UNAVAILABLE', unavailable: true });
          analytics.track('wise_imp_error', { kind: 'chat_http_error', status: response.status });
          return;
        }

        const data: { reply: string; action: WiseImpAction | null; escalated: boolean } = await response.json();
        dispatch({
          type: 'ADD_MESSAGE',
          message: { id: makeId(), role: 'assistant', content: data.reply, timestamp: Date.now() },
        });
        if (data.action) {
          dispatch({ type: 'SET_PENDING_ACTION', action: data.action });
          if (data.action.type === 'open_intake' && data.action.params.category) {
            analytics.track('wise_imp_service_category_identified', { category: data.action.params.category });
          }
        }
        if (data.escalated) {
          analytics.track('wise_imp_human_help_requested', { via: 'chat' });
        }
        flashMascot('idle', 1);
      } catch {
        dispatch({ type: 'SET_AI_UNAVAILABLE', unavailable: true });
        analytics.track('wise_imp_error', { kind: 'network_error' });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },
    [state.loading, state.conversationId, state.messages, pagePath, flashMascot],
  );

  const dismissAction = useCallback(() => dispatch({ type: 'SET_PENDING_ACTION', action: null }), []);

  const confirmPendingAction = useCallback(
    (navigate: (path: string) => void, onOpenContact: () => void) => {
      const action = state.pendingAction;
      if (!action) return;
      dispatch({ type: 'SET_PENDING_ACTION', action: null });

      switch (action.type) {
        case 'navigate':
          navigate(action.params.path);
          break;
        case 'open_intake':
          dispatch({ type: 'START_INTAKE', categoryId: action.params.category });
          analytics.track('wise_imp_intake_started', { via: 'action', category: action.params.category });
          break;
        case 'open_contact':
          onOpenContact();
          break;
        case 'request_human_handoff':
          dispatch({ type: 'START_HANDOFF', summary: action.params.reason });
          analytics.track('wise_imp_human_help_requested', { via: 'action' });
          break;
      }
    },
    [state.pendingAction],
  );

  const startIntake = useCallback(
    (categoryId?: string) => {
      dispatch({ type: 'START_INTAKE', categoryId });
      analytics.track('wise_imp_intake_started', { via: 'manual', category: categoryId ?? null });
    },
    [],
  );

  const setIntakeMode = useCallback((mode: 'conversational' | 'form') => dispatch({ type: 'SET_INTAKE_MODE', mode }), []);

  const setIntakeField = useCallback(
    (field: 'contactName' | 'email' | 'phone' | 'businessName' | 'categoryId', value: string) =>
      dispatch({ type: 'SET_INTAKE_FIELD', field, value }),
    [],
  );

  const answerIntakeQuestion = useCallback((question: string, answer: string) => {
    dispatch({ type: 'ADD_INTAKE_ANSWER', answer: { question, answer } });
    analytics.track('wise_imp_intake_step_completed', { step: state.intake.step + 1 });
  }, [state.intake.step]);

  const intakeBack = useCallback(() => dispatch({ type: 'INTAKE_BACK' }), []);
  const setIntakeStep = useCallback((step: number) => dispatch({ type: 'INTAKE_STEP', step }), []);
  const resetIntake = useCallback(() => dispatch({ type: 'RESET_INTAKE' }), []);

  const submitIntake = useCallback(async (overrideAnswers?: IntakeAnswer[]) => {
    // overrideAnswers lets the plain-form fallback submit atomically — it
    // collects its free-text answer in local component state (not yet
    // dispatched into the store), and dispatching-then-immediately-reading
    // state.intake.answers here would race against React's batched update.
    const answers = overrideAnswers ?? state.intake.answers;
    dispatch({ type: 'INTAKE_SUBMIT_START' });
    try {
      const response = await fetch('/api/wise-imp/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: state.intake.categoryId,
          contactName: state.intake.contactName,
          email: state.intake.email,
          phone: state.intake.phone || undefined,
          businessName: state.intake.businessName || undefined,
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        dispatch({ type: 'INTAKE_SUBMIT_ERROR', error: data.error || 'Submission failed. Please try again.' });
        analytics.track('wise_imp_error', { kind: 'intake_submit_failed' });
        return;
      }

      dispatch({ type: 'INTAKE_SUBMIT_SUCCESS' });
      flashMascot('celebrate', 3000);
      analytics.track('wise_imp_intake_submitted', { category: state.intake.categoryId });
    } catch {
      dispatch({ type: 'INTAKE_SUBMIT_ERROR', error: 'Could not reach the server. Please try again.' });
      analytics.track('wise_imp_error', { kind: 'intake_network_error' });
    }
  }, [state.intake, flashMascot]);

  const clearHandoff = useCallback(() => dispatch({ type: 'CLEAR_HANDOFF' }), []);
  const clearConversation = useCallback(() => dispatch({ type: 'CLEAR_CONVERSATION' }), []);

  const currentCategory = useMemo(
    () => PROJECT_CATEGORIES.find((c) => c.id === state.intake.categoryId) ?? null,
    [state.intake.categoryId],
  );

  return {
    state,
    currentCategory,
    open,
    close,
    setGlowColor,
    sendMessage,
    dismissAction,
    confirmPendingAction,
    startIntake,
    setIntakeMode,
    setIntakeField,
    answerIntakeQuestion,
    intakeBack,
    setIntakeStep,
    resetIntake,
    submitIntake,
    clearHandoff,
    clearConversation,
  };
}
