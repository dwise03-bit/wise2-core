#!/usr/bin/env bash
set -euo pipefail
BASE="$HOME/.local/share/wise2-pocket"
mkdir -p "$BASE" "$HOME/Desktop" "$HOME/.local/share/applications"
cat > "$BASE/index.html" <<'HTML'
<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WISE² Pocket Command</title><style>body{font:18px system-ui;background:#08111e;color:#f1f7ff;margin:0;padding:28px}main{max-width:850px;margin:auto}h1{font-size:40px;color:#75d4ff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}button,a{background:#132b45;color:#fff;border:1px solid #377eb4;border-radius:14px;padding:20px;text-align:left;font:inherit;cursor:pointer;text-decoration:none}button:focus,a:focus{outline:3px solid #77d6ff}#status{color:#a8cce7;margin:16px 0}small{color:#9db5c9}</style><main><h1>WISE² · POCKET NODE 5</h1><p>I'm really like that. My bots is on go.</p><button id="mic">🎙️ Start listening</button> <button id="stop">■ Stop</button><div id="status" role="status">Voice is off. Use buttons or type a phrase.</div><input id="cmd" aria-label="Voice command" placeholder="Type a command" style="padding:14px;background:#10253b;color:white;border:1px solid #377eb4;border-radius:8px"><button id="run">Run</button><div class="grid" id="tiles"></div><p><small>Local launch panel. Browser speech recognition may require Chromium permissions and network service. No unattended bots, production deploy, or server-side Hermes execution are enabled by this page.</small></p></main><script>
const routes=[["Cook it up","https://wise2.net"],["What's blocking?","https://wise2.net/blockages"],["Drop the beat","https://wise2.net"],["Dog and pony","https://github.com/dwise03-bit/wise2-core/issues/229"],["Route that to Sound Lab","https://github.com/dwise03-bit/wise2-core/issues/230"],["Hermes voice packages","https://github.com/dwise03-bit/wise2-core/issues/231"],["Status check","https://github.com/dwise03-bit/wise2-core/issues/229"],["Pocket Node on deck","https://login.tailscale.com/admin/machines"]];
const status=document.getElementById('status');document.getElementById('tiles').innerHTML=routes.map(([name,url])=>'<a href="'+url+'" target="_blank" rel="noopener">'+name+'</a>').join('');
function dispatch(v){v=v.toLowerCase().trim().replace(/[.!?]/g,'');if(v.includes("i'm really like that")){status.textContent="Hermes wake phrase recognized locally. Say a command.";return}if(v.includes("my bots is on go")){status.textContent="Mission mode armed locally. No remote jobs dispatched.";return}if(v.includes("full push")){status.textContent="Full push acknowledged. Production actions still require approval.";return}const hit=routes.find(([name])=>v.includes(name.toLowerCase()));if(hit){status.textContent="Opening "+hit[0];window.open(hit[1],"_blank","noopener")}else{status.textContent="Unknown command: "+v}}
document.getElementById('run').onclick=()=>dispatch(document.getElementById('cmd').value);
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec;if(SR){rec=new SR();rec.lang='en-US';rec.continuous=false;rec.interimResults=false;rec.onresult=e=>dispatch(e.results[0][0].transcript);rec.onerror=e=>status.textContent="Mic error: "+e.error;rec.onend=()=>{if(status.textContent==="Listening")status.textContent="Listening stopped"}}
document.getElementById('mic').onclick=()=>{if(!rec){status.textContent="Browser speech recognition unavailable. Use typed commands.";return}try{rec.start();status.textContent="Listening"}catch(e){status.textContent=e.message}};
document.getElementById('stop').onclick=()=>{if(rec)rec.stop();status.textContent="Voice stopped"};
</script></html>
HTML
cat > "$HOME/.local/share/applications/wise2-pocket.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=WISE2 Pocket Command
Exec=xdg-open file://$BASE/index.html
Icon=audio-input-microphone
Terminal=false
Categories=Utility;
EOF
cp "$HOME/.local/share/applications/wise2-pocket.desktop" "$HOME/Desktop/WISE2-Pocket-Command.desktop"
chmod +x "$HOME/Desktop/WISE2-Pocket-Command.desktop"
printf '\nWISE2 Pocket launcher installed.\n'
printf 'Audio devices:\n'
(command -v pactl >/dev/null && pactl list short sources || true)
printf '\nBluetooth controller status:\n'
(command -v bluetoothctl >/dev/null && bluetoothctl show || true)
printf '\nTo pair a headset, use bluetoothctl interactively: power on; agent on; default-agent; scan on; pair MAC; trust MAC; connect MAC.\n'
printf 'No automatic pairing performed.\n'
