"""Separate worker process for durable background jobs.
Launch with: python -m app.worker
Recovers abandoned jobs on start, processes queued jobs with retries and exponential backoff.
v1.5: integrates optional local ASR (faster-whisper) and transcript-aware highlight ranking into the pipeline.
"""
import time, os, sys, json, shutil, uuid
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from . import store, engine, captions, highlights, quality

DATA = Path(os.getenv('WISE2_DATA_DIR', str(Path(__file__).resolve().parents[1] / 'data')))
MAX_WORKERS = int(os.getenv('WISE2_MAX_WORKERS', '1'))
RETRY_LIMIT = 3
BACKOFF = [5, 15, 45]

def _progress(job_id, stage, pct, message=''):
    store.patch(job_id, stage=stage, progress=round(pct, 1), message=message or stage)
    store.heartbeat(job_id)

def process_one(job_id):
    state = store.get(job_id)
    if not state or state.get('status') not in ('queued', 'retry'):
        return
    # Duplicate-processing guard
    if state.get('status') == 'running':
        return
    attempts = state.get('attempts', 0)
    store.patch(job_id, status='running', attempts=attempts + 1, heartbeat=time.time(), progress=0, stage='starting')
    store.heartbeat(job_id)
    folder = DATA / job_id
    source = next(iter(sorted(folder.glob('source.*'))), None)
    if not source:
        store.patch(job_id, status='failed', error='Source missing', message='Source file not found')
        return
    try:
        _progress(job_id, 'probing', 5, 'Reading media duration')
        length = engine.duration(source)
        store.patch(job_id, source_duration=round(length, 2))

        # Optional local ASR. strict-ai fails the job. scene-fallback continues and labels the output.
        mode = state.get('processing_mode') or 'scene-fallback'
        if mode not in ('strict-ai', 'scene-fallback'):
            mode = 'scene-fallback'
        transcript = state.get('transcript')
        if not transcript or not transcript.get('words'):
            _progress(job_id, 'transcribing', 15, 'Running local speech recognition (faster-whisper)')
            try:
                transcript = captions.transcribe(source, model_size=os.getenv('WISE2_ASR_MODEL', 'tiny'))
                if not transcript.get('words'):
                    raise RuntimeError('ASR produced no words')
                store.patch(job_id, transcript=transcript, processing_mode=mode, fallback=False, highlight_source='asr', asr_status='ok')
                _progress(job_id, 'transcribing', 35, f"Transcript: {len(transcript.get('words', []))} words, language={transcript.get('language', 'und')}")
            except RuntimeError as e:
                message = str(e)
                unavailable = 'not installed' in message.lower() or 'Install optional ASR' in message
                asr_status = 'unavailable' if unavailable else 'failed'
                if mode == 'strict-ai':
                    store.patch(job_id, status='failed', progress=100, stage='failed', processing_mode=mode, fallback=False, asr_status=asr_status, error=f'Strict-AI mode failed: {message[:240]}', message=f'Strict-AI mode failed: {message[:120]}')
                    return
                store.patch(job_id, transcript_error=message[:200], processing_mode=mode, fallback=True, highlight_source='scene-audio-fallback', asr_status=asr_status)
                _progress(job_id, 'transcribing', 35, 'Scene fallback — ASR unavailable. Using scene and audio energy.')
                transcript = {'words': []}

        _progress(job_id, 'analyzing', 40, 'Detecting scenes and ranking highlights')
        scenes, loud = engine.detect_events(source, length)
        words = transcript.get('words', []) if transcript else []
        if words:
            windows = highlights.rank(words, length, max_clips=20, scenes=scenes)
            method = 'transcript_heuristic_v15'
        else:
            windows = engine.select_windows(length, scenes, loud)
            method = 'scene-transition heuristic'

        store.patch(job_id, status='rendering', total=len(windows), highlight_candidates=windows, selection_method=method)
        clips = []
        for idx, w in enumerate(windows, 1):
            # Cancellation check before each clip
            current = store.get(job_id)
            if current and current.get('status') == 'canceled':
                store.patch(job_id, message='Canceled during rendering', stage='canceled')
                return
            pct = 45 + (idx / max(len(windows), 1)) * 45
            _progress(job_id, 'rendering', pct, f'Rendering clip {idx}/{len(windows)}')
            name = f'clip_{idx:02}.mp4'
            crop_mode = state.get('crop_mode') or 'auto'
            engine.render(source, folder / name, w['start'], w['duration'], crop_mode=crop_mode, crop_x_norm=state.get('crop_x_norm'), crop_y_norm=state.get('crop_y_norm'))
            # Auto-generate captions for this clip when a transcript exists.
            caption_info = {}
            grouping = 'phrase' if state.get('caption_style') == 'phrase' else 'word'
            label = 'SCENE FALLBACK' if store.get(job_id).get('fallback') else None
            if words:
                clip_words = highlights.clip_words(words, w['start'], w['duration'])
                if clip_words:
                    ass_path = folder / f'clip_{idx:02}.ass'
                    ass_path.write_text(captions.ass(clip_words, grouping=grouping, label=label))
                    (folder / f'clip_{idx:02}.srt').write_text(captions.srt(clip_words))
                    (folder / f'clip_{idx:02}.vtt').write_text(captions.vtt(clip_words))
                    captioned = folder / f'clip_{idx:02}_captioned.mp4'
                    captions.burn(folder / name, ass_path, captioned)
                    caption_info = {'captioned': f'/api/jobs/{job_id}/exports/{captioned.name}', 'words': len(clip_words)}
            elif label:
                ass_path = folder / f'clip_{idx:02}.ass'
                ass_path.write_text(captions.ass([{'start': 0.0, 'end': min(2.0, float(w['duration'])), 'text': 'Scene fallback'}], grouping='word', label=label))
                captioned = folder / f'clip_{idx:02}_captioned.mp4'
                captions.burn(folder / name, ass_path, captioned)
                caption_info = {'captioned': f'/api/jobs/{job_id}/exports/{captioned.name}', 'fallback': True}
            clips.append({**w, 'name': name, 'download': f'/api/jobs/{job_id}/files/{name}', **caption_info})
            store.patch(job_id, completed=idx, clips=clips)
            store.heartbeat(job_id)

        manifest = {
            'job_id': job_id,
            'selection_method': method,
            'clips': clips,
            'source_duration': length,
            'transcript_words': len(words)
        }
        (folder / 'manifest.json').write_text(json.dumps(manifest, indent=2))
        with __import__('zipfile').ZipFile(folder / 'clips.zip', 'w', compression=__import__('zipfile').ZIP_STORED) as z:
            z.write(folder / 'manifest.json', 'manifest.json')
            for c in clips:
                z.write(folder / c['name'], c['name'])
                cap = folder / c['name'].replace('.mp4', '_captioned.mp4')
                if cap.is_file():
                    z.write(cap, cap.name)
        store.patch(job_id, status='succeeded', progress=100, stage='complete', archive=f'/api/jobs/{job_id}/files/clips.zip', message='Complete')
        # Cleanup temporary work files (keep source, clips, captions, zip)
        for tmp in folder.glob('*.tmp'):
            try: tmp.unlink()
            except OSError: pass
    except Exception as e:
        err = str(e)[:350]
        if attempts + 1 < RETRY_LIMIT:
            store.patch(job_id, status='retry', error=err, message=f'Retrying after error: {err[:80]}', next_retry=time.time() + BACKOFF[min(attempts, len(BACKOFF) - 1)])
        else:
            store.patch(job_id, status='failed', error=err, message=f'Failed: {err[:120]}')

