"""SQLite-backed durable jobs and upload sessions. Atomic updates, WAL mode."""
import json, os, sqlite3, threading, time
from pathlib import Path
from datetime import datetime, timezone

_override_db = None

def _db_path():
    if _override_db is not None:
        return Path(_override_db)
    base = Path(os.getenv('WISE2_DATA_DIR', str(Path(__file__).resolve().parents[1] / 'data')))
    return base / 'jobs.sqlite3'

def set_db(path):
    """Test helper: override DB location."""
    global _override_db
    _override_db = str(path) if path else None

# Read-only view for any code that inspects store.DB
@property
def DB():
    return _db_path()

_lock = threading.RLock()

def connection():
    db = _db_path()
    db.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(db), timeout=30)
    con.execute('PRAGMA journal_mode=WAL')
    con.execute('''CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        status TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        heartbeat TEXT
    )''')
    try:
        con.execute('ALTER TABLE jobs ADD COLUMN status TEXT')
    except sqlite3.OperationalError:
        pass
    try:
        con.execute('ALTER TABLE jobs ADD COLUMN heartbeat TEXT')
    except sqlite3.OperationalError:
        pass
    con.execute('''CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY,
        filename TEXT,
        total_size INTEGER,
        received INTEGER DEFAULT 0,
        checksum TEXT,
        status TEXT,
        job_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT
    )''')
    return con

def _with_con(fn):
    """Run fn(con) and always close the connection to avoid ResourceWarnings."""
    con = connection()
    try:
        return fn(con)
    finally:
        con.close()

def save(job, payload):
    status = payload.get('status', 'unknown')
    def _do(con):
        con.execute(
            'INSERT INTO jobs(id, payload, status) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, status=excluded.status, updated_at=CURRENT_TIMESTAMP',
            (job, json.dumps(payload), status)
        )
        con.commit()
    with _lock:
        _with_con(_do)

def get(job):
    def _do(con):
        row = con.execute('SELECT payload FROM jobs WHERE id=?', (job,)).fetchone()
        return json.loads(row[0]) if row else None
    with _lock:
        return _with_con(_do)

def patch(job, **changes):
    """Merge keys into the latest payload. Does not replace fields this call leaves out."""
    def fn(item):
        item.update(changes)
        if 'status' in changes:
            item['status'] = changes['status']
    with _lock:
        mutate_job(job, fn)
    return get(job)

def touch_worker():
    """Record that the durable worker loop is alive."""
    path = _db_path().parent / 'worker_heartbeat'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(str(time.time()), encoding='utf-8')

def worker_age():
    path = _db_path().parent / 'worker_heartbeat'
    if not path.is_file():
        return None
    try:
        return max(0.0, time.time() - float(path.read_text(encoding='utf-8').strip()))
    except ValueError:
        return None

def heartbeat(job):
    def _do(con):
        con.execute('UPDATE jobs SET heartbeat=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?', (job,))
        con.commit()
    with _lock:
        _with_con(_do)

def all_jobs():
    def _do(con):
        rows = con.execute('SELECT payload FROM jobs ORDER BY updated_at DESC').fetchall()
        return [json.loads(r[0]) for r in rows]
    with _lock:
        return _with_con(_do)

