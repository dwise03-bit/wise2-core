import { useEffect, useRef, useState } from 'react';
import './camera.css';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Local-only webcam preview. Uses getUserMedia; no capture, no upload, no
 * frame processing. The track is released as soon as the panel closes or the
 * component unmounts. Shows a graceful message if the API is unavailable
 * (http:// non-loopback, denied permission, etc.).
 */
export function CameraPanel({ open, onOpenChange }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'live' | 'denied' | 'unsupported' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    setStatus('starting');
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 480 } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
        setStatus('live');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'NotAllowedError') {
          setStatus('denied');
        } else {
          setStatus('error');
          setErrorText(err instanceof Error ? err.message : 'camera-failed');
        }
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setStatus('idle');
    };
  }, [open]);

  if (!open) return null;

  return (
    <section className="camera-panel" aria-live="polite">
      <header>
        <div className="camera-title">CAMERA · LOCAL ONLY</div>
        <button className="camera-close" onClick={() => onOpenChange(false)} aria-label="Close camera">
          ✕
        </button>
      </header>
      <div className="camera-viewport">
        {status === 'live' && <video ref={videoRef} muted playsInline />}
        {status === 'starting' && <div className="camera-note">Starting…</div>}
        {status === 'denied' && <div className="camera-note">Permission denied. Allow camera for this origin and reopen.</div>}
        {status === 'unsupported' && <div className="camera-note">getUserMedia not available in this context.</div>}
        {status === 'error' && <div className="camera-note">Error: {errorText}</div>}
      </div>
      <p className="camera-hint">Preview is in-browser only. No frame is sent anywhere.</p>
    </section>
  );
}
