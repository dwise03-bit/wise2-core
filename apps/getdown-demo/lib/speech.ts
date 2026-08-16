'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Voice for the demo guide.
 *
 * Uses the browser's built-in Web Speech API — no cloud service, no API key, no
 * audio leaves the machine. That keeps the owner demo self-contained and means
 * it still works on a laptop with no network at a kitchen table.
 *
 * Naturalness comes from three things here, not from a better engine:
 *   1. picking the best voice the machine actually has installed,
 *   2. normalising text the synthesiser would otherwise mangle, and
 *   3. speaking sentence by sentence with real pauses between them.
 */

/** Novelty and robotic system voices that must never narrate a client demo. */
const NOVELTY =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph|princess|hysterical|pipe organ|grandma|grandpa|rocko|shelley|sandy|eddy|reed|flo)\b/i;

/** Higher is better. Premium/neural voices first, then known-good system voices. */
function scoreVoice(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;

  // Apple "Premium"/"Enhanced" and Microsoft "Natural" voices are dramatically
  // better than the default compact ones.
  if (/premium|enhanced|neural|natural/.test(n)) s += 120;
  if (/microsoft.*online/.test(n)) s += 90;
  if (/^google /.test(n)) s += 70;
  if (/\b(ava|allison|samantha|zoe|evan|nathan|joelle|tom|alex|daniel|serena)\b/.test(n)) s += 45;

  // Network-backed voices are usually higher fidelity than local compact ones.
  if (v.localService === false) s += 20;

  if (v.lang === 'en-US') s += 25;
  else if (v.lang === 'en-GB' || v.lang === 'en-AU') s += 12;
  else if (v.lang.startsWith('en')) s += 6;

  if (v.default) s += 5;
  if (NOVELTY.test(n)) s -= 500;

  return s;
}

