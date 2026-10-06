import { useEffect, useRef, useState } from 'react';

/**
 * Thin wrapper over the Web Speech API. Chrome/Edge expose
 * `webkitSpeechRecognition`; the standard `SpeechRecognition` is still absent
 * from Firefox at writing time. We feature-detect and return `supported:false`
 * so the UI can show a graceful message instead of crashing.
 */

type RecognitionConstructor = new () => RecognitionLike;

interface RecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface RecognitionEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
}

const RecognitionCtor =
  typeof window !== 'undefined'
    ? ((window as SpeechWindow).SpeechRecognition ??
       (window as SpeechWindow).webkitSpeechRecognition ??
       null)
    : null;

export interface UseSpeechRecognitionOptions {
  onFinalPhrase?: (phrase: string) => void;
  lang?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const onFinal = useRef(options.onFinalPhrase);
  onFinal.current = options.onFinalPhrase;

  const supported = RecognitionCtor !== null;

  useEffect(() => {
    if (!supported) return;
    const recognition = new (RecognitionCtor as RecognitionConstructor)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.lang ?? 'en-US';

    recognition.onresult = (event: RecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const chunk = result[0]?.transcript ?? '';
        if (result.isFinal) final += chunk;
        else interim += chunk;
      }
      setTranscript(interim || final);
      if (final && onFinal.current) onFinal.current(final.trim());
    };
    recognition.onerror = (event) => {
      const anyEvent = event as unknown as { error?: string };
      setError(anyEvent.error ?? 'speech-error');
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [options.lang, supported]);

  const start = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'start-failed');
    }
  };
  const stop = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };

  return { supported, listening, transcript, error, start, stop };
}
