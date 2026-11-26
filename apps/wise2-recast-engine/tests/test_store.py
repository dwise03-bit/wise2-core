import unittest, tempfile, os
from pathlib import Path
class StoreTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory()
  from app import store
  self.store=store
  store.set_db(Path(self.tmp.name)/'jobs.sqlite3')
 def tearDown(self):
  self.store.set_db(None)
  self.tmp.cleanup()
 def test_persists_and_updates(self):
  self.store.save('abc',{'job_id':'abc','status':'queued'})
  self.store.patch('abc',status='complete')
  self.assertEqual(self.store.get('abc')['status'],'complete')
  self.assertEqual(len(self.store.all_jobs()),1)
 def test_missing(self):self.assertIsNone(self.store.get('absent'))
if __name__=='__main__':unittest.main()
