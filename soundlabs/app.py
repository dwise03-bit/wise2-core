import re
import subprocess
import uuid
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="WISE2 Sound Labs", docs_url=None, redoc_url=None)
INPUT = Path("/data/input")
OUTPUT = Path("/data/output")
INPUT.mkdir(parents=True, exist_ok=True)
OUTPUT.mkdir(parents=True, exist_ok=True)
SAFE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}\.(mp3|wav|flac|m4a)$", re.I)

class RenderRequest(BaseModel):
    filename: str
    title: str = Field(default="WISE2 SOUND LABS", max_length=100)

@app.get("/health")
def health():
    return {"status": "ok", "service": "wise2-soundlabs"}

@app.post("/render")
def render(req: RenderRequest):
    if not SAFE.fullmatch(req.filename) or ".." in req.filename:
        raise HTTPException(400, "Invalid filename")
    source = INPUT / req.filename
    if not source.is_file() or source.is_symlink():
        raise HTTPException(404, "Audio file not found")
    if source.stat().st_size > 200 * 1024 * 1024:
        raise HTTPException(413, "Audio file too large")
    job = uuid.uuid4().hex
    target = OUTPUT / f"{job}.mp4"
    filtergraph = "showwaves=s=1280x720:mode=cline:colors=0x27b4ff:rate=30,format=yuv420p"
    cmd = ["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
           "-i",str(source),"-filter_complex",filtergraph,
           "-map","[v]","-map","0:a:0","-c:v","libx264","-preset","veryfast",
           "-c:a","aac","-b:a","192k","-shortest","-t","180",str(target)]
    # The waveform filter output must be labeled before mapping.
    cmd[cmd.index(filtergraph)] = filtergraph + "[v]"
    try:
        subprocess.run(cmd, check=True, timeout=240, capture_output=True, text=True)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        target.unlink(missing_ok=True)
        raise HTTPException(422, "Render failed or timed out")
    return {"job_id": job, "output": f"/data/output/{job}.mp4", "title": req.title}
