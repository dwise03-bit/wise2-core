#!/usr/bin/env node
/**
 * Pre-render the guide narration to audio files.
 *
 * Why: the browser's speech synthesis sounds different on every machine and
 * depends on which voices the viewer happens to have installed. Shipping audio
 * makes the demo sound identical everywhere, including on a laptop with no
 * network and no premium voices.
 *
 * Usage:
 *   node scripts/render-narration.mjs                   # edge: free neural voices, no API key
 *   node scripts/render-narration.mjs --provider=local   # macOS `say`, fully offline
 *   node scripts/render-narration.mjs --provider=openai  # OpenAI TTS (needs OPENAI_API_KEY)
 *
 * `edge` is the default: it uses the same Microsoft neural voices Edge's
 * read-aloud uses. They are free and need no key, but the request does leave
 * the machine — only the narration copy in lib/data/narration.json is sent.
 * Use --provider=local if the render must stay entirely offline.
 *
 * Options:
 *   --voice=<name>   edge:   en-US-AndrewNeural | en-US-BrianNeural | en-US-AvaNeural | …
 *                    local:  a `say` voice (default Samantha)
 *                    openai: alloy|ash|ballad|coral|echo|fable|nova|onyx|sage|shimmer
 *   --model=<id>     openai model (default gpt-4o-mini-tts)
 *   --rate=<wpm>     local speaking rate (default 172)
 *   --edge-rate=<%>  edge speed trim (default -4%)
 *   --only=<id,id>   render a subset
 *   --force          re-render tracks that already exist
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'audio');
const SCRIPTS = path.join(ROOT, 'lib', 'data', 'narration.json');

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};
const flag = (name) => process.argv.includes(`--${name}`);

const provider = arg('provider', 'edge');
const only = arg('only', '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const force = flag('force');

/** The delivery direction — used by providers that accept style guidance. */
const STYLE =
  'Speak like a confident, warm business consultant walking a small business owner ' +
  'through their own software for the first time. Conversational and unhurried, with ' +
  'natural emphasis and real pauses between thoughts. Never salesy, never robotic.';

/** Post-process to mono 64k with matched loudness across every track. */
async function normalize(inPath, outPath) {
  await run('ffmpeg', [
    '-y',
    '-loglevel', 'error',
    '-i', inPath,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-ac', '1',
    '-ar', '24000',
    '-codec:a', 'libmp3lame',
    '-b:a', '64k',
    outPath,
  ]);
  await run('rm', ['-f', inPath]);
}

/**
 * Free Microsoft neural voices via edge-tts, run through uvx so nothing is
 * installed globally. No API key and no account required.
 */
async function renderEdge(text, outPath, voice, edgeRate, edgePitch) {
  const raw = outPath.replace(/\.mp3$/, '.raw.mp3');
  await run(
    'uvx',
    // --rate/--pitch must use the = form; a leading "-" is otherwise parsed as a flag.
    [
      'edge-tts',
      '--voice', voice,
      `--rate=${edgeRate}`,
      `--pitch=${edgePitch}`,
      '--text', text,
      '--write-media', raw,
    ],
    { maxBuffer: 1024 * 1024 * 32 },
  );
  await normalize(raw, outPath);
}

/** Voices worth auditioning for a warmer, smoother read. */
const CANDIDATES = [
  ['ava', 'en-US-AvaMultilingualNeural', '-6%', '-4Hz'],
  ['aria', 'en-US-AriaNeural', '-6%', '-6Hz'],
  ['jenny', 'en-US-JennyNeural', '-6%', '-4Hz'],
  ['sonia-uk', 'en-GB-SoniaNeural', '-6%', '-4Hz'],
  ['brian', 'en-US-BrianNeural', '-6%', '-8Hz'],
  ['christopher', 'en-US-ChristopherNeural', '-8%', '-10Hz'],
  ['ryan-uk', 'en-GB-RyanNeural', '-6%', '-8Hz'],
];

