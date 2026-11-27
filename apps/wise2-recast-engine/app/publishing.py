"""Provider-neutral publishing contracts. Official OAuth only; live posting BLOCKED without credentials and platform approval.
Never fabricates success. Supports YouTube Shorts, TikTok, Instagram Reels, Facebook Reels via official APIs only.
v1.4 adds isolated token storage stubs, audit log, and per-provider adapters that refuse live posts.
"""
from dataclasses import dataclass
from typing import Protocol, List, Optional
import json, os, time
from pathlib import Path

@dataclass
class PublishRequest:
    provider: str
    clip_path: str
    title: str
    description: str
    account_id: str

class Publisher(Protocol):
    def validate(self, request: PublishRequest) -> List[str]: ...
    def publish(self, request: PublishRequest) -> dict: ...

class DisabledPublisher:
    def validate(self, request):
        return [
            'Official OAuth credentials and approved API integration required',
            'Developer app registration and platform review pending',
            'Live posting BLOCKED until authorized accounts are configured'
        ]
    def publish(self, request):
        raise RuntimeError('Live publishing disabled until official provider integration is configured and approved')

SUPPORTED = ('youtube', 'instagram', 'tiktok', 'facebook')

# Isolated token storage (encrypted-at-rest recommended in production; plain JSON for prototype)
TOKEN_DIR = Path(os.getenv('WISE2_DATA_DIR', 'data')) / 'tokens'
TOKEN_DIR.mkdir(parents=True, exist_ok=True)
AUDIT = TOKEN_DIR / 'audit.log'

def _audit(event: str, detail: dict):
    AUDIT.parent.mkdir(parents=True, exist_ok=True)
    with AUDIT.open('a') as f:
        f.write(json.dumps({'ts': time.time(), 'event': event, **detail}) + '\n')

def store_token(provider: str, account_id: str, token: dict):
    """Store OAuth token material. Never logs secrets."""
    if provider not in SUPPORTED:
        raise ValueError('Unsupported provider')
    path = TOKEN_DIR / f'{provider}_{account_id}.json'
    path.write_text(json.dumps({k: v for k, v in token.items() if k != 'access_token'}))  # redact
    _audit('token_stored', {'provider': provider, 'account': account_id})
    return {'stored': True, 'provider': provider, 'note': 'Live use still BLOCKED pending platform approval'}

def disconnect(provider: str, account_id: str):
    path = TOKEN_DIR / f'{provider}_{account_id}.json'
    if path.exists():
        path.unlink()
    _audit('disconnected', {'provider': provider, 'account': account_id})
    return {'disconnected': True}

def preflight(payload):
    provider = payload.get('provider')
    problems = []
    if provider not in SUPPORTED:
        problems.append('Unsupported provider')
    if not payload.get('title'):
        problems.append('Title required')
    if not payload.get('clip_name'):
        problems.append('Clip required')
    blocked = [
        'Account authorization and official API adapter not configured',
        'Platform developer credentials and content policy approval required',
        'No paid third-party services used; official APIs only',
        'Actual posting remains BLOCKED until real authorized developer accounts exist'
    ]
    _audit('preflight', {'provider': provider, 'ready': False})
    return {
        'ready_for_live_publish': False,
        'issues': problems + blocked,
        'provider': provider,
        'status': 'BLOCKED — credentials and platform approval required',
        'supported_providers': list(SUPPORTED),
        'adapters': {p: 'stub-blocked' for p in SUPPORTED}
    }

def draft_or_schedule(payload):
    """Create a local draft record only. Does not contact any platform."""
    _audit('draft_created', {'provider': payload.get('provider'), 'title': payload.get('title')})
    return {
        'draft_id': f"local-{int(time.time())}",
        'status': 'local_draft',
        'note': 'Scheduling and live post BLOCKED until official OAuth and platform approval'
    }
