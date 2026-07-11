const { Queue } = require("bullmq");
const { connection } = require("../redis");

const deployQueue = new Queue("deploy-queue", { connection });

module.exports = deployQueue;
