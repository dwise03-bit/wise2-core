"""Editable caption timeline, optional local ASR, ASS/SRT/VTT and burned-in MP4."""
import json, re, subprocess, shutil
from pathlib import Path

def validate(words):
    cleaned=[]
    for w in words:
        start,end=float(w['start']),float(w['end'])
        if start<0 or end<=start or len(str(w['text']))>180: raise ValueError('Invalid caption word or timing')
        cleaned.append({'start':round(start,3),'end':round(end,3),'text':str(w['text']).strip()})
    return sorted(cleaned,key=lambda w:w['start'])

def stamp(seconds,sep=','):
    ms=round(seconds*1000); h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02}{sep}{ms:03}'

def srt(words):
    return ''.join(f"{i}\n{stamp(w['start'])} --> {stamp(w['end'])}\n{w['text']}\n\n" for i,w in enumerate(validate(words),1))

def vtt(words): return 'WEBVTT\n\n'+srt(words).replace(',', '.')

def ass_stamp(t):
    cent=round(t*100);h,cent=divmod(cent,360000);m,cent=divmod(cent,6000);s,cent=divmod(cent,100)
    return f'{h}:{m:02}:{s:02}.{cent:02}'

def group_phrases(words, max_chars=42, max_duration=3.2, max_words=8, pause_gap=0.45, max_line=21):
    """Group word timestamps into short phrase cues. Each cue text may contain a newline."""
    words = validate(words)
    phrases = []
    current = []

    def flush():
        if not current:
            return
        text = ' '.join(item['text'] for item in current)
        lines = _split_lines(text, max_line)
        phrases.append({'start': current[0]['start'], 'end': current[-1]['end'], 'text': '\n'.join(lines)})
        current.clear()

    for word in words:
        if current:
            joined = ' '.join(item['text'] for item in current) + ' ' + word['text']
            duration = word['end'] - current[0]['start']
            gap = word['start'] - current[-1]['end']
            if gap > pause_gap or len(joined) > max_chars or duration > max_duration or len(current) >= max_words:
                flush()
        current.append(word)
    flush()
    return phrases


def _split_lines(text, max_line):
    parts = text.split()
    if len(text) <= max_line or len(parts) < 2:
        return [text]
    best = 1
    best_gap = abs(len(' '.join(parts[:1])) - len(' '.join(parts[1:])))
    for index in range(1, len(parts)):
        left = ' '.join(parts[:index])
        right = ' '.join(parts[index:])
        gap = abs(len(left) - len(right))
        if left and right and gap < best_gap:
            best = index
            best_gap = gap
    return [' '.join(parts[:best]), ' '.join(parts[best:])]


def ass(words, style='viral', font_size=56, grouping='word', label=None):
    styles={'viral':('&H0000FFFF','&H00000000'),'clean':('&H00FFFFFF','&H00000000'),'cyan':('&H00FFFF00','&H00000000'),'cinematic':('&H00FFFFFF','&H00000000')}
    primary,outline=styles.get(style,styles['viral'])
    size=max(24,min(92,int(font_size)))
    cues = group_phrases(words) if grouping == 'phrase' else validate(words)
    header='[Script Info]\nScriptType: v4.00+\nPlayResX: 540\nPlayResY: 960\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
    header+=f'Style: Default,DejaVu Sans,{size},{primary},&H00FFFFFF,{outline},&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,35,35,160,1\n'
    header+='Style: Label,DejaVu Sans,28,&H0042B9F5,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,3,0,8,20,20,36,1\n'
    header+='[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
    if label and cues:
        end = max(item['end'] for item in cues)
        safe_label = str(label).replace('\\','\\\\').replace('{','(').replace('}',')').replace('\n',' ')
        header += f"Dialogue: 1,{ass_stamp(0)},{ass_stamp(end)},Label,,0,0,0,,{safe_label}\n"
    elif label:
        header += f"Dialogue: 1,{ass_stamp(0)},{ass_stamp(2)},Label,,0,0,0,,{str(label)}\n"
    for w in cues:
        safe=w['text'].replace('\\','\\\\').replace('{','(').replace('}',')').replace('\n','\\N')
        header+=f"Dialogue: 0,{ass_stamp(w['start'])},{ass_stamp(w['end'])},Default,,0,0,0,,{safe}\n"
    return header

def transcribe(video,model_size='tiny'):
    try: from faster_whisper import WhisperModel
    except ImportError as e: raise RuntimeError('Install optional ASR dependency: pip install faster-whisper') from e
    model=WhisperModel(model_size,device='cpu',compute_type='int8')
    segments,info=model.transcribe(str(video),word_timestamps=True,vad_filter=True)
    words=[]
    for seg in segments:
        for w in seg.words or []:
            if w.start is not None and w.end is not None and w.word.strip(): words.append({'start':w.start,'end':w.end,'text':w.word.strip()})
    return {'language':info.language,'words':validate(words),'engine':'faster-whisper','model':model_size}

def burn(video,subtitle,out):
    if not shutil.which('ffmpeg'):raise RuntimeError('ffmpeg required')
    # ffmpeg filter path escaping: write subtitle next to source and run with cwd in same directory.
    video,out,subtitle=map(lambda p:Path(p).resolve(),(video,out,subtitle))
    if not subtitle.is_file():raise FileNotFoundError(subtitle)
    filter_path=str(subtitle).replace('\\','\\\\').replace(':','\\:').replace("'", "\\'").replace(',','\\,')
    cmd=['ffmpeg','-y','-v','error','-i',str(video),'-vf',f"ass='{filter_path}'",'-c:v','libx264','-preset','veryfast','-crf','26','-c:a','aac','-movflags','+faststart',str(out)]
    proc=subprocess.run(cmd,capture_output=True,text=True)
    if proc.returncode!=0:
        detail=(proc.stderr or proc.stdout or '').strip()
        raise RuntimeError(f'ffmpeg caption burn failed ({proc.returncode}): {detail[-4000:]}')
    return out
