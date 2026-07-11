const http = require("http");

class QualityScorer {
  constructor(ollamaUrl = "http://localhost:11434") {
    this.ollamaUrl = ollamaUrl;
  }

  async scoreContent(text, gateNumber = 1) {
    const prompt = `You are a content quality analyzer for Wise Defense, a 2nd Amendment advocacy platform.

Analyze this content on 6 dimensions (score each 0-100):
1. Relevance: How directly does this connect to 2A rights, gun policy, constitutional issues?
2. Credibility: Is the source reputable? Does it cite credible sources?
3. Engagement: Would the audience find this interesting, shareable, discussion-worthy?
4. Brand Alignment: Does tone/messaging match Wise Defense values?
5. Fact-Check: Are claims verifiable? Any misinformation or sensationalism?
6. Uniqueness: Is this new analysis or repackaged content?

Respond with ONLY valid JSON on one line (no markdown, no formatting):
{
  "relevance": <number 0-100>,
  "credibility": <number 0-100>,
  "engagement": <number 0-100>,
  "brandAlignment": <number 0-100>,
  "factCheck": <number 0-100>,
  "uniqueness": <number 0-100>
}

Content to analyze:
${text.substring(0, 1500)}`;

    try {
      const response = await this.callOllama(prompt);
      const scores = JSON.parse(response);

      const average = Math.round(
        (scores.relevance +
          scores.credibility +
          scores.engagement +
          scores.brandAlignment +
          scores.factCheck +
          scores.uniqueness) /
          6
      );

      return {
        relevance: Math.max(0, Math.min(100, scores.relevance)),
        credibility: Math.max(0, Math.min(100, scores.credibility)),
        engagement: Math.max(0, Math.min(100, scores.engagement)),
        brandAlignment: Math.max(0, Math.min(100, scores.brandAlignment)),
        factCheck: Math.max(0, Math.min(100, scores.factCheck)),
        uniqueness: Math.max(0, Math.min(100, scores.uniqueness)),
        averageScore: average,
        meetsThreshold: average >= 68,
      };
    } catch (error) {
      console.error("[QUALITY-SCORER] Error:", error.message);
      throw error;
    }
  }

  async callOllama(prompt) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model: process.env.OLLAMA_MODEL || "mistral",
        prompt: prompt,
        stream: false,
      });

      const options = {
        hostname: "localhost",
        port: 11434,
        path: "/api/generate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.response);
          } catch (e) {
            reject(new Error("Invalid Ollama response"));
          }
        });
      });

      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = QualityScorer;
