"""v1.6 edge-case and recovery tests."""
import unittest, tempfile, os, shutil
from pathlib import Path
from app import store, worker, engine

class V16EdgeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        store.set_db(Path(self.tmp.name) / 'jobs.sqlite3')
        self.data = Path(self.tmp.name) / 'data'
        self.data.mkdir()
        os.environ['WISE2_DATA_DIR'] = str(self.data)
        worker.DATA = self.data

    def tearDown(self):
        store.set_db(None)
        self.tmp.cleanup()

    def test_invalid_media_fails_clearly(self):
        job = 'badmedia1234'
        folder = self.data / job
        folder.mkdir()
        (folder / 'source.mp4').write_bytes(b'not a video')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        worker.process_one(job)
        final = store.get(job)
        self.assertIn(final['status'], ('failed', 'retry'))
        self.assertTrue(final.get('error') or final.get('message'))

    def test_short_video_handled(self):
        # Create a 3-second silent video
        job = 'shortvid12345'
        folder = self.data / job
        folder.mkdir()
        src = folder / 'source.mp4'
        import subprocess
        subprocess.run([
            'ffmpeg', '-y', '-v', 'error',
            '-f', 'lavfi', '-i', 'color=c=black:s=540x960:d=3',
            '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
            '-shortest', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac',
            str(src)
        ], check=True)
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0})
        worker.process_one(job)
        final = store.get(job)
        self.assertIn(final['status'], ('succeeded', 'failed'))
        if final['status'] == 'succeeded':
            self.assertTrue(final.get('clips') or final.get('highlight_candidates') is not None)

    def test_restart_recovery_marks_abandoned(self):
        job = 'abandoned123'
        store.save(job, {'job_id': job, 'status': 'running', 'heartbeat': 0, 'attempts': 1})
        recovered = store.mark_abandoned(max_age_seconds=0)
        self.assertIn(job, recovered)
        item = store.get(job)
        self.assertEqual(item['status'], 'interrupted')
        self.assertIn('Abandoned', item.get('error', ''))

    def test_duplicate_processing_guard(self):
        job = 'dupguard1234'
        folder = self.data / job
        folder.mkdir()
        store.save(job, {'job_id': job, 'status': 'running', 'attempts': 1})
        # Should return immediately without changing status
        worker.process_one(job)
        final = store.get(job)
        self.assertEqual(final['status'], 'running')

if __name__ == '__main__':
    unittest.main()
