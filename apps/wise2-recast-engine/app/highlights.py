"""Deterministic transcript-aware clip candidate ranking. No virality prediction.
v1.4: combines word density, hooks, coverage, optional silence gaps and scene density when supplied.
"""
import re
from .captions import validate
HOOKS=('how','why','secret','never','best','worst','mistake','imagine','remember','here is','here\'s','watch','problem','truth','first','finally','important','because')

def rank(words, source_duration, max_clips=20, min_seconds=15, max_seconds=30, scenes=None, silences=None):
    words=validate(words)
    if not 1<=int(max_clips)<=20: raise ValueError('max_clips must be between 1 and 20')
    length=float(source_duration)
    if length<=0: raise ValueError('source_duration must be positive')
    if not words: return []
    if words[-1]['end']>length+0.5: raise ValueError('Transcript exceeds source duration')
    scenes = scenes or []
    silences = silences or []
    # Candidate windows start at utterance beginnings after meaningful pauses,
    # plus 5-second grid positions; rank by word density, hooks, coverage, scene activity and low silence.
    starts={0.0}
    for i,w in enumerate(words):
        if i==0 or w['start']-words[i-1]['end']>=0.45: starts.add(max(0.,w['start']-0.2))
    starts.update(float(x) for x in range(0,int(length),5))
    candidates=[]
    for start in sorted(starts):
        end=min(length,start+max_seconds)
        if end-start<min_seconds and length>=min_seconds: continue
        inside=[w for w in words if w['start']>=start and w['end']<=end]
        if not inside: continue
        first=' '.join(w['text'] for w in inside[:12]).lower()
        hook=sum(bool(re.search(r'\b'+re.escape(term)+r'\b',first)) for term in HOOKS)
        density=min(len(inside)/max(end-start,1),3)/3
        coverage=(inside[-1]['end']-inside[0]['start'])/max(end-start,1)
        pause=min(1.,max(0.,inside[0]['start']-start))
        scene_score = min(1.0, sum(1 for s in scenes if start <= s < end) / 5.0)
        silence_penalty = min(1.0, sum(max(0, min(end, s[1]) - max(start, s[0])) for s in silences if len(s)==2) / max(end-start,1))
        score=round(0.4*density+0.15*coverage+0.2*min(hook,2)/2+0.05*(1-pause)+0.15*scene_score+0.05*(1-silence_penalty),4)
        reason=f'transcript heuristic: {len(inside)} words, {hook} hooks, {sum(1 for s in scenes if start<=s<end)} scenes'
        candidates.append({'start':round(start,2),'duration':round(end-start,2),'score':score,'reason':reason,'method':'transcript_heuristic_v14'})
    chosen=[]
    for c in sorted(candidates,key=lambda x:(-x['score'],x['start'])):
        if all(c['start']+c['duration']<=s['start'] or s['start']+s['duration']<=c['start'] for s in chosen): chosen.append(c)
        if len(chosen)>=int(max_clips):break
    return sorted(chosen,key=lambda x:x['start'])

def clip_words(words,start,duration):
    end=start+duration
    return [{'start':round(max(0,w['start']-start),3),'end':round(min(duration,w['end']-start),3),'text':w['text']} for w in validate(words) if w['start']>=start and w['end']<=end]
