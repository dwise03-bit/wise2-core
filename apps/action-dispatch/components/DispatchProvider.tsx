'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { buildDetail, commandMetrics, queryQueue } from '@/lib/conversations/queue';
import {
  buildReview,
  cancelDraft,
  confirmDraft,
  initialState,
  openDraft,
  setConversationStatus,
  type DispatchState,
} from '@/lib/store';
import type { ActionType, ConversationStatus, QueueFilter } from '@/lib/types';

type Desk = {
  state: DispatchState;
  queue: ReturnType<typeof queryQueue>;
  metrics: ReturnType<typeof commandMetrics>;
  selected: ReturnType<typeof buildDetail>;
  select: (id: string | null) => void;
  setFilter: (filter: QueueFilter) => void;
  setSearch: (search: string) => void;
  requestAction: (type: ActionType) => void;
  confirm: () => Promise<void>;
  cancel: () => void;
  complete: () => void;
  defer: () => void;
  toggleAudio: () => void;
};

const DeskContext = createContext<Desk | null>(null);

export function DispatchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DispatchState>(initialState);

  const value = useMemo<Desk>(() => {
    const rankedAll = queryQueue(state.catalog, 'all', '', state.clock);
    const queue = queryQueue(state.catalog, state.filter, state.search, state.clock);
    const selected = state.selectedId ? buildDetail(state.selectedId, state.catalog) : null;
    return {
      state,
      queue,
      metrics: commandMetrics(rankedAll),
      selected,
      select(id) {
        setState((current) => ({ ...current, selectedId: id, audioPlaying: false, audioProgress: 0 }));
      },
      setFilter(filter) {
        setState((current) => ({ ...current, filter }));
      },
      setSearch(search) {
        setState((current) => ({ ...current, search }));
      },
      requestAction(type) {
        setState((current) => {
          const detail = current.selectedId ? buildDetail(current.selectedId, current.catalog) : null;
          if (!detail) return current;
          const destination = type === 'text' || type === 'call' ? detail.customer.phone : detail.customer.email ?? detail.customer.phone;
          return openDraft(current, buildReview(detail.conversation, detail.customer.name, destination, type), destination);
        });
      },
      async confirm() {
        const next = await confirmDraft(state);
        setState(next);
      },
      cancel() {
        setState((current) => cancelDraft(current));
      },
      complete() {
        setState((current) =>
          current.selectedId ? setConversationStatus(current, current.selectedId, 'completed' as ConversationStatus) : current,
        );
      },
      defer() {
        setState((current) =>
          current.selectedId ? setConversationStatus(current, current.selectedId, 'deferred' as ConversationStatus) : current,
        );
      },
      toggleAudio() {
        setState((current) => ({
          ...current,
          audioPlaying: !current.audioPlaying,
          audioProgress: current.audioPlaying ? current.audioProgress : Math.min(1, current.audioProgress + 0.12),
        }));
      },
    };
  }, [state]);

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk(): Desk {
  const value = useContext(DeskContext);
  if (!value) throw new Error('useDesk must be used inside DispatchProvider');
  return value;
}
