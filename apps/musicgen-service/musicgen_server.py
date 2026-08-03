"""MusicGen inference server - Flask API for music generation."""
import logging
import os
import traceback
from typing import Optional, Tuple
from functools import wraps
from datetime import datetime

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from pydantic import ValidationError

from config import settings
from generation_service import MusicGenService, GenerationRequest, GenreType, MoodType
from utils import setup_logging, numpy_to_bytes

# Setup logging
setup_logging("INFO" if not settings.DEBUG else "DEBUG")
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize generation service
service = None


def get_service() -> MusicGenService:
    """Get or initialize MusicGen service."""
    global service
    if service is None:
        service = MusicGenService(device=settings.DEVICE, use_fp16=settings.USE_FP16)
    return service


def require_json(f):
    """Decorator to require JSON content type."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        return f(*args, **kwargs)

    return decorated_function


def handle_errors(f):
    """Decorator to handle common errors."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            return jsonify({"error": "Invalid parameters", "details": e.errors()}), 400
        except ValueError as e:
            logger.error(f"Value error: {e}")
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            logger.error(f"Unexpected error: {e}\n{traceback.format_exc()}")
            return jsonify({"error": "Internal server error", "message": str(e)}), 500

    return decorated_function


# ============================================================================
# Health & Status Endpoints
# ============================================================================


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "service": "musicgen-inference",
        }
    )


@app.route("/status", methods=["GET"])
@handle_errors
def status():
    """Service status endpoint."""
    service = get_service()
    stats = service.get_stats()
    return jsonify(
        {
            "status": "ok",
            "stats": stats,
            "config": {
                "model": settings.MUSICGEN_MODEL,
                "device": settings.DEVICE,
                "use_fp16": settings.USE_FP16,
                "sample_rate": settings.SAMPLE_RATE,
                "max_duration": settings.MAX_DURATION,
            },
        }
    )


# ============================================================================
# Generation Endpoints
# ============================================================================


@app.route("/api/v1/generate", methods=["POST"])
@require_json
@handle_errors
def generate():
    """
    Generate music from text prompt.

    Request body:
    {
        "prompt": "upbeat electronic dance music",
        "duration": 30,
        "genre": "electronic",
        "mood": "energetic",
        "tempo": 120,
        "temperature": 1.0,
        "top_k": 250,
        "top_p": 0.0
    }

    Returns:
        JSON with generation metadata and audio URL
    """
    data = request.get_json()

    # Parse request
    request_obj = GenerationRequest(
        prompt=data.get("prompt"),
        duration=data.get("duration", settings.DEFAULT_DURATION),
        genre=data.get("genre"),
        mood=data.get("mood"),
        tempo=data.get("tempo"),
        key=data.get("key"),
        intensity=data.get("intensity"),
        top_k=data.get("top_k", settings.DEFAULT_TOP_K),
        top_p=data.get("top_p", settings.DEFAULT_TOP_P),
        temperature=data.get("temperature", settings.DEFAULT_TEMPERATURE),
        seed=data.get("seed"),
        num_variants=data.get("num_variants", 1),
        use_conditioning=data.get("use_conditioning", True),
    )

    service = get_service()
    result = service.generate(request_obj)

    return jsonify(
        {
            "success": True,
            "generation_id": result.id,
            "prompt": result.prompt,
            "duration": result.duration,
            "sample_rate": result.sample_rate,
            "genre": result.genre,
            "mood": result.mood,
            "conditioning": result.conditioning,
            "timestamp": result.timestamp,
            "download_url": f"/api/v1/download/{result.id}",
            "audio_size_bytes": len(numpy_to_bytes(result.audio, result.sample_rate)),
        }
    )


@app.route("/api/v1/generate/variants", methods=["POST"])
@require_json
@handle_errors
def generate_variants():
    """
    Generate multiple variants of the same prompt.

    Request body:
    {
        "prompt": "calm ambient music",
        "duration": 30,
        "num_variants": 3
    }

    Returns:
        JSON with list of generation IDs
    """
    data = request.get_json()

    request_obj = GenerationRequest(
        prompt=data.get("prompt"),
        duration=data.get("duration", settings.DEFAULT_DURATION),
        num_variants=data.get("num_variants", 3),
        temperature=data.get("temperature", settings.DEFAULT_TEMPERATURE),
    )

    service = get_service()
    results = service.generate_variants(request_obj)

    return jsonify(
        {
            "success": True,
            "variants": [
                {
                    "generation_id": r.id,
                    "download_url": f"/api/v1/download/{r.id}",
                }
                for r in results
            ],
            "prompt": request_obj.prompt,
        }
    )


@app.route("/api/v1/generate/stream", methods=["POST"])
@require_json
@handle_errors
def generate_stream():
    """
    Generate music with streaming response.

    Streams audio chunks as they are generated.

    Request body:
    {
        "prompt": "upbeat electronic dance music",
        "duration": 30
    }

    Returns:
        Stream of audio chunks (Content-Type: application/octet-stream)
    """
    data = request.get_json()

    request_obj = GenerationRequest(
        prompt=data.get("prompt"),
        duration=data.get("duration", settings.DEFAULT_DURATION),
        temperature=data.get("temperature", settings.DEFAULT_TEMPERATURE),
    )

    service = get_service()

    def stream_audio():
        try:
            for chunk in service.generate_stream(request_obj):
                yield chunk
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            raise

    return Response(
        stream_audio(),
        mimetype="application/octet-stream",
        headers={"Content-Disposition": "attachment; filename=generated_music.wav"},
    )


