const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Wise Defense SaaS Running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("API running on port 3000");
});
