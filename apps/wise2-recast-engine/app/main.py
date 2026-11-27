from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import os, shutil, uuid, json, zipfile, re, subprocess
from .engine import duration, detect_events, select_windows, render
from . import store, captions, timeline, quality, publishing, highlights, auth, recast_router
from .worker import process_one, process_exports
ROOT=Path(__file__).resolve().parents[1]
DATA=Path(os.getenv('WISE2_DATA_DIR',str(ROOT/'data'))); DATA.mkdir(parents=True,exist_ok=True)
MAX_UPLOAD=int(os.getenv('WISE2_MAX_UPLOAD_MB','1024'))*1024*1024
app=FastAPI(title='WISE² Clip Engine × OpenJutsu RECAST',version='2.0.0')
app.mount('/web',StaticFiles(directory=str(ROOT/'web')),name='web')
app.include_router(recast_router.router)

@app.middleware('http')
async def wise2_remote_auth_guard(request: Request, call_next):
    path = request.url.path
    if auth.auth_required() and path.startswith('/api/') and path not in ('/api/health', '/api/auth/status', '/api/auth/login', '/api/auth/logout'):
        try:
            auth.verify_request_auth(request)
        except HTTPException as exc:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=exc.status_code, content={'detail': exc.detail}, headers=exc.headers or {})
    return await call_next(request)
# In-process executor kept for short tasks; long jobs go to durable queue + separate worker
executor=ThreadPoolExecutor(max_workers=1)
VALID_JOB=re.compile(r'^[0-9a-f]{12}$')

def worker(job,src):
    # The in-process path uses the same durable pipeline as `python -m app.worker`.
    process_one(job)

@app.on_event('startup')
def startup():
    # Recover abandoned running jobs; separate worker will requeue or process.
    recovered = store.mark_abandoned()
    if recovered:
        print(f'Recovered abandoned jobs: {recovered}')

@app.get('/')
def home():return FileResponse(ROOT/'web'/'index.html')

@app.get('/api/health')
def health():
    asr = False
    try:
        import faster_whisper
        asr = True
    except ImportError:
        pass
    return {'status':'ok','version':'2.0.0','recast_engine':'openjutsu-integrated','ffmpeg':bool(shutil.which('ffmpeg')),'ffprobe':bool(shutil.which('ffprobe')),'asr':asr,'worker':'external recommended','auth_required':auth.auth_required()}

@app.get('/api/jobs')
def list_jobs():return {'jobs':store.all_jobs()}

def _mode(value):
    mode = value or store.get_setting('processing_mode', 'scene-fallback')
    if mode not in ('strict-ai', 'scene-fallback'):
        raise HTTPException(422, 'processing_mode must be strict-ai or scene-fallback')
    return mode

@app.get('/api/settings')
def read_settings():
    return {'processing_mode': store.get_setting('processing_mode', 'scene-fallback')}

@app.put('/api/settings')
def write_settings(payload: dict = Body(...)):
    mode = _mode(payload.get('processing_mode'))
    store.set_setting('processing_mode', mode)
    return {'processing_mode': mode}

@app.get('/api/diagnostics')
def diagnostics():
    from .diagnostics import collect
    return collect()

@app.post('/api/jobs',status_code=202)
async def submit(file:UploadFile=File(...), processing_mode: str = Form('scene-fallback'), caption_style: str = Form('word')):
    # Disk space guard for low-spec machines
    free = shutil.disk_usage(DATA).free
    if free < 500 * 1024 * 1024:
        raise HTTPException(507, 'Insufficient disk space for processing')
    ext=Path(file.filename or '').suffix.lower()
    if ext not in {'.mp4','.mov','.mkv','.webm'}:raise HTTPException(400,'Supported video file required')
    # Basic path traversal guard
    if '..' in (file.filename or '') or '/' in (file.filename or '') or '\\' in (file.filename or ''):
        raise HTTPException(400, 'Invalid filename')
    job=uuid.uuid4().hex[:12];folder=DATA/job;folder.mkdir(parents=True)
    source=folder/('source'+ext)
    total=0
    try:
        with source.open('wb') as f:
            while chunk:=await file.read(1024*1024):
                total+=len(chunk)
                if total>MAX_UPLOAD:raise HTTPException(413,'Upload exceeds configured limit')
                f.write(chunk)
        if total==0:raise HTTPException(400,'Empty upload')
    except Exception:
        shutil.rmtree(folder,ignore_errors=True)
        raise
    finally:await file.close()
    mode=_mode(processing_mode)
    style=caption_style if caption_style in ('word','phrase') else 'word'
    store.save(job,{'job_id':job,'status':'queued','completed':0,'total':0,'clips':[],'bytes':total,'attempts':0,'processing_mode':mode,'caption_style':style,'fallback':False})
    # Durable queue: separate worker process claims and runs. For single-process demo, also submit to local executor.
    executor.submit(worker,job,source)
    return {'job_id':job,'status_url':f'/api/jobs/{job}','queue':'durable'}

