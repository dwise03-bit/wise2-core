"""Setup report. Optional packages are imported only inside this function."""
import os
import shutil
import sys
import subprocess
from . import store
from .subject import backend_status


def _version(tool):
    if shutil.which(tool) is None:
        return None
    proc = subprocess.run([tool, '-version'], capture_output=True, text=True)
    line = (proc.stdout or proc.stderr or '').splitlines()
    return line[0].strip() if line else tool


def _whisper():
    model = os.getenv('WISE2_ASR_MODEL', 'tiny')
    try:
        import faster_whisper  # noqa: F401
    except ImportError:
        return {'installed': False, 'model': model, 'model_available': False, 'detail': 'faster-whisper is not installed'}
    from pathlib import Path
    roots = [Path.home() / '.cache' / 'huggingface' / 'hub']
    if os.getenv('HF_HOME'):
        roots.insert(0, Path(os.environ['HF_HOME']) / 'hub')
    cached = False
    for root in roots:
        if root.exists() and any(root.glob(f'*{model}*')):
            cached = True
            break
    return {
        'installed': True,
        'model': model,
        'model_available': cached,
        'detail': 'model is cached' if cached else 'package is installed; the model downloads on the first transcription',
    }


def collect():
    data = store._db_path().parent
    disk = shutil.disk_usage(data if data.exists() else '.')
    age = store.worker_age()
    mode = store.get_setting('processing_mode', 'scene-fallback')
    ffmpeg_version = _version('ffmpeg')
    ffprobe_version = _version('ffprobe')
    db = store._db_path()
    return {
        'python': {'version': sys.version.split()[0], 'executable': sys.executable},
        'ffmpeg': {'found': ffmpeg_version is not None, 'version': ffmpeg_version},
        'ffprobe': {'found': ffprobe_version is not None, 'version': ffprobe_version},
        'faster_whisper': _whisper(),
        'subject_detection': backend_status(),
        'worker': {
            'alive': age is not None and age < 15,
            'age_sec': None if age is None else round(age, 3),
        },
        'paths': {
            'db': str(db),
            'storage': str(data),
            'db_writable': os.access(db.parent, os.W_OK),
            'storage_writable': os.access(data, os.W_OK),
        },
        'disk': {'path': str(data), 'free_bytes': disk.free, 'total_bytes': disk.total},
        'processing_mode': mode,
    }
