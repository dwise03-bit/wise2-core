import unittest, tempfile
from pathlib import Path
try:
 from fastapi.testclient import TestClient
 from app import main,store
except ImportError:
 TestClient=None
@unittest.skipIf(TestClient is None,'fastapi/httpx not installed')
class APITests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory()
  store.set_db(Path(self.tmp.name)/'jobs.sqlite3')
  self.client=TestClient(main.app)
 def tearDown(self):
  store.set_db(None)
  self.tmp.cleanup()
 def test_health(self):self.assertEqual(self.client.get('/api/health').status_code,200)
 def test_path_rejection(self):self.assertEqual(self.client.get('/api/jobs/../../etc/passwd').status_code,404)
 def test_missing_job(self):self.assertEqual(self.client.get('/api/jobs/000000000000').status_code,404)
 def test_invalid_upload(self):self.assertEqual(self.client.post('/api/jobs',files={'file':('bad.txt',b'x','text/plain')}).status_code,400)
if __name__=='__main__':unittest.main()