@app.get('/api/jobs/{job}')
def status(job:str):
    if not VALID_JOB.fullmatch(job):raise HTTPException(404)
    info=store.get(job)
    if info is None:raise HTTPException(404,'Job not found')
    return info

@app.get('/api/jobs/{job}/files/{name}')
def download(job:str,name:str):
    if not VALID_JOB.fullmatch(job):raise HTTPException(404)
    if not (name in {'clips.zip','manifest.json'} or re.fullmatch(r'clip_\d+\.mp4',name)):raise HTTPException(404)
    p=DATA/job/name
    if not p.is_file():raise HTTPException(404)
    return FileResponse(p,filename=name)


# v1.0 editing and export API. Timeline and caption data persist in SQLite job payloads.

def job_folder(job):
    if not VALID_JOB.fullmatch(job) or store.get(job) is None:raise HTTPException(404,'Job not found')
    return DATA/job

@app.put('/api/jobs/{job}/timeline')
def put_timeline(job:str,payload:dict=Body(...)):
    folder=job_folder(job)
    try: result=timeline.normalize(payload,store.get(job).get('source_duration'))
    except (ValueError,TypeError,KeyError) as e:raise HTTPException(422,str(e))
    store.patch(job,timeline=result)
    return result

@app.get('/api/jobs/{job}/timeline')
def get_timeline(job:str):
    job_folder(job)
    return store.get(job).get('timeline',{})

@app.post('/api/jobs/{job}/captions/transcribe')
def transcribe_job(job:str,model_size:str='tiny'):
    folder=job_folder(job)
    source=next(iter(sorted(folder.glob('source.*'))),None)
    if not source:raise HTTPException(404,'Original source not found')
    if model_size not in {'tiny','base','small'}:raise HTTPException(422,'Unsupported model size')
    try:result=captions.transcribe(source,model_size)
    except RuntimeError as e:raise HTTPException(503,str(e))
    store.patch(job,transcript=result)
    return result

@app.put('/api/jobs/{job}/captions')
def put_captions(job:str,payload:dict=Body(...)):
    job_folder(job)
    try:words=captions.validate(payload.get('words',[]))
    except (ValueError,TypeError,KeyError) as e:raise HTTPException(422,str(e))
    result={'words':words,'language':payload.get('language','und'),'engine':'manual'}
    store.patch(job,transcript=result)
    return result

@app.post('/api/jobs/{job}/captions/render')
def render_captions(job:str,payload:dict=Body(default={})):
    folder=job_folder(job)
    name=payload.get('clip_name','clip_01.mp4')
    if not re.fullmatch(r'clip_\d+\.mp4',name):raise HTTPException(422,'Invalid clip name')
    clip=folder/name
    if not clip.is_file():raise HTTPException(404,'Clip not found')
    words=payload.get('words',store.get(job).get('transcript',{}).get('words',[]))
    # Transcript timestamps are relative to the selected clip when rendering.
    try:
        words=captions.validate(words)
        if not words:raise ValueError('No caption words supplied')
        assfile=folder/(name.replace('.mp4','.ass'))
        assfile.write_text(captions.ass(words,payload.get('style','viral'),payload.get('font_size',56)))
        (folder/name.replace('.mp4','.srt')).write_text(captions.srt(words))
        (folder/name.replace('.mp4','.vtt')).write_text(captions.vtt(words))
        output=folder/name.replace('.mp4','_captioned.mp4')
        captions.burn(clip,assfile,output)
        qc=quality.inspect(output)
    except (ValueError,TypeError,subprocess.CalledProcessError) as e:raise HTTPException(422,str(e))
    return {'file':f'/api/jobs/{job}/exports/{output.name}','qc':qc,'srt':f'/api/jobs/{job}/exports/{name.replace(".mp4",".srt")}'}

