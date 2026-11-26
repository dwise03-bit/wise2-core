import unittest
from app import highlights

class HighlightsTest(unittest.TestCase):
    def setUp(self):
        self.words=[{'start':float(i)*0.55,'end':float(i)*0.55+0.4,'text':('why' if i%40==0 else 'hello')} for i in range(180)]
    def test_rank_nonoverlap(self):
        results=highlights.rank(self.words,100,max_clips=20)
        self.assertTrue(1<=len(results)<=20)
        for a,b in zip(results,results[1:]):self.assertLessEqual(a['start']+a['duration'],b['start'])
    def test_limit(self):
        with self.assertRaises(ValueError):highlights.rank(self.words,100,21)
    def test_empty(self):self.assertEqual(highlights.rank([],100),[])
    def test_clip_time(self):
        result=highlights.clip_words(self.words,10,20)
        self.assertTrue(all(0<=w['start']<w['end']<=20 for w in result))
    def test_invalid_duration(self):
        with self.assertRaises(ValueError):highlights.rank(self.words,0)
