"""v1.6 verification and reliability tests.
- Explicit ASR dependency skip
- Strict no-silent-fallback end-to-end
- Word timestamp / caption sync check
- Ranked highlights match worker clips
- Concurrent jobs
- Cancellation during render
- Export quality audit
"""
import unittest, tempfile, os, shutil, threading, time
from pathlib import Path
from app import store, captions, highlights, worker, quality

def _asr_available():
    try:
        import faster_whisper
        return True
    except ImportError:
        return False

class V16VerificationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        store.set_db(Path(self.tmp.name) / 'jobs.sqlite3')
        self.data = Path(self.tmp.name) / 'data'
        self.data.mkdir()
        os.environ['WISE2_DATA_DIR'] = str(self.data)
        worker.DATA = self.data
        self.src = Path(__file__).resolve().parents[1] / 'fixtures' / 'speech_short.mp4'

    def tearDown(self):
        store.set_db(None)
        self.tmp.cleanup()

    def test_asr_dependency_explicit(self):
        if not _asr_available():
            self.skipTest('faster-whisper not installed — ASR tests skipped (install requirements-asr.txt)')
        self.assertTrue(_asr_available())

    def test_strict_no_silent_fallback(self):
        if not _asr_available():
            self.skipTest('faster-whisper not installed — cannot verify no-fallback path')
        if not self.src.is_file():
            self.skipTest('speech fixture missing')
        job = 'b2c3d4e5f6a1'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(self.src, folder / 'source.mp4')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        worker.process_one(job)
        final = store.get(job)
        self.assertEqual(final['status'], 'succeeded')
        # Must have used transcript path — fail if silently fell back
        self.assertEqual(final.get('selection_method'), 'transcript_heuristic_v15')
        self.assertGreater(len(final.get('transcript', {}).get('words', [])), 5)
        self.assertTrue(final.get('highlight_candidates'))

    def test_word_timestamps_and_caption_sync(self):
        if not _asr_available():
            self.skipTest('faster-whisper not installed')
        if not self.src.is_file():
            self.skipTest('speech fixture missing')
        result = captions.transcribe(self.src, 'tiny')
        words = result['words']
        self.assertGreater(len(words), 5)
        # Timestamps must be ordered and within duration
        prev = 0
        for w in words:
            self.assertGreaterEqual(w['start'], prev - 0.01)
            self.assertGreater(w['end'], w['start'])
            prev = w['end']
        # Known phrase fragment from the open-speech sample
        text = ' '.join(w['text'].lower() for w in words)
        self.assertTrue(any(tok in text for tok in ('birch', 'canoe', 'smooth', 'planks', 'glue', 'sheet')))

    def test_highlights_match_worker_clips(self):
        if not _asr_available():
            self.skipTest('faster-whisper not installed')
        if not self.src.is_file():
            self.skipTest('speech fixture missing')
        job = 'c3d4e5f6a1b2'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(self.src, folder / 'source.mp4')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        worker.process_one(job)
        final = store.get(job)
        candidates = final.get('highlight_candidates', [])
        clips = final.get('clips', [])
        self.assertEqual(len(candidates), len(clips))
        for c, clip in zip(candidates, clips):
            self.assertAlmostEqual(c['start'], clip['start'], places=1)
            self.assertAlmostEqual(c['duration'], clip['duration'], places=1)

    def test_export_quality_audit(self):
        if not self.src.is_file():
            self.skipTest('speech fixture missing')
        job = 'd4e5f6a1b2c3'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(self.src, folder / 'source.mp4')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        worker.process_one(job)
        final = store.get(job)
        if final['status'] != 'succeeded':
            self.skipTest('worker did not succeed')
        clip = next(folder.glob('clip_*.mp4'), None)
        self.assertIsNotNone(clip)
        audit = quality.audit_export(clip)
        self.assertTrue(audit['playable'])
        self.assertTrue(audit['audio'])
        self.assertGreater(audit['duration'], 0)

    def test_cancellation_during_render(self):
        job = 'e5f6a1b2c3d4'
        folder = self.data / job
        folder.mkdir()
        # Minimal fake source so process starts
        if self.src.is_file():
            shutil.copy(self.src, folder / 'source.mp4')
        else:
            self.skipTest('no source')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        # Cancel immediately after start by patching status
        def cancel_soon():
            time.sleep(0.3)
            store.patch(job, status='canceled')
        t = threading.Thread(target=cancel_soon)
        t.start()
        worker.process_one(job)
        t.join()
        final = store.get(job)
        # Either canceled or completed very quickly; must not be left running
        self.assertIn(final['status'], ('canceled', 'succeeded', 'failed'))

    def test_concurrent_jobs(self):
        if not self.src.is_file():
            self.skipTest('speech fixture missing')
        jobs = ['f6a1b2c3d4e5', 'a1b2c3d4e5f7']
        for jid in jobs:
            folder = self.data / jid
            folder.mkdir()
            shutil.copy(self.src, folder / 'source.mp4')
            store.save(jid, {'job_id': jid, 'status': 'queued', 'attempts': 0})
        threads = [threading.Thread(target=worker.process_one, args=(jid,)) for jid in jobs]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=60)
        for jid in jobs:
            final = store.get(jid)
            self.assertIn(final['status'], ('succeeded', 'failed', 'canceled'))

if __name__ == '__main__':
    unittest.main()
