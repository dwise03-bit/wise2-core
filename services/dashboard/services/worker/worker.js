const Redis = require("ioredis");
const redis = new Redis("redis://redis:6379");

async function run() {
  console.log("Worker running...");

  while (true) {
    const job = await redis.lpop("jobs");

    if (job) {
      console.log("Processing:", job);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }
}

run();
