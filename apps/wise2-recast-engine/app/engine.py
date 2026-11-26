"""CPU-first, explainable heuristic highlight detection; NOT semantic AI."""
import json, subprocess, re
from pathlib import Path

def run(args):
    return subprocess.run(args, capture_output=True, text=True, check=True).stderr

def duration(path):
    p=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(path)],capture_output=True,text=True,check=True)
    return float(json.loads(p.stdout)['format']['duration'])

def detect_events(path, length):
    # Scene-cut timestamps. Analyze a scaled video to limit CPU cost.
    log=run(['ffmpeg','-hide_banner','-i',str(path),'-vf',"scale=320:-2,select='gt(scene,0.30)',showinfo",'-an','-f','null','-'])
    scenes=[]
    for line in log.splitlines():
        if 'showinfo' in line and 'pts_time:' in line:
            m=re.search(r'pts_time:\s*([\d.]+)',line)
            if m: scenes.append(float(m.group(1)))
    # Loudness from 1s audio blocks; absent audio is supported.
    loud=[]
    try:
        log=run(['ffmpeg','-hide_banner','-i',str(path),'-vn','-af','astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level','-f','null','-'])
        for m in re.finditer(r'lavfi\.astats\.Overall\.RMS_level=([^\s]+)',log):
            try: loud.append(float(m.group(1)))
            except ValueError: pass
    except subprocess.CalledProcessError: pass
    return scenes,loud

def select_windows(length, scenes, loud, target=20, min_len=15, max_len=30):
    if length<=0: return []
    clip_len=min(25,max_len,length)
    if clip_len<min_len and length>=min_len: clip_len=min_len
    if length<min_len: return [{'start':0.,'duration':round(length,2),'score':0.,'reason':'short source'}]
    # Every 5 seconds, evaluate scene density and available audio energy.
    candidates=[]
    t=0.
    while t+clip_len<=length+0.01:
        end=t+clip_len
        cuts=sum(t<=x<end for x in scenes)
        # Audio RMS data may have frame-level rather than second-level resolution;
        # avoid pretending index maps to seconds. Score scenes only for now.
        score=round(cuts/clip_len,4)
        candidates.append({'start':round(t,2),'duration':round(clip_len,2),'score':score,'reason':f'{cuts} scene transitions'})
        t+=5
    # Select highest-scoring non-overlapping windows. Chronological output.
    selected=[]
    for c in sorted(candidates,key=lambda x:(-x['score'],x['start'])):
        if all(c['start']+c['duration']<=s['start'] or s['start']+s['duration']<=c['start'] for s in selected):
            selected.append(c)
        if len(selected)>=target: break
    return sorted(selected,key=lambda x:x['start'])

def render(path, out, start, seconds, width=540, crop_mode='auto', crop_x_norm=None, crop_y_norm=None):
    height=int(width*16/9)//2*2
    vf=f'scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1'
    try:
        from .subject import vertical_filter
        vf, _source = vertical_filter(path, float(start), float(start)+float(seconds), width, height, crop_mode, crop_x_norm, crop_y_norm, out)
    except Exception:
        pass
    run(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(path),'-t',str(seconds),'-vf',vf,'-c:v','libx264','-preset','veryfast','-crf','26','-c:a','aac','-movflags','+faststart',str(out)])
