export type CaptureType = 'camera' | 'screen';

export type RecordingStatus =
  | 'READY'
  | 'REQUESTING_PERMISSION'
  | 'RECORDING'
  | 'SAVING'
  | 'SAVED'
  | 'ERROR';

export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  duration: number;
  captureType: CaptureType;
  startedAt: string;
  stoppedAt: string;
}

export interface GalleryUploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  assetType: string;
  storagePath: string;
  url: string;
  userId: string;
  sourceModule: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function pickMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return 'video/webm';
}

export async function requestCapture(type: CaptureType): Promise<MediaStream> {
  if (type === 'screen') {
    return navigator.mediaDevices.getDisplayMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: true,
    });
  }
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    audio: true,
  });
}

export function createRecorder(
  stream: MediaStream,
  onChunk: (chunk: Blob) => void,
): MediaRecorder {
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
    audioBitsPerSecond: 128_000,
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) onChunk(e.data);
  };
  return recorder;
}

export function stopAllTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => t.stop());
}

export function assembleBlob(chunks: Blob[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType });
}

export async function uploadToGallery(
  blob: Blob,
  token: string,
  apiUrl: string,
  metadata: {
    captureType: CaptureType;
    duration: number;
    startedAt: string;
    stoppedAt: string;
  },
): Promise<GalleryUploadResult> {
  const ext = blob.type.includes('webm') ? 'webm' : 'mp4';
  const filename = `recording-${Date.now()}.${ext}`;

  const form = new FormData();
  form.append('file', blob, filename);
  form.append('sourceModule', 'live-studio');
  form.append(
    'metadata',
    JSON.stringify({
      captureType: metadata.captureType,
      duration: metadata.duration,
      mimeType: blob.type,
      startedAt: metadata.startedAt,
      stoppedAt: metadata.stoppedAt,
    }),
  );

  const res = await fetch(`${apiUrl}/v1/gallery/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gallery upload failed (${res.status}): ${text}`);
  }

  return res.json();
}
