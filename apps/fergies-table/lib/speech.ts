'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const NOVELTY =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph|princess|hysterical|pipe organ|grandma|grandpa|rocko|shelley|sandy|eddy|reed|flo)\b/i;

/** Soft, natural female voices. Premium/neural first so it does not sound like a default robot. */
const SOFT_NAMES = /\b(ava|allison|zoe|nicky|samantha|serena|karen|moira|tessa|victoria|susan)\b/;

let voiceCache: SpeechSynthesisVoice[] = [];

export function refreshSavoreVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const list = window.speechSynthesis.getVoices();
  if (list.length) voiceCache = list;
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (/premium|enhanced|neural|natural|siri/.test(n)) s += 160;
  if (/compact/.test(n)) s += 40;
  if (/microsoft.*online/.test(n)) s += 110;
  if (/^google /.test(n)) s += 95;
  if (/\bava\b/.test(n)) s += 120;
  else if (/\b(allison|zoe|nicky)\b/.test(n)) s += 110;
  else if (SOFT_NAMES.test(n)) s += 80;
  if (/\b(female|woman)\b/.test(n)) s += 18;
  if (v.localService === false) s += 24;
  if (v.lang === 'en-US') s += 30;
  else if (v.lang === 'en-AU') s += 16;
  else if (v.lang.startsWith('en')) s += 8;
  if (v.default) s += 2;
  if (NOVELTY.test(n)) s -= 500;
  return s;
}

export function pickSavoreVoice(list: SpeechSynthesisVoice[] = voiceCache): SpeechSynthesisVoice | null {
  const pool = (list.length ? list : voiceCache).filter((v) => v.lang.startsWith('en') && !NOVELTY.test(v.name));
  const ranked = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return ranked[0] ?? null;
}

export function speechify(input: string): string {
  return input
    .replace(/Savôré|Savore/gi, 'Sah voh ray')
    .replace(/WISE\s*²|WISE\s*2\b/gi, 'the house system')
    .replace(/Fergie'?s/gi, "Fergie's")
    .replace(/\$(\d[\d,]*)/g, '$1 dollars')
    .replace(/\b86\b/g, 'eighty-six')
    .replace(/&/g, ' and ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const SOFT_RATE = 1.12;
const SOFT_PITCH = 1.14;
const SOFT_VOLUME = 0.88;

/** Call from a tap so iOS WKWebView unlocks speech for the rest of the tour. */
export function unlockSavoreVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    refreshSavoreVoices();
    const synth = window.speechSynthesis;
    synth.cancel();
    const warm = new SpeechSynthesisUtterance(' ');
    warm.volume = 0;
    warm.rate = 2;
    synth.speak(warm);
  } catch {
    /* ignore */
  }
}

export function useSavoreSpeech() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAlive = useRef<ReturnType<typeof setInterval> | null>(null);
  const enabledRef = useRef(true);
  const endCb = useRef<(() => void) | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);
    refreshSavoreVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshSavoreVoices);
    const muted = localStorage.getItem('fergie-voice-muted') === 'true';
    setEnabled(!muted);
    enabledRef.current = !muted;
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshSavoreVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (keepAlive.current) {
      clearInterval(keepAlive.current);
      keepAlive.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    runId.current += 1;
    endCb.current = null;
    clear();
    setSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [clear]);

  const speak = useCallback(
    (raw: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }
      if (!enabledRef.current || !raw.trim()) {
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel();
      clear();
      const id = ++runId.current;
      endCb.current = onEnd ?? null;
      const text = speechify(raw);
      setSpeaking(true);

      keepAlive.current = setInterval(() => {
        if (synth.speaking && synth.paused) synth.resume();
      }, 8000);

      const finish = () => {
        if (id !== runId.current) return;
        clear();
        setSpeaking(false);
        const done = endCb.current;
        endCb.current = null;
        done?.();
      };

      refreshSavoreVoices();
      const voice = pickSavoreVoice(synth.getVoices());
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = SOFT_RATE;
      u.pitch = SOFT_PITCH;
      u.volume = SOFT_VOLUME;
      u.lang = voice?.lang ?? 'en-US';
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);

      const est = (text.length / 14) * 1000 * (1 / SOFT_RATE) + 4000;
      timer.current = setTimeout(() => {
        if (id !== runId.current) return;
        if (!synth.speaking) finish();
      }, est);
    },
    [clear],
  );

  const toggle = useCallback(() => {
    setEnabled((on) => {
      const next = !on;
      enabledRef.current = next;
      localStorage.setItem('fergie-voice-muted', next ? 'false' : 'true');
      if (!next) cancel();
      return next;
    });
  }, [cancel]);

  return { supported, speaking, enabled, speak, cancel, toggle };
}

/** Push-to-talk. Chrome, Edge, and some iOS WKWebView builds. Hide the mic if unsupported. */
export function useVoiceInput(onResult: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ start: () => void; stop: () => void; abort: () => void } | null>(null);
  const cbRef = useRef(onResult);

  useEffect(() => {
    cbRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor =
      (window as Window & { SpeechRecognition?: new () => { start: () => void; stop: () => void; abort: () => void } }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: new () => { start: () => void; stop: () => void; abort: () => void } })
        .webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);

    const rec = new Ctor() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      continuous: boolean;
      onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      start: () => void;
      stop: () => void;
      abort: () => void;
    };
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? '';
      if (text) cbRef.current(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;

    return () => {
      try {
        rec.abort();
      } catch {
        /* already torn down */
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already running */
    }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.stop();
    } catch {
      /* nothing running */
    }
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
