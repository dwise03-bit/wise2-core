"""v1.5 integration: speech fixture → transcribe → rank → render with captions."""
import unittest, tempfile, os, shutil
from pathlib import Path
from app import store, captions, highlights, engine, worker

class V15IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        store.set_db(Path(self.tmp.name) / 'jobs.sqlite3')
        self.data = Path(self.tmp.name) / 'data'
        self.data.mkdir()
        os.environ['WISE2_DATA_DIR'] = str(self.data)
        # Point worker DATA at our temp
        worker.DATA = self.data

    def tearDown(self):
        store.set_db(None)
        self.tmp.cleanup()

    def test_transcribe_real_speech(self):
        # v1.7: this AI test used to fail collection-style when the optional package
        # was missing. It now skips with an explicit reason and still runs for real
        # when faster-whisper is installed.
        try:
            import faster_whisper  # noqa: F401
        except ImportError:
            self.skipTest('faster-whisper not installed — ASR tests skipped (install requirements-asr.txt)')
        src = Path(__file__).resolve().parents[1] / 'fixtures' / 'speech_short.mp4'
        if not src.is_file():
            self.skipTest('speech fixture missing')
        result = captions.transcribe(src, 'tiny')
        self.assertIn('words', result)
        self.assertGreater(len(result['words']), 5)
        self.assertEqual(result['engine'], 'faster-whisper')
        self.assertIn(result['language'], ('en', 'und'))

    def test_worker_pipeline_with_speech(self):
        src = Path(__file__).resolve().parents[1] / 'fixtures' / 'speech_short.mp4'
        if not src.is_file():
            self.skipTest('speech fixture missing')
        job = 'a1b2c3d4e5f6'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(src, folder / 'source.mp4')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        worker.process_one(job)
        final = store.get(job)
        self.assertEqual(final['status'], 'succeeded')
        self.assertGreater(final.get('progress', 0), 90)
        self.assertTrue((folder / 'clips.zip').is_file() or (folder / 'manifest.json').is_file())
        # At least one clip should exist
        clips = list(folder.glob('clip_*.mp4'))
        self.assertGreater(len(clips), 0)
        # If transcript succeeded, captioned output or srt should exist
        if final.get('transcript', {}).get('words'):
            self.assertTrue(any(folder.glob('clip_*.srt')) or any(folder.glob('*_captioned.mp4')))

if __name__ == '__main__':
    unittest.main()
