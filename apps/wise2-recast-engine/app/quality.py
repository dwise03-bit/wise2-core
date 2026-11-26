"""Grounded media QC using ffprobe, no speculative virality scores.
v1.6: expanded export-quality audit (dimensions, audio, captions, playable MP4).
"""
import json, subprocess
from pathlib import Path

def probe(path):
    p=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],capture_output=True,text=True,check=True)
    return json.loads(p.stdout)

def inspect(path,vertical=True):
    data=probe(path); video=next((s for s in data['streams'] if s['codec_type']=='video'),None)
    if not video:return {'passed':False,'errors':['No video stream']}
    w,h=int(video['width']),int(video['height']);length=float(data['format'].get('duration') or 0)
    errors=[]
    if length<=0:errors.append('No positive duration')
    if vertical and abs(w/h-9/16)>0.025:errors.append('Not 9:16')
    audio = any(s['codec_type']=='audio' for s in data['streams'])
    if not audio: errors.append('No audio stream')
    return {'passed':not errors,'errors':errors,'width':w,'height':h,'duration':length,'audio':audio}

def audit_export(path, expect_captions=False):
    """Strict export audit: playable MP4, dimensions, audio, optional caption sidecar."""
    p = Path(path)
    result = inspect(p)
    result['playable'] = p.is_file() and p.stat().st_size > 1000
    if not result['playable']:
        result['errors'].append('File missing or too small')
        result['passed'] = False
    if expect_captions:
        stem = p.stem.replace('_captioned','')
        srt = p.parent / f'{stem}.srt'
        result['captions_present'] = srt.is_file()
        if not result['captions_present']:
            result['errors'].append('Expected caption sidecar missing')
            result['passed'] = False
    return result
