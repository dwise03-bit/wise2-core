const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const si = require("systeminformation");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "Wise OS" });
});

io.on("connection", (socket) => {
    console.log("Dashboard Connected");

    setInterval(async () => {
        socket.emit("stats", {
            cpu: (await si.currentLoad()).currentLoad.toFixed(1),
            mem: ((await si.mem()).active / 1024 / 1024 / 1024).toFixed(1),
            temp: (await si.cpuTemperature()).main || 0
        });
    }, 1000);
});

server.listen(3000, () => {
    console.log("Wise OS running on http://0.0.0.0:3000");
});
