const socket = io();

async function loadPage(page) {
    const res = await fetch(`pages/${page}.html`);
    const html = await res.text();

    document.getElementById("content").innerHTML = html;

    updateClock();
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

setInterval(updateClock,1000);

loadPage("home");

socket.on("stats",(s)=>{

    const cpu=document.getElementById("cpu");
    const ram=document.getElementById("ram");
    const temp=document.getElementById("temp");

    if(cpu) cpu.innerText=s.cpu+"%";
    if(ram) ram.innerText=s.mem+" GB";
    if(temp) temp.innerText=s.temp+"°C";

});
