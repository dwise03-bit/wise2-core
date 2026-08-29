export function computePeaks(buffer: AudioBuffer, buckets = 400): number[] {
  const data = buffer.getChannelData(0);
  const size = Math.max(1, Math.floor(data.length / buckets));
  const peaks: number[] = [];
  for (let i = 0; i < buckets; i++) {
    let max = 0;
    const start = i * size;
    const end = Math.min(data.length, start + size);
    for (let j = start; j < end; j++) {
      const v = Math.abs(data[j]);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  return peaks;
}

export function drawWaveform(
  canvas: HTMLCanvasElement,
  peaks: number[],
  color: string,
  progress = 0,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const mid = height / 2;
  const barW = width / Math.max(peaks.length, 1);
  peaks.forEach((peak, i) => {
    const h = Math.max(1, peak * (height - 2));
    ctx.fillStyle = i / peaks.length < progress ? color : `${color}99`;
    ctx.fillRect(i * barW, mid - h / 2, Math.max(1, barW - 0.4), h);
  });
}