export function rankVoices(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return list
    .filter((v) => v.lang.startsWith('en') && !NOVELTY.test(v.name))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

/**
 * Rewrite text into something a synthesiser reads correctly.
 * Speech engines mangle brand marks, unit abbreviations, and business acronyms.
 */
export function speechify(input: string): string {
  return (
    input
      .replace(/WISE\s*²|WISE\s*2\b/gi, 'Wise squared')
      .replace(/\bCOIs\b/g, 'certificates of insurance')
      .replace(/\bCOI\b/g, 'certificate of insurance')
      .replace(/\bMTD\b/g, 'month to date')
      .replace(/\bYTD\b/g, 'year to date')
      .replace(/\bACV\b/g, 'annual contract value')
      .replace(/\bMRR\b/g, 'monthly recurring revenue')
      .replace(/\bHOAs\b/g, 'H O As')
      .replace(/\bHOA\b/g, 'H O A')
      .replace(/\bPM\b/g, 'property manager')
      .replace(/\bsq ft\b/gi, 'square feet')
      .replace(/\blf\b/g, 'linear feet')
      .replace(/(\d)\s*h\b/g, '$1 hours')
      .replace(/(\d)\s*d\b/g, '$1 days')
      .replace(/\bGBP\b/g, 'Google Business Profile')
      .replace(/\bQ([1-4])\b/g, 'quarter $1')
      .replace(/&/g, ' and ')
      // Remove the fictional-entity marker so it is never read aloud.
      .replace(/\*(?=[A-Z])/g, '')
      // Dashes and slashes become natural pauses rather than spoken characters.
      .replace(/\s+[—–]\s+/g, ', ')
      .replace(/(\w)\/(\w)/g, '$1 or $2')
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

interface Chunk {
  text: string;
  pause: number;
}

/**
 * Split narration into sentences and assign a human pause after each one.
 * Chunking also dodges the long-utterance truncation bug in Chrome.
 */
export function chunkForSpeech(text: string): Chunk[] {
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];

  return sentences.map((s, i) => {
    const last = i === sentences.length - 1;
    let pause = 260; // a beat between sentences
    if (/[?]$/.test(s)) pause = 380; // questions hang slightly longer
    else if (/[!]$/.test(s)) pause = 320;
    else if (s.length < 40) pause = 200; // short punchy lines run on
    if (last) pause = 0;
    return { text: s, pause };
  });
}

/**
 * Pre-rendered narration. Shipping audio means the guide sounds identical on
 * every machine instead of depending on whichever voices the viewer happens to
 * have installed. Live synthesis stays as the fallback and still handles the
 * assistant's dynamic answers, which cannot be rendered ahead of time.
 */
const TRACK = (id: string) => `/audio/${id}.mp3`;

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>('');
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(0.96);
  const [pitch, setPitch] = useState(1.02);

  const enabledRef = useRef(enabled);
  const rateRef = useRef(rate);
  const pitchRef = useRef(pitch);
  const voiceRef = useRef(voiceName);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [usingTracks, setUsingTracks] = useState(true);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);
  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);
  useEffect(() => {
    voiceRef.current = voiceName;
  }, [voiceName]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);

    const load = () => {
      const ranked = rankVoices(window.speechSynthesis.getVoices());
      if (!ranked.length) return;
      setVoices(ranked);
      // Best available voice wins unless the presenter has chosen one.
      setVoiceName((current) => (current ? current : ranked[0].name));
    };

    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    runIdRef.current += 1; // invalidate any in-flight chain
    clearTimers();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const speak = useCallback(
    (raw: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!enabledRef.current || !raw.trim()) return;

      const synth = window.speechSynthesis;
      synth.cancel();
      clearTimers();

      const runId = ++runIdRef.current;
      const chunks = chunkForSpeech(speechify(raw));
      setSpeaking(true);

      // Chrome silently suspends synthesis on long reads; a periodic resume
      // keeps the queue moving.
      keepAliveRef.current = setInterval(() => {
        if (synth.speaking && !synth.paused) synth.resume();
      }, 8000);

      let i = 0;
      const sayNext = () => {
        if (runId !== runIdRef.current) return; // superseded by a newer request
        if (i >= chunks.length) {
          clearTimers();
          setSpeaking(false);
          return;
        }
        const chunk = chunks[i++];
        const u = new SpeechSynthesisUtterance(chunk.text);
        const v = synth.getVoices().find((x) => x.name === voiceRef.current);
        if (v) u.voice = v;
        u.rate = rateRef.current;
        u.pitch = pitchRef.current;
        u.volume = 1;

        const advance = () => {
          if (runId !== runIdRef.current) return;
          timerRef.current = setTimeout(sayNext, chunk.pause);
        };
        u.onend = advance;
        u.onerror = advance;

        synth.speak(u);

        // If the engine never fires onend (no installed voices, or a dropped
        // event), fall forward so the guide cannot get stuck mid-script.
        const est = (chunk.text.length / 12) * 1000 * (1 / rateRef.current) + 3500;
        timerRef.current = setTimeout(() => {
          if (runId !== runIdRef.current) return;
          if (!synth.speaking) sayNext();
          else timerRef.current = setTimeout(sayNext, 1200);
        }, est);
      };

      sayNext();
    },
    [clearTimers],
  );

  /**
   * Play the pre-rendered track for `id`, falling back to live synthesis of
   * `fallbackText` if the file is missing or the browser refuses to play it.
   */
  const speakTrack = useCallback(
    (id: string, fallbackText: string) => {
      if (!enabledRef.current) return;
      if (typeof window === 'undefined') {
        return;
      }

      runIdRef.current += 1;
      const runId = runIdRef.current;

      clearTimers();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(TRACK(id));
      audio.preload = 'auto';
      audioRef.current = audio;
      setSpeaking(true);

      const fallback = () => {
        if (runId !== runIdRef.current) return;
        audioRef.current = null;
        setUsingTracks(false);
        speak(fallbackText);
      };

      audio.onended = () => {
        if (runId !== runIdRef.current) return;
        audioRef.current = null;
        setSpeaking(false);
      };
      audio.onerror = fallback;

      audio.play().then(
        () => {
          if (runId === runIdRef.current) setUsingTracks(true);
        },
        () => {
          // Autoplay blocked or decode failure — live synthesis still works
          // because it was unlocked by the same click that got us here.
          fallback();
        },
      );
    },
    [clearTimers, speak],
  );

  const toggleEnabled = useCallback(() => {
    setEnabled((e) => {
      if (e) cancel();
      return !e;
    });
  }, [cancel]);

  return {
    supported,
    voices,
    voiceName,
    setVoiceName,
    speaking,
    speak,
    speakTrack,
    usingTracks,
    cancel,
    enabled,
    setEnabled,
    toggleEnabled,
    rate,
    setRate,
    pitch,
    setPitch,
  };
}

/** Push-to-talk voice input. Chrome/Edge only; callers must degrade gracefully. */
export function useVoiceInput(onResult: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const cbRef = useRef(onResult);

  useEffect(() => {
    cbRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? '';
      if (text) cbRef.current(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;

    return () => {
      try {
        rec.abort();
      } catch {
        /* recognition already torn down */
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      // start() throws if a session is already running — ignore.
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
