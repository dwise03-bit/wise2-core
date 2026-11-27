"""Serializable, editable clip timeline with validated boundaries."""
from .captions import validate

def normalize(data,source_duration=None):
    start=float(data.get('start',0));end=float(data.get('end',0))
    if start<0 or end<=start:raise ValueError('End must exceed start')
    if source_duration is not None and end>source_duration+0.01:raise ValueError('Clip exceeds source')
    words=validate(data.get('words',[]))
    if any(w['end']>end-start+0.01 for w in words):raise ValueError('Captions exceed clip duration')
    result={'start':start,'end':end,'words':words,'style':data.get('style','viral'),'audio_gain_db':max(-20,min(20,float(data.get('audio_gain_db',0))))}
    if data.get('crop_mode') in ('auto','manual'):
        result['crop_mode']=data['crop_mode']
    if data.get('crop_x_norm') is not None:
        result['crop_x_norm']=max(0.0,min(1.0,float(data['crop_x_norm'])))
    if data.get('crop_y_norm') is not None:
        result['crop_y_norm']=max(0.0,min(1.0,float(data['crop_y_norm'])))
    if data.get('caption_style') in ('word','phrase'):
        result['caption_style']=data['caption_style']
    return result


def render_edit(source, output, edit, workdir):
    """Apply validated source-relative trims, gain and optional captions to an MP4."""
    import subprocess
    from pathlib import Path
    from . import captions
    source,output,workdir=Path(source),Path(output),Path(workdir)
    edit=normalize(edit)
    workdir.mkdir(parents=True,exist_ok=True)
    length=edit['end']-edit['start']
    vf='scale=540:960:force_original_aspect_ratio=decrease,pad=540:960:(ow-iw)/2:(oh-ih)/2,setsar=1'
    try:
        from .subject import vertical_filter
        vf, _source = vertical_filter(source, edit['start'], edit['end'], 540, 960, edit.get('crop_mode','auto'), edit.get('crop_x_norm'), edit.get('crop_y_norm'), workdir/'crop')
    except Exception:
        pass
    if edit['words']:
        subtitle=workdir/'timeline_captions.ass'
        subtitle.write_text(captions.ass(edit['words'],edit['style'],grouping=edit.get('caption_style','word')))
        escaped=str(subtitle.resolve()).replace('\\','\\\\').replace(':','\\:').replace("'","\\'").replace(',','\\,')
        vf+=f",ass='{escaped}'"
    cmd=['ffmpeg','-y','-v','error','-ss',str(edit['start']),'-i',str(source),'-t',str(length),'-vf',vf,
         '-af',f"volume={edit['audio_gain_db']}dB",'-c:v','libx264','-preset','veryfast','-crf','26',
         '-c:a','aac','-movflags','+faststart',str(output)]
    subprocess.run(cmd,check=True,capture_output=True,text=True)
    return output
