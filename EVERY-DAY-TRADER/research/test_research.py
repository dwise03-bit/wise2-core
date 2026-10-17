import unittest
from research import links, paper_record

class ResearchTests(unittest.TestCase):
    def record(self, **changes):
        args = dict(symbol="CMG", entry=50, stop=48, risk_budget=25,
                    source="manual practice example", observed_at="2026-10-08T12:00:00-04:00")
        args.update(changes)
        return paper_record(**args)

    def test_whole_share_risk_rounds_down(self):
        r = self.record()
        self.assertEqual(r["whole_shares"], 12)
        self.assertEqual(r["planned_risk"], 24)
        self.assertEqual(r["mode"], "paper")
        self.assertIsNone(r["fill_price"])

    def test_budget_below_one_share(self):
        self.assertEqual(self.record(risk_budget=1)["whole_shares"], 0)

    def test_invalid_inputs(self):
        for changes in ({"entry": float("nan")}, {"stop": 50}, {"risk_budget": -1},
                        {"observed_at": "2026-10-08T12:00:00"}, {"source": " "},
                        {"symbol": "<script>"}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.record(**changes)

    def test_symbol_links(self):
        self.assertIn("t=BRK.B", links("brk.b")["company-research"])
        self.assertEqual(len(links()), 5)

if __name__ == "__main__":
    unittest.main()
