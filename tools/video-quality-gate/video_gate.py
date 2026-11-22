#!/usr/bin/env python3
"""WISE2 video quality gate. Python standard library + ffmpeg/ffprobe."""
import argparse,json,math,re,subprocess,tempfile
from pathlib import Path
DEFAULT=dict(hero_min_seconds=6,hero_max_seconds=12,min_width=3840,min_height=2160,audio_target_lufs=-14,audio_tolerance_lu=2,palette_hex=['#0eff41'],palette_max_distance=65)
def run(args):
 p=subprocess.run(args,capture_output=True,text=True)
 if p.returncode:raise RuntimeError(p.stderr[-1200:])
 return p.stdout,p.stderr
def audit(src,cfg,out,contact):
 info=json.loads(run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',str(src)])[0])
 video=next(s for s in info['streams'] if s['codec_type']=='video')
 duration=float(info['format']['duration'])
 has_audio=any(s['codec_type']=='audio' for s in info['streams'])
 loud=None;peak=None
 if has_audio:
  stderr=run(['ffmpeg','-hide_banner','-nostats','-i',str(src),'-filter_complex','ebur128=peak=true','-f','null','-'])[1]
  a=re.findall(r'I:\s*(-?\d+(?:\.\d+)?) LUFS',stderr);b=re.findall(r'Peak:\s*(-?\d+(?:\.\d+)?) dBFS',stderr)
  loud=float(a[-1]) if a else None;peak=float(b[-1]) if b else None
 with tempfile.TemporaryDirectory() as temp:
  raw=Path(temp)/'frame.rgb'
  run(['ffmpeg','-v','error','-ss','1','-i',str(src),'-frames:v','1','-vf','scale=64:36,format=rgb24','-f','rawvideo',str(raw)])
  data=raw.read_bytes()
 targets=[tuple(bytes.fromhex(c.lstrip('#'))) for c in cfg['palette_hex']]
 pixels=[tuple(data[i:i+3]) for i in range(0,len(data),3) if max(data[i:i+3])>=45]
 nearest=min(((math.dist(p,t),p) for p in pixels for t in targets),default=None,key=lambda x:x[0])
 checks=dict(duration=cfg['hero_min_seconds']<=duration<=cfg['hero_max_seconds'],resolution=video['width']>=cfg['min_width'] and video['height']>=cfg['min_height'],loudness=not has_audio or (loud is not None and abs(loud-cfg['audio_target_lufs'])<=cfg['audio_tolerance_lu']),palette=nearest is not None and nearest[0]<=cfg['palette_max_distance'])
 result=dict(source=str(src),duration_seconds=duration,resolution=[video['width'],video['height']],integrated_lufs=loud,true_peak_dbfs=peak,palette_distance=round(nearest[0],1) if nearest else None,palette_nearest='#'+''.join(f'{x:02x}' for x in nearest[1]) if nearest else None,checks=checks,passed=all(checks.values()))
 out.mkdir(parents=True,exist_ok=True);(out/'audit.json').write_text(json.dumps(result,indent=2)+'\n')
 if contact:run(['ffmpeg','-v','error','-y','-i',str(src),'-vf','fps=1,scale=320:-1,tile=4x4','-vsync','vfr',str(out/'contact-%03d.jpg')])
 return result
def main():
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('--config',type=Path);p.add_argument('--out',type=Path,default=Path('video-gate-report'));p.add_argument('--contact-sheet',action='store_true');p.add_argument('--export',action='store_true');p.add_argument('--start',type=float,default=0);p.add_argument('--duration',type=float,default=10);a=p.parse_args()
 if not a.source.is_file():p.error('Missing input video')
 cfg=dict(DEFAULT)
 if a.config:cfg.update(json.loads(a.config.read_text()))
 source=audit(a.source,cfg,a.out/'source',a.contact_sheet)
 print(json.dumps(dict(source_passed=source['passed'],source_report=str(a.out/'source'/'audit.json'))))
 if not a.export:
  if not source['passed']:raise SystemExit(2)
  return
 if not cfg['hero_min_seconds']<=a.duration<=cfg['hero_max_seconds'] or a.start<0 or a.start+a.duration>source['duration_seconds']:p.error('Invalid hero clip range')
 target=a.out/(a.source.stem+'-hero.mp4')
 if target.exists() or target.resolve()==a.source.resolve():p.error('Refusing to overwrite')
 args=['ffmpeg','-hide_banner','-n','-ss',str(a.start),'-i',str(a.source),'-t',str(a.duration),'-map','0:v:0','-map','0:a:0?','-vf','scale=3840:2160:force_original_aspect_ratio=decrease:flags=lanczos,pad=3840:2160:(ow-iw)/2:(oh-ih)/2','-c:v','libx264','-crf','20','-preset','medium']
 if source['integrated_lufs'] is not None:args+=['-af',f'loudnorm=I={cfg["audio_target_lufs"]}:TP=-1.5:LRA=11','-c:a','aac','-b:a','192k']
 run(args+[str(target)])
 run(['ffmpeg','-v','error','-n','-ss','1','-i',str(target),'-frames:v','1',str(a.out/'poster.jpg')])
 exported=audit(target,cfg,a.out/'export',a.contact_sheet)
 print(json.dumps(dict(export_passed=exported['passed'],export_report=str(a.out/'export'/'audit.json'))))
 if not exported['passed']:raise SystemExit(2)
if __name__=='__main__':main()
