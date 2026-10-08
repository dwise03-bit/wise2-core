import unittest
from market_data import validate_snapshot
class SnapshotTests(unittest.TestCase):
 def test_valid(self): self.assertEqual(validate_snapshot({"provider":"x","as_of":"2026-10-08T12:00:00-04:00","delay":"15m","symbols":[{"symbol":"CMG","price":42}]})["provider"],"x")
 def test_requires_delay(self):
  with self.assertRaises(ValueError): validate_snapshot({"provider":"x","as_of":"2026-10-08T12:00:00-04:00","symbols":[]})
 def test_requires_timezone(self):
  with self.assertRaises(ValueError): validate_snapshot({"provider":"x","as_of":"2026-10-08T12:00:00","delay":"unknown","symbols":[]})
if __name__=="__main__": unittest.main()