@app.get('/api/jobs/{job}/exports/{name}')
def export_file(job:str,name:str):
    folder=job_folder(job)
    if not re.fullmatch(r'(?:clip_\d+|export_[0-9a-f]{8})(?:_captioned)?\.mp4|(?:clip_\d+|export_[0-9a-f]{8})\.(?:ass|srt|vtt)',name):raise HTTPException(404)
    path=folder/name
    if not path.is_file():raise HTTPException(404)
    return FileResponse(path,filename=name)

@app.get('/api/jobs/{job}/quality/{name}')
def quality_check(job:str,name:str):
    folder=job_folder(job)
    if not re.fullmatch(r'clip_\d+(?:_captioned)?\.mp4',name):raise HTTPException(404)
    path=folder/name
    if not path.is_file():raise HTTPException(404)
    return quality.inspect(path)

@app.post('/api/publishing/preflight')
def publish_preflight(payload:dict=Body(...)):
    return publishing.preflight(payload)

@app.post('/api/jobs/{job}/retry',status_code=202)
def retry_job(job:str):
    folder=job_folder(job)
    current=store.get(job)
    if current['status'] not in ('failed','interrupted'):raise HTTPException(409,'Only failed or interrupted jobs can be retried')
    source=next(iter(sorted(folder.glob('source.*'))),None)
    if not source:raise HTTPException(404,'Original source missing')
    store.patch(job,status='queued',completed=0,total=0,clips=[],error=None)
    executor.submit(worker,job,source)
    return {'job_id':job,'status':'queued'}


@app.post('/api/jobs/{job}/timeline/render')
def render_timeline(job:str):
    folder=job_folder(job)
    saved=store.get(job).get('timeline')
    if not saved:raise HTTPException(409,'Save a timeline before rendering')
    source=next(iter(sorted(folder.glob('source.*'))),None)
    if source is None:raise HTTPException(404,'Original source missing')
    output=folder/'timeline_edited.mp4'
    try:
        edit=timeline.normalize(saved,duration(source))
        timeline.render_edit(source,output,edit,folder/'timeline_work')
        qc=quality.inspect(output)
    except (ValueError,RuntimeError,subprocess.CalledProcessError) as e:
        raise HTTPException(422,str(e)[:400])
    return {'file':f'/api/jobs/{job}/timeline/export','qc':qc,'applied_timeline':edit}

@app.get('/api/jobs/{job}/timeline/export')
def download_timeline(job:str):
    path=job_folder(job)/'timeline_edited.mp4'
    if not path.is_file():raise HTTPException(404,'Render the timeline first')
    return FileResponse(path,filename='timeline_edited.mp4')


@app.get('/api/jobs/{job}/source')
def source_preview(job:str):
    folder=job_folder(job)
    source=next(iter(sorted(folder.glob('source.*'))),None)
    if source is None:raise HTTPException(404,'Original source missing')
    return FileResponse(source,media_type={'.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.mkv':'video/x-matroska'}.get(source.suffix,'application/octet-stream'))


@app.post('/api/jobs/{job}/highlights/analyze')
def analyze_highlights(job:str,payload:dict=Body(default={})):
    job_folder(job)
    current=store.get(job)
    transcript=current.get('transcript',{})
    words=transcript.get('words',[])
    if not words:raise HTTPException(409,'A timestamped transcript is required; transcribe or upload captions first')
    length=current.get('source_duration')
    if not length:
        source=next(iter(sorted((DATA/job).glob('source.*'))),None)
        if source is None:raise HTTPException(404,'Original source missing')
        length=duration(source)
    try:
        scenes = payload.get('scenes') or []
        silences = payload.get('silences') or []
        clips=highlights.rank(words,length,payload.get('max_clips',20), scenes=scenes, silences=silences)
    except (ValueError,TypeError) as e:raise HTTPException(422,str(e))
    store.patch(job,highlight_candidates=clips)
    return {'candidates':clips,'method':'transcript_heuristic_v14','disclaimer':'Not semantic AI or a virality prediction'}

