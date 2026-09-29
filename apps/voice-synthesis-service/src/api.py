"""Flask API for voice synthesis service."""

import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pydantic import ValidationError, BaseModel
from loguru import logger

from config import config
from voice_engine import VoiceEngine
from singing_synthesis import SingSynthesizer, Melody, Note
from voice_cloning import VoiceCloner
from voice_parameters import VoiceParameterProcessor, VoiceParameters


# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
log_file = config.logs_dir / f"api_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logger.add(log_file, rotation="500 MB")

# Initialize engines
try:
    voice_engine = VoiceEngine(device=config.device)
    sing_synthesizer = SingSynthesizer(voice_engine)
    voice_cloner = VoiceCloner(device=config.device)
    param_processor = VoiceParameterProcessor()
    logger.info("All engines initialized successfully")
except Exception as e:
    logger.error(f"Error initializing engines: {e}")
    raise


# Request/Response models
class SynthesizeRequest(BaseModel):
    """Text-to-speech synthesis request."""

    text: str
    speaker_id: str = "default"
    emotion: str = "neutral"
    speed: float = 1.0
    pitch_shift: Optional[float] = None


class SingRequest(BaseModel):
    """Singing synthesis request."""

    lyrics: str
    melody: list  # List of note objects
    speaker_id: str = "default"
    vibrato_amount: float = 30.0
    vibrato_rate: float = 5.0
    portamento_time: float = 0.1


class VoiceCloningRequest(BaseModel):
    """Voice cloning request."""

    speaker_id: str
    name: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None


class ParameterRequest(BaseModel):
    """Voice parameter adjustment request."""

    audio_source: str  # URL or speaker_id
    pitch_shift: float = 0.0
    vibrato_amount: float = 30.0
    vibrato_rate: float = 5.0
    breathiness: float = 0.0
    speed: float = 1.0
    formant_shift: float = 0.0
    intensity: float = 1.0
    reverb_amount: float = 0.0
    eq_bass: float = 0.0
    eq_mid: float = 0.0
    eq_treble: float = 0.0


# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "healthy",
            "service": "voice-synthesis",
            "device": config.device,
            "enabled_features": {
                "voice_cloning": config.enable_voice_cloning,
                "singing": config.enable_singing,
                "emotion": config.enable_emotion,
                "cache": config.enable_cache,
            },
        }
    )


# Text-to-speech endpoint
@app.route("/synthesize", methods=["POST"])
def synthesize():
    """Synthesize speech from text.

    Expected JSON:
    {
        "text": "Hello world",
        "speaker_id": "default",
        "emotion": "neutral",
        "speed": 1.0,
        "pitch_shift": 0.0
    }
    """
    try:
        req = SynthesizeRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    logger.info(f"Synthesis request: {req.text}")

    try:
        # Synthesize
        waveform, sr = voice_engine.synthesize(
            text=req.text,
            speaker_id=req.speaker_id,
            emotion=req.emotion,
            speed=req.speed,
        )

        # Apply pitch shift if specified
        if req.pitch_shift:
            waveform = param_processor.apply_pitch_shift(waveform, req.pitch_shift)

        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            voice_engine.save_audio(waveform, f.name)
            audio_path = f.name

        # Return audio file
        return send_file(audio_path, mimetype="audio/wav", as_attachment=True)

    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return jsonify({"error": str(e)}), 500


# Singing synthesis endpoint
@app.route("/sing", methods=["POST"])
def sing():
    """Synthesize singing from lyrics and melody.

    Expected JSON:
    {
        "lyrics": "I love WISE²",
        "melody": [
            {"pitch": 60, "duration": 0.5, "start_time": 0.0},
            {"pitch": 62, "duration": 0.5, "start_time": 0.5}
        ],
        "speaker_id": "default",
        "vibrato_amount": 30.0,
        "vibrato_rate": 5.0
    }
    """
    if not config.enable_singing:
        return jsonify({"error": "Singing synthesis is disabled"}), 403

    try:
        req = SingRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    logger.info(f"Singing request: {req.lyrics}")

    try:
        # Parse melody
        notes = [
            Note.from_midi(int(n["pitch"]), float(n["duration"]), float(n["start_time"]))
            for n in req.melody
        ]
        melody = Melody(notes)

        # Synthesize
        waveform, sr = sing_synthesizer.synthesize_singing(
            lyrics=req.lyrics,
            melody=melody,
            speaker_id=req.speaker_id,
            vibrato_amount=req.vibrato_amount,
            vibrato_rate=req.vibrato_rate,
            portamento_time=req.portamento_time,
        )

        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            sing_synthesizer.save_singing(waveform, f.name)
            audio_path = f.name

        return send_file(audio_path, mimetype="audio/wav", as_attachment=True)

    except Exception as e:
        logger.error(f"Singing synthesis error: {e}")
        return jsonify({"error": str(e)}), 500


