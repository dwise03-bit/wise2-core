'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './volt-deck.module.css';

type Track = { title: string; src: string };
const TRACKS: Track[] = [
  { title: 'High Voltage', src: '/mathis/audio/high-voltage.wav' },
  { title: 'After Hours', src: '/mathis/audio/after-hours.wav' },
  { title: 'Power Grid', src: '/mathis/audio/power-grid.wav' },
  { title: 'Never Lose Power', src: '/mathis/audio/never-lose-power.wav' },
  { title: 'Powered by Purpose', src: '/mathis/audio/powered-by-purpose.wav' },
];
const SKINS = ['Industrial Classic', 'Living Grid', 'Millennium', 'Glass Circuit'] as const;
type Skin = (typeof SKINS)[number];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function VoltDeck() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [skin, setSkin] = useState<Skin>('Living Grid');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  async function play() {
    const audio = audioRef.current;
    if (!audio) return;
    setError('');
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError('Audio unavailable. The approved master must be uploaded and verified before playback.');
    }
  }

  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function chooseTrack(next: number) {
    pause();
    setIndex(next);
    setPosition(0);
    setDuration(0);
    setLoaded(false);
    setError('');
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = value;
    setPosition(value);
  }

  return (
    <section id="volt-deck" className={styles.deck} data-skin={skin.toLowerCase().replace(/\s+/g, '-')}>
      <div className={styles.heading}><p>THE SOUND OF MATHIS ELECTRIC</p><h2>VOLT DECK</h2><p>Five approved humanized masters. Playback requires verified production media.</p></div>
      <div className={styles.skins} aria-label="VOLT DECK appearance">
        {SKINS.map(name => <button type="button" key={name} aria-pressed={skin === name} onClick={() => setSkin(name)}>{name}</button>)}
      </div>
      <div className={styles.console}>
        <div className={styles.display} aria-live="polite"><span>NOW SELECTED · {String(index + 1).padStart(2, '0')} / 05</span><strong>{TRACKS[index].title}</strong><span>{loaded ? 'Audio ready' : 'Media verification pending'}</span></div>
        <audio
          key={TRACKS[index].src}
          ref={audioRef}
          src={TRACKS[index].src}
          preload="none"
          onLoadedMetadata={e => { setDuration(e.currentTarget.duration || 0); setLoaded(true); }}
          onTimeUpdate={e => setPosition(e.currentTarget.currentTime)}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onError={() => { setPlaying(false); setLoaded(false); setError('Approved audio file is not available at the production media path.'); }}
        />
        <div className={styles.transport}>
          <button type="button" onClick={() => chooseTrack((index + TRACKS.length - 1) % TRACKS.length)} aria-label="Previous track">◀◀</button>
          <button type="button" onClick={() => playing ? pause() : void play()} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={() => chooseTrack((index + 1) % TRACKS.length)} aria-label="Next track">▶▶</button>
        </div>
        <div className={styles.seek}><span>{formatTime(position)}</span><input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(position, duration || 1)} onChange={e => seek(Number(e.target.value))} aria-label="Seek playback position" disabled={!loaded}/><span>{formatTime(duration)}</span></div>
        <label className={styles.volume}>Volume <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(Number(e.target.value))}/></label>
        {error && <p role="status" className={styles.error}>{error}</p>}
      </div>
      <div className={styles.trackList} aria-label="Track selection">{TRACKS.map((track, i) => <button type="button" key={track.title} aria-pressed={i === index} onClick={() => chooseTrack(i)}><span>{String(i + 1).padStart(2, '0')}</span><strong>{track.title}</strong></button>)}</div>
      <p className={styles.pending}>Soulful Current: final humanized master pending. No original mixes are used.</p>
    </section>
  );
}