@app.post('/api/jobs/{job}/highlights/batch')
def batch_highlights(job: str, payload: dict = Body(...)):
    job_folder(job)
    state = store.get(job)
    indexes = payload.get('indexes') or []
    if not indexes:
        raise HTTPException(400, 'Select at least one highlight.')
    candidates = list(state.get('highlight_candidates') or [])
    for index in indexes:
        if not isinstance(index, int) or index < 0 or index >= len(candidates):
            raise HTTPException(404, f'Highlight {index} was not found.')
    action = payload.get('action', 'export')
    if action == 'approve':
        try:
            store.approve_highlights(job, indexes)
        except LookupError as exc:
            raise HTTPException(404, f'Highlight {exc} was not found.') from exc
        return {'candidates': store.get(job).get('highlight_candidates', [])}
    if action != 'export':
        raise HTTPException(422, 'Supported actions: approve, export')
    style = payload.get('caption_style') or state.get('caption_style') or 'word'
    crop_mode = payload.get('crop_mode') or 'auto'
    if style not in ('word', 'phrase'):
        raise HTTPException(422, 'caption_style must be word or phrase')
    if crop_mode not in ('auto', 'manual'):
        raise HTTPException(422, 'crop_mode must be auto or manual')
    queued = []
    for index in indexes:
        queued.append({
            'id': uuid.uuid4().hex[:8],
            'index': index,
            'status': 'queued',
            'progress': 0,
            'caption_style': style,
            'crop_mode': crop_mode,
            'crop_x_norm': payload.get('crop_x_norm'),
            'crop_y_norm': payload.get('crop_y_norm'),
            'output': None,
            'error': None,
        })
    try:
        store.queue_highlight_exports(job, indexes, style, crop_mode, payload.get('crop_x_norm'), payload.get('crop_y_norm'), queued)
    except LookupError as exc:
        raise HTTPException(404, f'Highlight {exc} was not found.') from exc
    executor.submit(process_exports, job)
    return {'exports': queued, 'queued': True, 'note': 'Queued for the durable worker'}

@app.get('/api/jobs/{job}/highlights')
def get_highlights(job:str):
    job_folder(job)
    return {'candidates':store.get(job).get('highlight_candidates',[])}

@app.post('/api/jobs/{job}/highlights/{index}/render')
def render_highlight(job:str,index:int,payload:dict=Body(default={})):
    folder=job_folder(job)
    state=store.get(job)
    candidates=state.get('highlight_candidates',[])
    if index<0 or index>=len(candidates):raise HTTPException(404,'Highlight not found')
    source=next(iter(sorted(folder.glob('source.*'))),None)
    if source is None:raise HTTPException(404,'Original source missing')
    item=candidates[index]
    output=folder/f'highlight_{index+1:02}.mp4'
    try:
        render(source,output,item['start'],item['duration'],crop_mode=payload.get('crop_mode','auto'),crop_x_norm=payload.get('crop_x_norm'),crop_y_norm=payload.get('crop_y_norm'))
        words=highlights.clip_words(state.get('transcript',{}).get('words',[]),item['start'],item['duration'])
        grouping='phrase' if payload.get('caption_style', state.get('caption_style'))=='phrase' else 'word'
        label='SCENE FALLBACK' if state.get('fallback') else None
        if payload.get('captions',True) and words:
            ass_path=folder/f'highlight_{index+1:02}.ass'
            ass_path.write_text(captions.ass(words,payload.get('style','viral'),grouping=grouping,label=label))
            finished=folder/f'highlight_{index+1:02}_captioned.mp4'
            captions.burn(output,ass_path,finished)
        else: finished=output
        qc=quality.inspect(finished)
    except (ValueError,TypeError,RuntimeError,subprocess.CalledProcessError) as e:raise HTTPException(422,str(e)[:400])
    return {'file':f'/api/jobs/{job}/highlights/files/{finished.name}','qc':qc,'caption_words':len(words)}

@app.get('/api/jobs/{job}/highlights/files/{name}')
def download_highlight(job:str,name:str):
    folder=job_folder(job)
    if not re.fullmatch(r'highlight_\d{2}(?:_captioned)?\.mp4',name):raise HTTPException(404)
    path=folder/name
    if not path.is_file():raise HTTPException(404)
    return FileResponse(path,filename=name)

# v1.4 durable queue, resumable uploads, batch, cancel
from fastapi import Request

