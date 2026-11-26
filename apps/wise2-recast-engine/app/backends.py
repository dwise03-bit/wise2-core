"""Backward-compatible facade re-exporting WISE² GPU Manager."""
from .gpu_manager import (  # noqa: F401
    DEFAULT_BACKENDS,
    OPENJUTSU_REQUIRED_PACKS,
    _http_json,
    configure_backend,
    get_backend,
    list_backends,
    probe_comfyui,
    run_connection_diagnostics,
    select_best_backend,
)
