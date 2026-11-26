import unittest, tempfile
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
from app import main,store

class EditorTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.old_data=main.DATA
  store.set_db(Path(self.temp.name)/'jobs.db');main.DATA=Path(self.temp.name)
  self.client=TestClient(main.app);self.job='abcdef123456'
  (main.DATA/self.job).mkdir();(main.DATA/self.job/'source.mp4').write_bytes(b'test')
  store.save(self.job,{'job_id':self.job,'status':'complete','source_duration':12,'clips':[]})
 def tearDown(self):
  store.set_db(None);main.DATA=self.old_data;self.temp.cleanup()
 def test_editor_page(self):
  r=self.client.get('/');self.assertEqual(r.status_code,200);self.assertIn('Interactive Timeline Editor',r.text)
 def test_source_stream(self):
  r=self.client.get('/api/jobs/'+self.job+'/source');self.assertEqual(r.status_code,200);self.assertEqual(r.content,b'test')
 def test_source_rejects_unknown(self):
  self.assertEqual(self.client.get('/api/jobs/000000000000/source').status_code,404)
 def test_save_and_read_timeline(self):
  t={'start':1,'end':6,'words':[{'start':0,'end':1,'text':'Hello'}],'style':'neon','audio_gain_db':3}
  r=self.client.put('/api/jobs/'+self.job+'/timeline',json=t);self.assertEqual(r.status_code,200,r.text)
  self.assertEqual(self.client.get('/api/jobs/'+self.job+'/timeline').json()['words'][0]['text'],'Hello')
 def test_invalid_timeline(self):
  self.assertEqual(self.client.put('/api/jobs/'+self.job+'/timeline',json={'start':8,'end':3}).status_code,422)
