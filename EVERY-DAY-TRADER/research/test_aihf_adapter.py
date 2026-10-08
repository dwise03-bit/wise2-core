import unittest
from aihf_adapter import normalize

class AdapterTests(unittest.TestCase):
    def test_normalizes_report(self):
        result = normalize({"symbol":"cmg","source":"aihf local report","observed_at":"2026-10-08T12:00:00-04:00","recommendation":"watch","confidence":0.61,"risk_flags":["earnings"]})
        self.assertEqual(result["symbol"], "CMG")
        self.assertEqual(result["mode"], "research")
        self.assertEqual(result["execution"], "disabled")
        self.assertEqual(result["risk_flags"], ["earnings"])
    def test_rejects_missing_timezone(self):
        with self.assertRaises(ValueError):
            normalize({"symbol":"CMG","source":"x","observed_at":"2026-10-08T12:00:00"})
    def test_rejects_missing_required(self):
        with self.assertRaises(ValueError):
            normalize({"symbol":"CMG","source":"x"})
if __name__ == "__main__":
    unittest.main()