@app.post('/api/uploads', status_code=201)
async def init_upload(filename: str = '', total_size: int = 0, checksum: str = ''):
    if not filename or total_size <= 0 or total_size > MAX_UPLOAD:
        raise HTTPException(400, 'filename and total_size required (within limit)')
    ext = Path(filename).suffix.lower()
    if ext not in {'.mp4', '.mov', '.mkv', '.webm'}:
        raise HTTPException(400, 'Supported video required')
    upload_id = uuid.uuid4().hex[:12]
    store.create_upload(upload_id, filename, total_size, checksum)
    return {'upload_id': upload_id, 'chunk_url': f'/api/uploads/{upload_id}/chunks', 'complete_url': f'/api/uploads/{upload_id}/complete'}

@app.put('/api/uploads/{upload_id}/chunks')
async def upload_chunk(upload_id: str, request: Request, offset: int = 0):
    info = store.get_upload(upload_id)
    if not info or info['status'] not in ('pending', 'uploading'):
        raise HTTPException(404, 'Upload not found or closed')
    if offset != info['received']:
        raise HTTPException(409, f'Offset mismatch: expected {info["received"]}')
    body = await request.body()
    if not body:
        raise HTTPException(400, 'Empty chunk')
    folder = DATA / 'uploads' / upload_id
    folder.mkdir(parents=True, exist_ok=True)
    part = folder / 'part.bin'
    with part.open('ab') as f:
        f.write(body)
    new_received = info['received'] + len(body)
    store.update_upload(upload_id, new_received, 'uploading')
    return {'received': new_received, 'total': info['total_size']}

@app.post('/api/uploads/{upload_id}/complete')
async def complete_upload(upload_id: str):
    info = store.get_upload(upload_id)
    if not info:
        raise HTTPException(404, 'Upload not found')
    if info['received'] != info['total_size']:
        raise HTTPException(409, f'Incomplete: {info["received"]}/{info["total_size"]}')
    job = uuid.uuid4().hex[:12]
    folder = DATA / job
    folder.mkdir(parents=True, exist_ok=True)
    src = folder / ('source' + Path(info['filename']).suffix.lower())
    part = DATA / 'uploads' / upload_id / 'part.bin'
    if part.is_file():
        shutil.move(str(part), str(src))
    try:
        length = duration(src)
    except Exception as e:
        shutil.rmtree(folder, ignore_errors=True)
        raise HTTPException(422, f'Invalid media: {e}')
    store.save(job, {'job_id': job, 'status': 'queued', 'completed': 0, 'total': 0, 'clips': [], 'bytes': info['total_size'], 'attempts': 0, 'source_duration': round(length, 2)})
    store.update_upload(upload_id, info['received'], 'complete', job)
    executor.submit(worker, job, src)
    return {'job_id': job, 'status_url': f'/api/jobs/{job}'}

@app.post('/api/jobs/{job}/cancel')
def cancel_job(job: str):
    current = store.get(job)
    if not current:
        raise HTTPException(404)
    if current['status'] in ('succeeded', 'failed', 'canceled'):
        raise HTTPException(409, 'Already terminal')
    store.patch(job, status='canceled', error='Canceled by user')
    return {'status': 'canceled'}

@app.post('/api/jobs/batch/render')
def batch_render(payload: dict = Body(...)):
    job_ids = payload.get('job_ids', [])
    results = []
    for jid in job_ids:
        try:
            if store.get(jid):
                store.patch(jid, status='queued')
                results.append({'job_id': jid, 'queued': True})
        except Exception as e:
            results.append({'job_id': jid, 'error': str(e)})
    return {'results': results, 'note': 'Queued for durable worker; progress via GET /api/jobs/{id}'}

# v1.4 publishing framework (credential-gated; live posts BLOCKED)
@app.post('/api/publishing/tokens')
def store_publishing_token(payload: dict = Body(...)):
    try:
        return publishing.store_token(payload.get('provider'), payload.get('account_id'), payload.get('token', {}))
    except ValueError as e:
        raise HTTPException(422, str(e))

@app.delete('/api/publishing/tokens/{provider}/{account_id}')
def disconnect_publishing(provider: str, account_id: str):
    return publishing.disconnect(provider, account_id)

@app.post('/api/publishing/draft')
def create_draft(payload: dict = Body(...)):
    return publishing.draft_or_schedule(payload)


