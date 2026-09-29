const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL);

module.exports = { Queue, Worker, connection };
