import unittest
from app.engine import select_windows
class SelectionTests(unittest.TestCase):
 def test_max_twenty_nonoverlap(self):
  x=select_windows(1000,[float(i) for i in range(0,1000,3)],[],20)
  self.assertEqual(len(x),20)
  self.assertTrue(all(b['start']>=a['start']+a['duration'] for a,b in zip(x,x[1:])))
 def test_short(self):
  self.assertEqual(select_windows(9,[],[])[0]['duration'],9)
 def test_duration(self):
  self.assertTrue(all(15<=x['duration']<=30 for x in select_windows(240,[],[])))
if __name__=='__main__':unittest.main()
