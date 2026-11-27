import unittest, tempfile
from pathlib import Path
from app import captions,timeline,publishing

class NewFeatures(unittest.TestCase):
    def setUp(self):self.words=[{'start':0.0,'end':0.5,'text':'Hello'},{'start':0.6,'end':1.0,'text':'world'}]
    def test_srt(self):self.assertIn('00:00:00,000 --> 00:00:00,500',captions.srt(self.words))
    def test_vtt(self):self.assertTrue(captions.vtt(self.words).startswith('WEBVTT'))
    def test_ass(self):self.assertIn('Dialogue: 0',captions.ass(self.words))
    def test_invalid_words(self):
        with self.assertRaises(ValueError):captions.validate([{'start':2,'end':1,'text':'x'}])
    def test_timeline(self):self.assertEqual(timeline.normalize({'start':1,'end':3,'words':self.words})['end'],3)
    def test_timeline_rejects_overrun(self):
        with self.assertRaises(ValueError):timeline.normalize({'start':1,'end':3},2)
    def test_publisher_never_claims_live(self):self.assertFalse(publishing.preflight({'provider':'youtube','title':'Hi','clip_name':'clip_01.mp4'})['ready_for_live_publish'])

if __name__=='__main__':unittest.main()
