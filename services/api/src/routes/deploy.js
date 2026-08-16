const deployQueue = require("../../../worker/queues/deployQueue");

router.post("/deploy", async (req, res) => {
  await deployQueue.add("deploy", {
    time: Date.now()
  });

  res.json({ status: "queued" });
});