def get_setting(key, default=None):
    def _do(con):
        con.execute('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
        row = con.execute('SELECT value FROM settings WHERE key=?', (key,)).fetchone()
        return row[0] if row else default
    with _lock:
        return _with_con(_do)

def set_setting(key, value):
    def _do(con):
        con.execute('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
        con.execute('INSERT INTO settings(key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', (key, value))
        con.commit()
    with _lock:
        _with_con(_do)

def mutate_job(job_id, fn):
    """Apply fn to one job payload inside a single IMMEDIATE transaction.

    The in-process lock does not cover the API process and the worker process.
    BEGIN IMMEDIATE does, so two renderers cannot claim the same export.
    fn may change the payload dict in place. It must not call back into the store.
    """
    db = _db_path()
    db.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(db), timeout=30, isolation_level=None)
    try:
        con.execute('PRAGMA journal_mode=WAL')
        con.execute('BEGIN IMMEDIATE')
        try:
            row = con.execute('SELECT payload FROM jobs WHERE id=?', (job_id,)).fetchone()
            if row is None:
                con.execute('ROLLBACK')
                raise KeyError(job_id)
            item = json.loads(row[0])
            result = fn(item)
            con.execute(
                'UPDATE jobs SET payload=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
                (json.dumps(item), item.get('status', 'unknown'), job_id),
            )
            con.execute('COMMIT')
            return result
        except Exception:
            try:
                con.execute('ROLLBACK')
            except sqlite3.Error:
                pass
            raise
    finally:
        con.close()

def claim_queued_export(job_id):
    """Move one queued export to running. None if another renderer took the last one."""
    claimed = {}

    def fn(item):
        for exp in item.get('exports') or []:
            if exp.get('status') == 'queued':
                exp['status'] = 'running'
                exp['progress'] = 10
                exp['claimed_at'] = time.time()
                claimed['exp'] = json.loads(json.dumps(exp))
                return
        claimed['exp'] = None

    try:
        mutate_job(job_id, fn)
    except KeyError:
        return None
    return claimed['exp']

def update_export(job_id, export_id, **fields):
    """Update one export by id and leave every other export untouched."""
    def fn(item):
        for exp in item.get('exports') or []:
            if exp.get('id') == export_id:
                exp.update(fields)
                return
        raise KeyError(export_id)
    mutate_job(job_id, fn)

def queue_highlight_exports(job_id, indexes, style, crop_mode, crop_x_norm, crop_y_norm, new_exports):
    """Approve indexes and append exports without replacing in-flight export rows."""
    def fn(item):
        candidates = item.get('highlight_candidates') or []
        for index in indexes:
            if not isinstance(index, int) or index < 0 or index >= len(candidates):
                raise LookupError(index)
            candidates[index]['approved'] = True
        item['highlight_candidates'] = candidates
        item['exports'] = list(item.get('exports') or []) + list(new_exports)
    mutate_job(job_id, fn)

def approve_highlights(job_id, indexes):
    def fn(item):
        candidates = item.get('highlight_candidates') or []
        for index in indexes:
            if not isinstance(index, int) or index < 0 or index >= len(candidates):
                raise LookupError(index)
            candidates[index]['approved'] = True
        item['highlight_candidates'] = candidates
    mutate_job(job_id, fn)

def jobs_with_queued_exports():
    def _do(con):
        rows = con.execute('SELECT payload FROM jobs').fetchall()
        found = []
        for row in rows:
            item = json.loads(row[0])
            if any(exp.get('status') == 'queued' for exp in item.get('exports') or []):
                found.append(item)
        return found
    with _lock:
        return _with_con(_do)

def queued_jobs():
    def _do(con):
        rows = con.execute("SELECT payload FROM jobs WHERE status IN ('queued','retry') ORDER BY updated_at ASC").fetchall()
        return [json.loads(r[0]) for r in rows]
    with _lock:
        return _with_con(_do)

def mark_abandoned(max_age_seconds=300):
    """Mark running jobs with stale heartbeat as interrupted for recovery."""
    def _do(con):
        rows = con.execute("SELECT id, payload FROM jobs WHERE status='running'").fetchall()
        recovered = []
        for jid, payload in rows:
            item = json.loads(payload)
            hb = item.get('heartbeat')
            if not hb or (time.time() - float(hb or 0)) > max_age_seconds:
                item['status'] = 'interrupted'
                item['error'] = 'Abandoned after restart or timeout; source preserved. Use retry.'
                item['attempts'] = item.get('attempts', 0)
                con.execute('UPDATE jobs SET payload=?, status=? WHERE id=?', (json.dumps(item), 'interrupted', jid))
                recovered.append(jid)
        con.commit()
        return recovered
    with _lock:
        return _with_con(_do)

# Upload helpers
def create_upload(upload_id, filename, total_size, checksum=None):
    expires = datetime.now(timezone.utc).timestamp() + 3600 * 24
    def _do(con):
        con.execute(
            'INSERT INTO uploads(id, filename, total_size, checksum, status, expires_at) VALUES (?,?,?,?,?,?)',
            (upload_id, filename, total_size, checksum or '', 'pending', str(expires))
        )
        con.commit()
    with _lock:
        _with_con(_do)

def update_upload(upload_id, received, status=None, job_id=None):
    def _do(con):
        if status and job_id:
            con.execute('UPDATE uploads SET received=?, status=?, job_id=? WHERE id=?', (received, status, job_id, upload_id))
        elif status:
            con.execute('UPDATE uploads SET received=?, status=? WHERE id=?', (received, status, upload_id))
        else:
            con.execute('UPDATE uploads SET received=? WHERE id=?', (received, upload_id))
        con.commit()
    with _lock:
        _with_con(_do)

def get_upload(upload_id):
    def _do(con):
        row = con.execute('SELECT id, filename, total_size, received, checksum, status, job_id FROM uploads WHERE id=?', (upload_id,)).fetchone()
        if not row:
            return None
        return {'id': row[0], 'filename': row[1], 'total_size': row[2], 'received': row[3], 'checksum': row[4], 'status': row[5], 'job_id': row[6]}
    with _lock:
        return _with_con(_do)
