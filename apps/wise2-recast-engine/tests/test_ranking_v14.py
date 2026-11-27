import unittest
from app import highlights

class RankingV14Tests(unittest.TestCase):
    def test_rank_with_scenes(self):
        words = [{'start': 0.0, 'end': 1.0, 'text': 'hello'}, {'start': 5.0, 'end': 6.0, 'text': 'world how'}]
        clips = highlights.rank(words, 30.0, max_clips=5, scenes=[5.5], silences=[(10, 12)])
        self.assertTrue(len(clips) >= 1)
        self.assertIn('scenes', clips[0]['reason'])
        self.assertEqual(clips[0]['method'], 'transcript_heuristic_v14')

    def test_rank_empty_still_ok(self):
        self.assertEqual(highlights.rank([], 10), [])

if __name__ == '__main__':
    unittest.main()
