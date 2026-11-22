/**
 * SoundLabs release gate. Fail closed: successful export != acceptable audio.
 * Input is an evidence manifest produced by the rendering pipeline.
 * Usage: node scripts/soundlabs-quality-gate.mjs path/to/evidence.json
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function auditSoundLabs(evidence) {
  const failures = [];
  const fail = (message) => failures.push(message);
  const mode = evidence?.requestedStatus;
  if (!['arrangement_demo', 'generated_song', 'release_master'].includes(mode)) fail('Unknown requested status');
  if (!evidence?.source?.sha256 || !/^[a-f0-9]{64}$/i.test(evidence.source.sha256)) fail('Missing immutable source SHA-256');
  if (!evidence?.source?.consentConfirmed) fail('Source voice authorization not documented');
  if (!Array.isArray(evidence?.outputs) || evidence.outputs.length === 0) fail('No output files');
  else for (const file of evidence.outputs) {
    if (!file.path || !file.sha256 || !/^[a-f0-9]{64}$/i.test(file.sha256) || file.bytes <= 0) fail('Output file missing path/hash/size');
  }
  if (!evidence?.metrics?.checked) fail('Audio metrics not measured');
  else {
    const m = evidence.metrics;
    if (!(m.durationSeconds > 0)) fail('Invalid duration');
    if (!(m.sampleRateHz >= 44100)) fail('Sample rate below delivery minimum');
    if (!(m.truePeakDbtp <= -1)) fail('True peak exceeds -1 dBTP');
    if (!(m.clippedSamples === 0)) fail('Clipping detected');
    if (!(m.longestUnexpectedSilenceSeconds <= 2)) fail('Unexpected silence');
  }
  if (mode === 'generated_song' || mode === 'release_master') {
    const p = evidence?.performance;
    if (!p || p.newVerseCount < 2 || p.newHookCount < 1) fail('No complete newly performed verses and hook');
    if (!p || !p.phraseProvenanceComplete) fail('Vocal phrase provenance missing');
    if (!p || p.repeatedSourceFraction > 0.25) fail('Excessive repeated source dialogue');
    if (!evidence?.arrangement?.musicalStructureVerified) fail('Song structure unverified');
    if (!evidence?.arrangement?.rhythmAlignmentVerified) fail('Vocal-to-beat alignment unverified');
  }
  if (mode === 'release_master') {
    const l = evidence?.listeningReview;
    if (!l?.reviewer || !l?.reviewedAt || l?.approved !== true) fail('Independent human listening approval required');
    if (!l?.originalVsProcessedCompared || !l?.introReviewed || !l?.artifactsReviewed) fail('Listening QA incomplete: A/B, intro, artifacts');
    if (!evidence?.deployment?.independentlyVerified) fail('Deployment not independently verified');
  }
  return { pass: failures.length === 0, failures, status: failures.length ? 'REJECTED' : mode };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = auditSoundLabs(JSON.parse(readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    if (!result.pass) process.exitCode = 1;
  } catch (error) {
    console.error('SoundLabs gate failed closed:', error.message);
    process.exitCode = 1;
  }
}
