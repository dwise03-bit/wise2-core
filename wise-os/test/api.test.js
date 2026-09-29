"use strict";
process.env.WISE2_PORT = "0";
const test = require("node:test");
const assert = require("node:assert/strict");
const { server } = require("../server");

test.after(() => server.close());
test("health and status APIs expose truthful structured state", async () => {
  await new Promise((resolve) => server.listening ? resolve() : server.once("listening", resolve));
  const port = server.address().port;
  const health = await fetch(`http://127.0.0.1:${port}/api/health`).then((res) => res.json());
  assert.equal(health.status, "ok");
  const status = await fetch(`http://127.0.0.1:${port}/api/status`).then((res) => res.json());
  assert.equal(status.core, "ONLINE");
  assert.equal(typeof status.system.cpu, "number");
  assert.equal(status.sdr.receiveOnly, true);
  assert.match(status.incidents.state, /NOT_CONFIGURED|CONFIGURED/);
});

test("offline IMP answers local health questions", async () => {
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/api/imp/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "check system health" }) }).then((res) => res.json());
  assert.equal(response.source, "LOCAL_OFFLINE");
  assert.match(response.reply, /Core online/);
});
