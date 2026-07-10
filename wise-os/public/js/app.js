const socket = io({
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    transports: ['websocket', 'polling'],
    upgrade: false
});

let statsHistory = {
    cpu: [],
    mem: [],
    temp: []
};

async function loadPage(page) {
    const res = await fetch(`pages/${page}.html`);
    const html = await res.text();
    document.getElementById("content").innerHTML = html;
    updateClock();
    if(page === 'home') {
        renderCharts();
    }
}

document.querySelectorAll(".nav").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        loadPage(btn.dataset.page);
    });
});

function updateClock() {
    const now = new Date();
    const clock = document.getElementById("clock");
    if (clock) {
        clock.innerText = now.toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });
    }
}

function updateGauge(id, value, max) {
    const gauge = document.getElementById(id);
    if(!gauge) return;
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const circumference = 314;
    const dashoffset = circumference - (circumference * percentage / 100);
    gauge.style.strokeDashoffset = dashoffset;
}

function drawSparkline(canvasId, data, maxValue) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(0,204,255,0.03)';
    ctx.fillRect(0, 0, width, height);

    if(data.length < 2) return;

    ctx.strokeStyle = '#00CCFF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / maxValue) * height;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,204,255,0.15)';
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

function drawTrendChart(canvasId, data, maxValue) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(0,204,255,0.03)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0,204,255,0.2)';
    ctx.lineWidth = 1;
    for(let i = 0; i <= 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    if(data.length < 2) return;

    ctx.strokeStyle = '#00CCFF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / maxValue) * height;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,204,255,0.15)';
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

function renderCharts() {
    drawSparkline('cpu-chart', statsHistory.cpu, 100);
    drawSparkline('mem-chart', statsHistory.mem, 16);
    drawSparkline('temp-chart', statsHistory.temp, 100);
    drawTrendChart('cpu-trend', statsHistory.cpu, 100);
    drawTrendChart('mem-trend', statsHistory.mem, 16);
}

setInterval(updateClock, 1000);
loadPage("home");

socket.on("stats", (s) => {
    statsHistory.cpu.push(s.cpu);
    statsHistory.mem.push(s.mem);
    statsHistory.temp.push(s.temp);

    if(statsHistory.cpu.length > 60) statsHistory.cpu.shift();
    if(statsHistory.mem.length > 60) statsHistory.mem.shift();
    if(statsHistory.temp.length > 60) statsHistory.temp.shift();

    updateGauge('cpu-gauge', s.cpu, 100);
    updateGauge('mem-gauge', s.mem, 16);
    updateGauge('temp-gauge', s.temp, 100);

    const cpuVal = document.getElementById('cpu-value');
    const memVal = document.getElementById('mem-value');
    const tempVal = document.getElementById('temp-value');

    if(cpuVal) cpuVal.innerText = Math.round(s.cpu) + '%';
    if(memVal) memVal.innerText = s.mem + 'GB';
    if(tempVal) tempVal.innerText = Math.round(s.temp) + '°C';

    renderCharts();
});
