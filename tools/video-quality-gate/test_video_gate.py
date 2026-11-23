#!/usr/bin/env python3
"""Integration tests using real ffmpeg, temporary synthetic media and no production services."""
import json,subprocess,sys,tempfile
from pathlib import Path
SCRIPT=Path(__file__).with_name('video_gate.py')
def cmd(*args,ok=True):
 p=subprocess.run([str(x) for x in args],capture_output=True,text=True)
 if ok and p.returncode:raise AssertionError(f'command failed ({p.returncode}): {p.stderr[-800:]}')
 return p
with tempfile.TemporaryDirectory() as d:
 root=Path(d);src=root/'input.mp4';out=root/'report'
 cmd('ffmpeg','-v','error','-f','lavfi','-i','color=c=0x0eff41:s=320x180:r=10:d=3','-f','lavfi','-i','sine=frequency=440:sample_rate=44100:duration=3','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',src)
 cfg=root/'brand.json'
 cfg.write_text(json.dumps(dict(hero_min_seconds=2,hero_max_seconds=4,min_width=320,min_height=180,audio_target_lufs=-14,audio_tolerance_lu=30,palette_hex=['#0eff41'],palette_max_distance=70)))
 r=cmd(sys.executable,SCRIPT,src,'--config',cfg,'--out',out,'--contact-sheet')
 a=json.loads((out/'source'/'audit.json').read_text())
 assert a['checks']['duration'] and a['checks']['resolution'] and a['checks']['palette'],a
 assert (out/'source'/'contact-001.jpg').exists()
 assert not (out/'input-hero.mp4').exists()
 cfg.write_text(json.dumps(dict(hero_min_seconds=2,hero_max_seconds=4,min_width=3840,min_height=2160,audio_target_lufs=-14,audio_tolerance_lu=30,palette_hex=['#0eff41'],palette_max_distance=70)))
 r=cmd(sys.executable,SCRIPT,src,'--config',cfg,'--out',root/'fail',ok=False)
 assert r.returncode==2,r
 assert not (root/'fail'/'input-hero.mp4').exists()
 cfg.write_text(json.dumps(dict(hero_min_seconds=2,hero_max_seconds=4,min_width=320,min_height=180,audio_target_lufs=-14,audio_tolerance_lu=30,palette_hex=['#0eff41'],palette_max_distance=70)))
 export_dir=root/'exported'
 cmd(sys.executable,SCRIPT,src,'--config',cfg,'--out',export_dir,'--export','--duration','2.5')
 hero=export_dir/'input-hero.mp4'
 assert hero.exists()
 report=json.loads((export_dir/'export'/'audit.json').read_text())
 assert report['checks']['duration'] and report['checks']['resolution'],report
 again=cmd(sys.executable,SCRIPT,src,'--config',cfg,'--out',export_dir,'--export','--duration','2.5',ok=False)
 assert again.returncode!=0 and hero.exists()
 print('PASS: audit, contact sheet, fail gate, export, re-audit, no overwrite')