@app.route("/api/v1/generate/with-narration", methods=["POST"])
@require_json
@handle_errors
def generate_with_narration():
    """
    Generate music with text-to-speech narration overlay.

    Request body:
    {
        "music_prompt": "calm ambient music",
        "narration_text": "Welcome to the podcast",
        "duration": 30
    }

    Returns:
        JSON with generation metadata and download URL
    """
    if not settings.ENABLE_TTS:
        return jsonify({"error": "TTS is not enabled"}), 400

    data = request.get_json()

    service = get_service()
    audio, sr = service.generate_with_narration(
        music_prompt=data.get("music_prompt"),
        narration_text=data.get("narration_text"),
        duration=data.get("duration", settings.DEFAULT_DURATION),
    )

    generation_id = f"narration_{datetime.now().timestamp()}"

    return jsonify(
        {
            "success": True,
            "generation_id": generation_id,
            "music_prompt": data.get("music_prompt"),
            "narration_text": data.get("narration_text"),
            "sample_rate": sr,
            "download_url": f"/api/v1/download/{generation_id}",
        }
    )


# ============================================================================
# Download & Retrieval Endpoints
# ============================================================================


@app.route("/api/v1/download/<generation_id>", methods=["GET"])
@handle_errors
def download_audio(generation_id: str):
    """Download generated audio file."""
    service = get_service()
    result = service.get_result(generation_id)

    if result is None:
        return jsonify({"error": "Generation not found"}), 404

    audio_bytes = numpy_to_bytes(result.audio, result.sample_rate)

    return send_file(
        io.BytesIO(audio_bytes),
        mimetype="audio/wav",
        as_attachment=True,
        download_name=f"generated_{generation_id[:8]}.wav",
    )


@app.route("/api/v1/result/<generation_id>", methods=["GET"])
@handle_errors
def get_result(generation_id: str):
    """Get generation result metadata."""
    service = get_service()
    result = service.get_result(generation_id)

    if result is None:
        return jsonify({"error": "Generation not found"}), 404

    return jsonify(
        {
            "success": True,
            "generation_id": result.id,
            "prompt": result.prompt,
            "duration": result.duration,
            "sample_rate": result.sample_rate,
            "genre": result.genre,
            "mood": result.mood,
            "conditioning": result.conditioning,
            "timestamp": result.timestamp,
            "duration_generated": len(result.audio) / result.sample_rate,
        }
    )


# ============================================================================
# Configuration Endpoints
# ============================================================================


@app.route("/api/v1/config/genres", methods=["GET"])
def get_genres():
    """Get list of supported genres."""
    genres = [g.value for g in GenreType]
    return jsonify({"genres": genres})


@app.route("/api/v1/config/moods", methods=["GET"])
def get_moods():
    """Get list of supported moods."""
    moods = [m.value for m in MoodType]
    return jsonify({"moods": moods})


@app.route("/api/v1/config/parameters", methods=["GET"])
def get_parameters():
    """Get generation parameter defaults and ranges."""
    return jsonify(
        {
            "duration": {
                "default": settings.DEFAULT_DURATION,
                "min": 1,
                "max": settings.MAX_DURATION,
            },
            "temperature": {
                "default": settings.DEFAULT_TEMPERATURE,
                "min": 0.0,
                "max": 2.0,
            },
            "top_k": {
                "default": settings.DEFAULT_TOP_K,
                "min": 0,
                "max": 500,
            },
            "top_p": {
                "default": settings.DEFAULT_TOP_P,
                "min": 0.0,
                "max": 1.0,
            },
            "sample_rate": settings.SAMPLE_RATE,
            "channels": settings.CHANNELS,
        }
    )


# ============================================================================
# Maintenance Endpoints
# ============================================================================


@app.route("/api/v1/cache/clear", methods=["POST"])
@handle_errors
def clear_cache():
    """Clear cached results."""
    service = get_service()
    max_age = request.json.get("max_age_seconds", 3600) if request.is_json else 3600
    cleared = service.clear_cache(max_age_seconds=max_age)

    return jsonify({"success": True, "cleared": cleared})


@app.route("/api/v1/shutdown", methods=["POST"])
@handle_errors
def shutdown():
    """Gracefully shutdown the service."""
    service = get_service()
    service.shutdown()

    return jsonify({"success": True, "message": "Service shutting down"})


# ============================================================================
# Error Handlers
# ============================================================================


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


# ============================================================================
# Startup & Shutdown
# ============================================================================


@app.before_request
def before_request():
    """Pre-request initialization."""
    pass


@app.teardown_appcontext
def shutdown_service(exception=None):
    """Cleanup on app shutdown."""
    global service
    if service:
        service.shutdown()
        service = None


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    logger.info(f"Starting MusicGen Inference Server")
    logger.info(f"  Device: {settings.DEVICE}")
    logger.info(f"  Model: {settings.MUSICGEN_MODEL}")
    logger.info(f"  FP16: {settings.USE_FP16}")
    logger.info(f"  Host: {settings.HOST}:{settings.PORT}")

    if settings.DEBUG:
        # Development server
        app.run(host=settings.HOST, port=settings.PORT, debug=True, threaded=True)
    else:
        # Production server (gunicorn)
        logger.info("Production server - use gunicorn to start")
        logger.info(f"  Command: gunicorn -b {settings.HOST}:{settings.PORT} -w {settings.WORKERS} musicgen_server:app")

# Import io for BytesIO in download handler
import io