def run():
    print(f'WISE2 durable worker starting (max_workers={MAX_WORKERS})')
    recovered = store.mark_abandoned()
    if recovered:
        print(f'Recovered abandoned jobs: {recovered}')
    executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
    futures = {}
    while True:
        store.touch_worker()
        pending = store.queued_jobs()
        for job in pending:
            jid = job['job_id']
            if jid in futures and not futures[jid].done():
                continue
            if job.get('status') == 'retry' and job.get('next_retry', 0) > time.time():
                continue
            futures[jid] = executor.submit(process_one, jid)
        done = [k for k, f in futures.items() if f.done()]
        for k in done:
            del futures[k]
        for item in store.jobs_with_queued_exports():
            process_exports(item['job_id'])
        time.sleep(2)


def describe_failure(exc):
    """Keep ffmpeg stderr. CalledProcessError's own text is only the command line."""
    import subprocess
    if isinstance(exc, subprocess.CalledProcessError):
        detail = exc.stderr or exc.stdout or ''
        if isinstance(detail, bytes):
            detail = detail.decode('utf-8', 'replace')
        detail = str(detail).strip()
        if detail:
            return f'ffmpeg exited {exc.returncode}: {detail[-4000:]}'
        return f'ffmpeg exited {exc.returncode}: {exc}'
    return str(exc)[:4000]


def process_exports(job_id):
    """Render each queued export once. A second caller claims a different row or nothing."""
    rendered = 0
    while True:
        item = store.claim_queued_export(job_id)
        if not item:
            return rendered
        rendered += 1
        export_id = item['id']
        try:
            state = store.get(job_id) or {}
            folder = DATA / job_id
            source = next(iter(sorted(folder.glob('source.*'))), None)
            if source is None:
                raise RuntimeError('Source missing')
            candidates = state.get('highlight_candidates') or []
            index = int(item['index'])
            if index < 0 or index >= len(candidates):
                raise RuntimeError('Highlight not found')
            if not candidates[index].get('approved'):
                raise RuntimeError('Highlight is not approved')
            clip = candidates[index]
            stem = f"export_{export_id}"
            plain = folder / f'{stem}.mp4'
            engine.render(source, plain, clip['start'], clip['duration'], crop_mode=item.get('crop_mode') or 'auto', crop_x_norm=item.get('crop_x_norm'), crop_y_norm=item.get('crop_y_norm'))
            words = highlights.clip_words((state.get('transcript') or {}).get('words') or [], clip['start'], clip['duration'])
            grouping = 'phrase' if item.get('caption_style') == 'phrase' else 'word'
            label = 'SCENE FALLBACK' if state.get('fallback') else None
            finished = plain
            if words:
                ass_path = folder / f'{stem}.ass'
                ass_path.write_text(captions.ass(words, grouping=grouping, label=label))
                (folder / f'{stem}.srt').write_text(captions.srt(words))
                finished = folder / f'{stem}_captioned.mp4'
                captions.burn(plain, ass_path, finished)
            elif label:
                ass_path = folder / f'{stem}.ass'
                ass_path.write_text(captions.ass([{'start': 0.0, 'end': min(2.0, float(clip['duration'])), 'text': label}], grouping='word'))
                finished = folder / f'{stem}_captioned.mp4'
                captions.burn(plain, ass_path, finished)
            store.update_export(job_id, export_id, status='ready', progress=100, output=finished.name, error=None)
        except Exception as exc:
            store.update_export(job_id, export_id, status='failed', progress=100, error=describe_failure(exc))
    return rendered

if __name__ == '__main__':
    run()
