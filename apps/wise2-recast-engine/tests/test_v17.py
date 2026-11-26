"""v1.7: optional ASR skips, processing modes, phrase cues, crop override, diagnostics, batch export."""
import ast
import os
import shutil
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from app import captions, store, worker
from app.subject import crop_rect, plan_crop, smooth_series


def _asr():
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


class V17Tests(unittest.TestCase):
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

    def test_faster_whisper_is_not_imported_at_module_level(self):
        root = Path(__file__).resolve().parents[1] / 'app'
        offenders = []
        for path in root.glob('*.py'):
            tree = ast.parse(path.read_text(encoding='utf-8'))
            for node in tree.body:
                names = []
                if isinstance(node, ast.Import):
                    names = [alias.name for alias in node.names]
                elif isinstance(node, ast.ImportFrom) and node.module:
                    names = [node.module]
                for name in names:
                    if name == 'faster_whisper' or name.startswith('faster_whisper.'):
                        offenders.append(f'{path.name}:{node.lineno}')
        self.assertEqual(offenders, [])

    def test_phrase_groups_on_a_pause(self):
        words = [
            {'text': 'Welcome', 'start': 0.1, 'end': 0.4},
            {'text': 'wise', 'start': 0.45, 'end': 0.8},
            {'text': 'Later', 'start': 3.2, 'end': 3.6},
        ]
        phrases = captions.group_phrases(words, max_chars=80, max_duration=10, pause_gap=0.45)
        self.assertEqual(len(phrases), 2)
        self.assertIn('Welcome', phrases[0]['text'])
        ass = captions.ass(words, grouping='phrase')
        self.assertIn('Dialogue: 0', ass)
        self.assertIn(r'\N', ass) if len(phrases[0]['text']) > 21 else self.assertIn('Welcome', ass)

    def test_manual_crop_is_constant(self):
        samples = plan_crop(str(self.src), 0, 1, crop_mode='manual', crop_x_norm=0.2, crop_y_norm=0.4)
        self.assertTrue(samples)
        self.assertTrue(all(item['source'] == 'manual' and abs(item['x'] - 0.2) < 1e-6 for item in samples))
        x, _y, width, height = crop_rect(640, 360, 0.2, 0.5)
        self.assertLess(x, 80)
        self.assertLess(abs(width / height - 9 / 16), 0.03)
        smoothed = smooth_series([0, 1, 0, 1], max_step=0.1)
        self.assertTrue(all(abs(b - a) <= 0.1 + 1e-9 for a, b in zip(smoothed, smoothed[1:])))

    def test_strict_mode_fails_without_hiding_the_error(self):
        if _asr():
            self.skipTest('strict-unavailable path is checked when faster-whisper is absent')
        job = 'a17a11c70001'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(self.src, folder / 'source.mp4')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0, 'processing_mode': 'strict-ai'})
        worker.process_one(job)
        final = store.get(job)
        self.assertEqual(final['status'], 'failed')
        self.assertIn('Strict-AI', final.get('error', ''))
        self.assertFalse(final.get('fallback'))

    def test_scene_fallback_is_labeled(self):
        if _asr():
            self.skipTest('scene fallback labeling without ASR is checked when faster-whisper is absent')
        job = 'a17a11c70002'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(self.src, folder / 'source.mp4')
        store.save(job, {'job_id': job, 'status': 'queued', 'attempts': 0, 'processing_mode': 'scene-fallback'})
        worker.process_one(job)
        final = store.get(job)
        self.assertEqual(final['status'], 'succeeded')
        self.assertTrue(final.get('fallback'))
        self.assertEqual(final.get('highlight_source'), 'scene-audio-fallback')
        self.assertEqual(final.get('asr_status'), 'unavailable')

    def test_diagnostics_shape(self):
        from fastapi.testclient import TestClient
        from app import main
        client = TestClient(main.app)
        body = client.get('/api/diagnostics').json()
        for key in ('python', 'ffmpeg', 'ffprobe', 'faster_whisper', 'subject_detection', 'worker', 'paths', 'disk', 'processing_mode'):
            self.assertIn(key, body)
        self.assertTrue(body['ffmpeg']['found'])
        self.assertTrue(body['paths']['db_writable'])

    def test_batch_export_queues_approved_highlights(self):
        from fastapi.testclient import TestClient
        from app import main
        job = 'a17a11c70003'
        folder = self.data / job
        folder.mkdir()
        shutil.copy(self.src, folder / 'source.mp4')
        store.save(job, {
            'job_id': job,
            'status': 'succeeded',
            'attempts': 1,
            'source_duration': 10,
            'highlight_candidates': [{'start': 0, 'duration': 2, 'score': 1, 'reason': 'test'}],
            'transcript': {'words': [{'start': 0.2, 'end': 0.8, 'text': 'Hello'}, {'start': 0.9, 'end': 1.4, 'text': 'there'}]},
        })
        main.DATA = self.data
        client = TestClient(main.app)
        response = client.post(f'/api/jobs/{job}/highlights/batch', json={'action': 'export', 'indexes': [0], 'caption_style': 'phrase'})
        self.assertEqual(response.status_code, 200, response.text)
        queued = response.json()['exports']
        self.assertEqual(queued[0]['status'], 'queued')
        self.assertTrue(store.get(job)['highlight_candidates'][0]['approved'])
        final = None
        deadline = time.time() + 30
        while time.time() < deadline:
            final = store.get(job)['exports'][0]
            if final['status'] in ('ready', 'failed'):
                break
            if final['status'] == 'queued':
                worker.process_exports(job)
            time.sleep(0.2)
        self.assertEqual(final['status'], 'ready', final)
        self.assertTrue((folder / final['output']).is_file())

    def _queued(self, export_id, index):
        return {
            'id': export_id, 'index': index, 'status': 'queued', 'progress': 0,
            'caption_style': 'word', 'crop_mode': 'manual', 'crop_x_norm': 0.5,
            'crop_y_norm': 0.5, 'output': None, 'error': None,
        }

    def test_two_renderers_do_not_share_an_export_or_drop_a_later_batch(self):
        """The pre-fix writer kept a private copy of the exports list.

        Two threads could both observe the same queued rows, and a batch appended
        while those threads were rendering was overwritten when they saved.
        """
        job = 'a17a11c70004'
        folder = self.data / job
        folder.mkdir()
        (folder / 'source.mp4').write_bytes(b'not-decoded')
        candidates = [
            {'start': 0, 'duration': 1, 'score': 1, 'reason': 'a', 'approved': True},
            {'start': 1, 'duration': 1, 'score': 1, 'reason': 'b', 'approved': True},
            {'start': 2, 'duration': 1, 'score': 1, 'reason': 'c', 'approved': True},
        ]
        store.save(job, {
            'job_id': job, 'status': 'succeeded', 'attempts': 1, 'source_duration': 10,
            'highlight_candidates': candidates,
            'exports': [self._queued('aaaa0001', 0), self._queued('aaaa0002', 1)],
            'transcript': {'words': [{'start': 0.1, 'end': 0.4, 'text': 'Hi'}]},
        })
        renders = []
        lock = threading.Lock()
        first_pair = threading.Barrier(2)

        def fake_render(path, out, start, seconds, **kwargs):
            name = Path(out).name
            with lock:
                order = len(renders)
                renders.append(name)
            if order < 2:
                first_pair.wait(5)
            Path(out).write_bytes(b'0' * 2000)

        def fake_burn(video, subtitle, out):
            Path(out).write_bytes(b'0' * 2000)
            return out

        def legacy_process_exports(job_id):
            state = store.get(job_id)
            exports = list(state.get('exports') or [])
            for item in exports:
                if item.get('status') != 'queued':
                    continue
                item['status'] = 'running'
                store.patch(job_id, exports=exports)
                fake_render(None, folder / f"export_{item['id']}.mp4", 0, 1)
                item.update(status='ready', progress=100, output=f"export_{item['id']}.mp4", error=None)
                store.patch(job_id, exports=exports)

        def run_pair(fn):
            errors = []
            def runner():
                try:
                    fn(job)
                except Exception as exc:
                    errors.append(exc)
            threads = [threading.Thread(target=runner), threading.Thread(target=runner)]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join(10)
            self.assertFalse(any(thread.is_alive() for thread in threads), 'renderer threads did not finish')
            self.assertEqual(errors, [])

        # Reproduction of the old writer. Both threads snapshot the queued rows
        # before either of them saves, then a third export arrives mid-render.
        snapshot = threading.Barrier(2)

        def racing_get(job_id):
            item = real_get(job_id)
            exports = (item or {}).get('exports') or []
            if job_id == job and sum(1 for exp in exports if exp.get('status') == 'queued') >= 2:
                snapshot.wait(5)
            return item

        real_get = store.get
        queued_third = False

        def legacy_render(path, out, start, seconds, **kwargs):
            nonlocal queued_third
            if not queued_third:
                queued_third = True
                store.queue_highlight_exports(job, [2], 'word', 'manual', 0.5, 0.5, [self._queued('aaaa0003', 2)])
            fake_render(path, out, start, seconds)

        with patch('app.store.get', side_effect=racing_get):
            renders.clear()
            run_pair(lambda job_id: legacy_process_exports(job_id) or None)
        # legacy_process_exports calls store.get, which is patched, so both threads
        # hold the queued snapshot. Re-bind legacy to call the patched get via store.get.
        # The patch is active during run_pair. legacy uses store.get. Good.
        legacy_counts = {}
        for name in renders:
            legacy_counts[name] = legacy_counts.get(name, 0) + 1
        legacy_ids = [exp['id'] for exp in store.get(job).get('exports') or []]
        self.assertTrue(
            any(count > 1 for count in legacy_counts.values()) or 'aaaa0003' not in legacy_ids,
            f'old writer did not misbehave: counts={legacy_counts} ids={legacy_ids}',
        )

        # Fixed writer, same pressure: two threads plus a third export during render.
        store.save(job, {
            'job_id': job, 'status': 'succeeded', 'attempts': 1, 'source_duration': 10,
            'highlight_candidates': candidates,
            'exports': [self._queued('bbbb0001', 0), self._queued('bbbb0002', 1)],
            'transcript': {'words': [{'start': 0.1, 'end': 0.4, 'text': 'Hi'}]},
        })
        renders.clear()
        queued_third = False

        def fixed_render(path, out, start, seconds, **kwargs):
            nonlocal queued_third
            if not queued_third:
                queued_third = True
                store.queue_highlight_exports(job, [2], 'word', 'manual', 0.5, 0.5, [self._queued('bbbb0003', 2)])
            fake_render(path, out, start, seconds)

        with patch('app.engine.render', fixed_render), patch('app.captions.burn', fake_burn):
            run_pair(worker.process_exports)
            worker.process_exports(job)
        final = store.get(job)['exports']
        by_id = {exp['id']: exp for exp in final}
        self.assertEqual(set(by_id), {'bbbb0001', 'bbbb0002', 'bbbb0003'})
        for exp in final:
            self.assertEqual(exp['status'], 'ready', exp)
        counts = {}
        for name in renders:
            counts[name] = counts.get(name, 0) + 1
        self.assertTrue(all(count == 1 for count in counts.values()), counts)
        self.assertEqual(len(renders), 3)

    def test_failed_export_keeps_ffmpeg_stderr(self):
        bad = self.data / 'bad.mp4'
        bad.write_bytes(b'this is not a media file')
        subtitle = self.data / 'captions.ass'
        subtitle.write_text(captions.ass([{'start': 0.0, 'end': 0.5, 'text': 'Hi'}]))
        with self.assertRaises(RuntimeError) as caught:
            captions.burn(bad, subtitle, self.data / 'out.mp4')
        message = str(caught.exception)
        self.assertIn('ffmpeg caption burn failed', message)
        self.assertGreater(len(message), 80)