const SAMPLE_TEXT =
  "Welcome to the Get Down command center. I'm your guide, and I'll walk you through this in " +
  'about six minutes. This is the health of your whole business, on one screen.';

/** Render the same line across every candidate so a human can pick by ear. */
async function renderSamples(outDir) {
  await mkdir(outDir, { recursive: true });
  console.log(`Auditioning ${CANDIDATES.length} voices → ${outDir}\n`);
  for (const [label, voice, rate, pitch] of CANDIDATES) {
    const out = path.join(outDir, `voice-${label}.mp3`);
    try {
      await renderEdge(SAMPLE_TEXT, out, voice, rate, pitch);
      console.log(`  ✓ ${label.padEnd(12)} ${voice}`);
    } catch (err) {
      console.error(`  ✗ ${label.padEnd(12)} ${err.message.slice(0, 120)}`);
    }
  }
}

async function renderLocal(text, outPath, voice, rate) {
  const aiff = outPath.replace(/\.mp3$/, '.aiff');
  await run('say', ['-v', voice, '-r', String(rate), '-o', aiff, text]);
  await normalize(aiff, outPath);
}

async function renderOpenAI(text, outPath, voice, model) {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.length < 20 || key.startsWith('__')) {
    throw new Error('OPENAI_API_KEY is missing or a placeholder. Export a real key and retry.');
  }
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      instructions: STYLE,
      response_format: 'mp3',
      speed: 0.96,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
}

const main = async () => {
  if (flag('samples')) {
    await renderSamples(arg('out', path.join(ROOT, '..', '..', 'voice-samples')));
    return;
  }

  const scripts = JSON.parse(await readFile(SCRIPTS, 'utf8'));
  await mkdir(OUT_DIR, { recursive: true });

  const defaultVoice =
    provider === 'openai'
      ? 'ash'
      : provider === 'edge'
        ? 'en-US-AvaMultilingualNeural'
        : 'Samantha';
  const voice = arg('voice', defaultVoice);
  const model = arg('model', 'gpt-4o-mini-tts');
  const rate = Number(arg('rate', '172'));
  const edgeRate = arg('edge-rate', '-6%');
  const edgePitch = arg('edge-pitch', '-4Hz');

  const ids = Object.keys(scripts).filter((id) => !only.length || only.includes(id));
  console.log(`Rendering ${ids.length} tracks via ${provider} (voice: ${voice})\n`);

  const manifest = {};
  let rendered = 0;
  let skipped = 0;

  for (const id of ids) {
    const outPath = path.join(OUT_DIR, `${id}.mp3`);
    const rel = `/audio/${id}.mp3`;

    if (!force) {
      try {
        const s = await stat(outPath);
        if (s.size > 1000) {
          manifest[id] = rel;
          skipped++;
          console.log(`  · ${id.padEnd(11)} exists, skipping (${(s.size / 1024).toFixed(0)} KB)`);
          continue;
        }
      } catch {
        /* not rendered yet */
      }
    }

    const text = scripts[id];
    try {
      if (provider === 'openai') await renderOpenAI(text, outPath, voice, model);
      else if (provider === 'edge') await renderEdge(text, outPath, voice, edgeRate, edgePitch);
      else await renderLocal(text, outPath, voice, rate);
      const s = await stat(outPath);
      manifest[id] = rel;
      rendered++;
      console.log(`  ✓ ${id.padEnd(11)} ${(s.size / 1024).toFixed(0)} KB  (${text.length} chars)`);
    } catch (err) {
      console.error(`  ✗ ${id.padEnd(11)} ${err.message}`);
    }
  }

  await writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ provider, voice, generatedFrom: 'lib/data/narration.json', tracks: manifest }, null, 2),
  );

  console.log(`\n${rendered} rendered, ${skipped} skipped → public/audio/`);
  console.log('Manifest: public/audio/manifest.json');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