# Voice cloning endpoints
@app.route("/clone-voice", methods=["POST"])
def clone_voice():
    """Create speaker profile from audio samples.

    Expected multipart form:
    - speaker_id: Speaker identifier
    - name: Speaker name (optional)
    - gender: male/female/other (optional)
    - age_group: age range (optional)
    - audio_files: Multiple audio files
    """
    if not config.enable_voice_cloning:
        return jsonify({"error": "Voice cloning is disabled"}), 403

    speaker_id = request.form.get("speaker_id")
    if not speaker_id:
        return jsonify({"error": "speaker_id required"}), 400

    # Get audio files
    audio_files = request.files.getlist("audio_files")
    if not audio_files:
        return jsonify({"error": "No audio files provided"}), 400

    logger.info(f"Voice cloning request: {speaker_id} ({len(audio_files)} files)")

    try:
        # Save uploaded files to temporary directory
        temp_paths = []
        for audio_file in audio_files:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                audio_file.save(f.name)
                temp_paths.append(f.name)

        # Create speaker profile
        profile = voice_cloner.create_speaker_profile(
            speaker_id=speaker_id,
            audio_files=temp_paths,
            name=request.form.get("name"),
            gender=request.form.get("gender"),
            age_group=request.form.get("age_group"),
        )

        # Clean up temp files
        for path in temp_paths:
            os.unlink(path)

        return jsonify(
            {
                "success": True,
                "speaker_id": profile.speaker_id,
                "num_samples": profile.num_samples,
                "quality_score": profile.quality_score,
            }
        )

    except Exception as e:
        logger.error(f"Voice cloning error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/speakers", methods=["GET"])
def list_speakers():
    """List all available speaker profiles."""
    speakers = voice_cloner.list_speakers()
    details = []

    for speaker_id in speakers:
        profile = voice_cloner.get_speaker_profile(speaker_id)
        details.append(
            {
                "speaker_id": speaker_id,
                "name": profile.name,
                "num_samples": profile.num_samples,
                "quality_score": profile.quality_score,
            }
        )

    return jsonify({"speakers": details})


@app.route("/speaker/<speaker_id>", methods=["GET"])
def get_speaker(speaker_id):
    """Get speaker profile details."""
    profile = voice_cloner.get_speaker_profile(speaker_id)

    if not profile:
        return jsonify({"error": "Speaker not found"}), 404

    stats = voice_cloner.compute_embedding_statistics(speaker_id)

    return jsonify(
        {
            "speaker_id": profile.speaker_id,
            "name": profile.name,
            "num_samples": profile.num_samples,
            "quality_score": profile.quality_score,
            "gender": profile.gender,
            "age_group": profile.age_group,
            "statistics": stats,
        }
    )


@app.route("/speaker/<speaker_id>", methods=["DELETE"])
def delete_speaker(speaker_id):
    """Delete speaker profile."""
    voice_cloner.delete_speaker_profile(speaker_id)
    return jsonify({"success": True})


# Voice parameter endpoints
@app.route("/apply-parameters", methods=["POST"])
def apply_parameters():
    """Apply voice parameters to audio.

    Expected JSON:
    {
        "audio_source": "speaker_id or audio_url",
        "pitch_shift": 0.0,
        "vibrato_amount": 30.0,
        ...
    }
    """
    try:
        req = ParameterRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    logger.info(f"Parameter application request: {req.audio_source}")

    try:
        # Create parameters object
        params = VoiceParameters(
            pitch_shift=req.pitch_shift,
            vibrato_amount=req.vibrato_amount,
            vibrato_rate=req.vibrato_rate,
            breathiness=req.breathiness,
            speed=req.speed,
            formant_shift=req.formant_shift,
            intensity=req.intensity,
            reverb_amount=req.reverb_amount,
            eq_bass=req.eq_bass,
            eq_mid=req.eq_mid,
            eq_treble=req.eq_treble,
        )

        # Load source audio
        # (placeholder - could load from file/speaker/URL)
        waveform = np.random.randn(44100)  # Placeholder

        # Apply parameters
        processed = param_processor.apply_all_parameters(waveform, params)

        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            voice_engine.save_audio(processed, f.name)
            audio_path = f.name

        return send_file(audio_path, mimetype="audio/wav", as_attachment=True)

    except Exception as e:
        logger.error(f"Parameter application error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/presets", methods=["GET"])
def get_presets():
    """Get available voice character presets."""
    characters = ["breathy", "raspy", "clear", "warm", "powerful", "soft"]
    presets = {}

    for character in characters:
        params = param_processor.get_preset(character)
        presets[character] = params.to_dict()

    return jsonify({"presets": presets})


# Status endpoint
@app.route("/status", methods=["GET"])
def status():
    """Get service status."""
    speakers = voice_cloner.list_speakers()

    return jsonify(
        {
            "service": "voice-synthesis",
            "status": "running",
            "device": config.device,
            "speakers": len(speakers),
            "config": config.to_dict(),
        }
    )


# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors."""
    logger.error(f"Server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    logger.info(f"Starting Voice Synthesis API on {config.api_host}:{config.api_port}")
    app.run(
        host=config.api_host,
        port=config.api_port,
        debug=config.debug,
        threaded=True,
    )
