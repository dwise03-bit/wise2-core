const QualityScorer = require("../lib/quality-scorer");

describe("QualityScorer", () => {
  let scorer;

  beforeEach(() => {
    scorer = new QualityScorer();
  });

  test("scoreContent returns valid score object", async () => {
    const text = "Second Amendment rights are constitutionally protected freedoms.";
    const scores = await scorer.scoreContent(text);

    expect(scores).toHaveProperty("relevance");
    expect(scores).toHaveProperty("credibility");
    expect(scores).toHaveProperty("engagement");
    expect(scores).toHaveProperty("brandAlignment");
    expect(scores).toHaveProperty("factCheck");
    expect(scores).toHaveProperty("uniqueness");
    expect(scores).toHaveProperty("averageScore");
    expect(scores).toHaveProperty("meetsThreshold");

    expect(scores.averageScore).toBeGreaterThanOrEqual(0);
    expect(scores.averageScore).toBeLessThanOrEqual(100);
    expect(typeof scores.meetsThreshold).toBe("boolean");
  });

  test("meetsThreshold is true when average >= 68", async () => {
    const text = "Important 2A constitutional analysis backed by court decisions and legal scholars.";
    const scores = await scorer.scoreContent(text);
    if (scores.averageScore >= 68) {
      expect(scores.meetsThreshold).toBe(true);
    }
  });
});
