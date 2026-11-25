import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSoundLabs } from './soundlabs-quality-gate.mjs';

const hash = 'a'.repeat(64);
function valid() {
  return {
    requestedStatus:'release_master',
    source:{sha256:hash,consentConfirmed:true},
    outputs:[{path:'master.wav',sha256:hash,bytes:1000}],
    metrics:{checked:true,durationSeconds:160,sampleRateHz:48000,truePeakDbtp:-1.2,clippedSamples:0,longestUnexpectedSilenceSeconds:0.5},
    performance:{newVerseCount:2,newHookCount:1,phraseProvenanceComplete:true,repeatedSourceFraction:0.1},
    arrangement:{musicalStructureVerified:true,rhythmAlignmentVerified:true},
    listeningReview:{reviewer:'independent-reviewer',reviewedAt:'2026-11-22',approved:true,originalVsProcessedCompared:true,introReviewed:true,artifactsReviewed:true},
    deployment:{independentlyVerified:true}
  };
}
test('rejects the V4 spoken-freestyle loop posing as a song',()=>{
  const x=valid(); x.performance.newVerseCount=0; x.performance.newHookCount=0; x.performance.repeatedSourceFraction=0.8;
  const r=auditSoundLabs(x); assert.equal(r.pass,false); assert.match(r.failures.join(' '),/newly performed/);
});
test('rejects masters without actual listening review',()=>{
  const x=valid(); x.listeningReview.approved=false;
  assert.equal(auditSoundLabs(x).pass,false);
});
test('rejects a clipped master',()=>{
  const x=valid(); x.metrics.clippedSamples=2;
  assert.equal(auditSoundLabs(x).pass,false);
});
test('accepts evidence-complete master manifest',()=>assert.equal(auditSoundLabs(valid()).pass,true));
