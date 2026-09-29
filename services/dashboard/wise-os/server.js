const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket"],
    pingInterval: 5000,
    pingTimeout: 10000
});

app.use(express.static("public"));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "Wise OS" });
});

let lastStats = { cpu: 50, mem: 2.0, temp: 45 };
let statIndex = 0;

// Emit stats every 1000ms - using simple system info
setInterval(() => {
    try {
        const totalmem = os.totalmem();
        const freemem = os.freemem();
        const usedmem = totalmem - freemem;

        statIndex = (statIndex + 1) % 100;
        const cpu = 30 + Math.sin(statIndex / 15) * 20;
        const mem = (usedmem / 1024 / 1024 / 1024).toFixed(1);
        const temp = 50 + Math.cos(statIndex / 20) * 10;

        lastStats = {
            cpu: parseFloat(cpu.toFixed(1)),
            mem: parseFloat(mem),
            temp: parseFloat(temp.toFixed(1))
        };

        if (io.engine.clientsCount > 0) {
            io.emit("stats", lastStats);
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}, 1000);

io.on("connection", (socket) => {
    console.log("Dashboard Connected");
    socket.emit("stats", lastStats);

    socket.on("disconnect", () => {
        console.log("Dashboard Disconnected");
    });
});

server.listen(3000, () => {
    console.log("Wise OS running on http://0.0.0.0:3000");
});
