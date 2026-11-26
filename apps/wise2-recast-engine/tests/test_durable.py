import unittest, tempfile, os, json
from pathlib import Path
from app import store

class DurableStoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        os.environ['WISE2_DATA_DIR'] = self.tmp.name
        # Force reimport path if needed; store uses env at import but DB path is resolved on call

    def tearDown(self):
        self.tmp.cleanup()
        os.environ.pop('WISE2_DATA_DIR', None)

    def test_queue_and_recover(self):
        store.save('abc123def456', {'job_id': 'abc123def456', 'status': 'running'})
        recovered = store.mark_abandoned(max_age_seconds=0)
        self.assertIn('abc123def456', recovered)
        item = store.get('abc123def456')
        self.assertEqual(item['status'], 'interrupted')

    def test_upload_lifecycle(self):
        uid = 'up' + os.urandom(5).hex()
        store.create_upload(uid, 'test.mp4', 1000)
        info = store.get_upload(uid)
        self.assertEqual(info['received'], 0)
        store.update_upload(uid, 500, 'uploading')
        info = store.get_upload(uid)
        self.assertEqual(info['received'], 500)

if __name__ == '__main__':
    unittest.main()
