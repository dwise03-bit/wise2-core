"""Music generation service using Meta's MusicGen."""
import logging
import uuid
import numpy as np
import torch
import torchaudio
from typing import Optional, List, Tuple, Dict, Generator
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import asyncio
from queue import Queue, Empty
import threading

from config import settings, validate_duration, validate_temperature, validate_top_p
from utils import AudioBuffer, normalize_audio, numpy_to_bytes, create_conditioning_vector
from voice_synthesis import VoiceSynthesizer

logger = logging.getLogger(__name__)


class GenreType(str, Enum):
    """Supported music genres."""

    AMBIENT = "ambient"
    CLASSICAL = "classical"
    ELECTRONIC = "electronic"
    JAZZ = "jazz"
    POP = "pop"
    ROCK = "rock"
    HIPHOP = "hiphop"
    FOLK = "folk"
    METAL = "metal"
    ORCHESTRAL = "orchestral"


class MoodType(str, Enum):
    """Supported moods."""

    HAPPY = "happy"
    SAD = "sad"
    ENERGETIC = "energetic"
    CALM = "calm"
    DRAMATIC = "dramatic"
    MYSTERIOUS = "mysterious"
    PEACEFUL = "peaceful"
    UPLIFTING = "uplifting"


@dataclass
class GenerationRequest:
    """Music generation request parameters."""

    prompt: str
    duration: int = 30
    genre: Optional[str] = None
    mood: Optional[str] = None
    tempo: Optional[int] = None
    key: Optional[str] = None
    intensity: Optional[float] = None
    top_k: int = settings.DEFAULT_TOP_K
    top_p: float = settings.DEFAULT_TOP_P
    temperature: float = settings.DEFAULT_TEMPERATURE
    seed: Optional[int] = None
    num_variants: int = 1
    use_conditioning: bool = True
    voice_prompt: Optional[str] = None

    def validate(self) -> None:
        """Validate generation parameters."""
        if not self.prompt or len(self.prompt.strip()) == 0:
            raise ValueError("Prompt cannot be empty")

        self.duration = validate_duration(self.duration)
        self.temperature = validate_temperature(self.temperature)
        self.top_p = validate_top_p(self.top_p)
        self.num_variants = max(1, min(self.num_variants, 4))

        if self.seed is not None and self.seed < 0:
            self.seed = None


@dataclass
class GenerationResult:
    """Music generation result."""

    id: str
    prompt: str
    duration: int
    sample_rate: int
    audio: np.ndarray
    conditioning: Dict
    timestamp: str
    genre: Optional[str] = None
    mood: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            **asdict(self),
            "audio": numpy_to_bytes(self.audio, self.sample_rate),
            "duration_generated": len(self.audio) / self.sample_rate,
        }


class MusicGenService:
    """Service for music generation using MusicGen."""

    def __init__(self, device: str = "cuda", use_fp16: bool = True):
        """Initialize MusicGen service."""
        self.device = device
        self.use_fp16 = use_fp16
        self.dtype = torch.float16 if use_fp16 else torch.float32

        # Models
        self.processor = None
        self.model = None
        self.voice_synthesizer = None

        # Generation state
        self.generation_queue = Queue(maxsize=settings.MAX_QUEUE_SIZE)
        self.active_generations: Dict[str, bool] = {}
        self.results_cache: Dict[str, GenerationResult] = {}

        logger.info(f"Initialized MusicGenService on {device} with fp16={use_fp16}")

    def _load_model(self) -> None:
        """Load MusicGen model."""
        if self.model is not None:
            return

        try:
            logger.info(f"Loading {settings.MUSICGEN_MODEL}...")
            self.processor = AutoProcessor.from_pretrained(settings.MUSICGEN_MODEL)
            self.model = MusicgenForConditionalGeneration.from_pretrained(
                settings.MUSICGEN_MODEL
            )

            if self.use_fp16:
                self.model = self.model.to(self.dtype)

            self.model = self.model.to(self.device)
            self.model.eval()

            logger.info(f"Model loaded successfully: {settings.MUSICGEN_MODEL}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def _load_voice_synthesizer(self) -> None:
        """Load voice synthesizer for narration."""
        if not settings.ENABLE_TTS or self.voice_synthesizer is not None:
            return

        try:
            self.voice_synthesizer = VoiceSynthesizer(
                device=self.device, use_fp16=self.use_fp16
            )
            logger.info("Voice synthesizer initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize voice synthesizer: {e}")

    def generate(self, request: GenerationRequest) -> GenerationResult:
        """
        Generate music from text prompt.

        Args:
            request: GenerationRequest with parameters

        Returns:
            GenerationResult with generated audio
        """
        request.validate()
        self._load_model()

        generation_id = str(uuid.uuid4())
        self.active_generations[generation_id] = True

        try:
            logger.info(f"Starting generation {generation_id}: {request.prompt[:50]}...")

            # Prepare inputs
            inputs = self.processor(
                text=[request.prompt],
                padding=True,
                return_tensors="pt",
            )

            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Set random seed if specified
            if request.seed is not None:
                torch.manual_seed(request.seed)
                np.random.seed(request.seed)

            # Generate with specified parameters
            max_new_tokens = int(request.duration * settings.SAMPLE_RATE / 256)

            with torch.no_grad():
                audio = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    do_sample=True,
                    top_k=request.top_k,
                    top_p=request.top_p,
                    temperature=request.temperature,
                )

            # Convert to numpy
            audio = audio.squeeze().cpu().numpy()

            # Normalize
            audio = normalize_audio(audio)

            # Create conditioning vector
            conditioning = (
                create_conditioning_vector(
                    genre=request.genre,
                    mood=request.mood,
                    tempo=request.tempo,
                    key=request.key,
                    intensity=request.intensity,
                )
                if request.use_conditioning
                else {}
            )

            # Create result
            result = GenerationResult(
                id=generation_id,
                prompt=request.prompt,
                duration=request.duration,
                sample_rate=settings.SAMPLE_RATE,
                audio=audio,
                conditioning=conditioning,
                timestamp=datetime.now().isoformat(),
                genre=request.genre,
                mood=request.mood,
            )

            # Cache result
            self.results_cache[generation_id] = result

            logger.info(f"Generation complete: {generation_id}")
            return result

        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise
        finally:
            self.active_generations.pop(generation_id, None)

    def generate_variants(self, request: GenerationRequest) -> List[GenerationResult]:
        """
        Generate multiple variants of the same prompt.

        Args:
            request: GenerationRequest with num_variants

        Returns:
            List of GenerationResults
        """
        results = []

        for i in range(request.num_variants):
            # Create variant request with different seed
            variant_request = GenerationRequest(
                **{**asdict(request), "seed": request.seed + i if request.seed else i}
            )
            result = self.generate(variant_request)
            results.append(result)

        return results

    def generate_stream(
        self, request: GenerationRequest
    ) -> Generator[bytes, None, None]:
        """
        Generate music with streaming output.

        Yields audio chunks as generation progresses.

        Args:
            request: GenerationRequest

        Yields:
            Audio bytes in chunks
        """
        request.validate()
        self._load_model()

        try:
            logger.info(f"Starting streaming generation: {request.prompt[:50]}...")

            # Prepare inputs
            inputs = self.processor(
                text=[request.prompt],
                padding=True,
                return_tensors="pt",
            )

            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            if request.seed is not None:
                torch.manual_seed(request.seed)

            max_new_tokens = int(request.duration * settings.SAMPLE_RATE / 256)

            # Generate with streaming
            audio_buffer = AudioBuffer(sr=settings.SAMPLE_RATE)
            chunk_samples = int(settings.CHUNK_DURATION * settings.SAMPLE_RATE)

            with torch.no_grad():
                audio = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    do_sample=True,
                    top_k=request.top_k,
                    top_p=request.top_p,
                    temperature=request.temperature,
                )

            # Convert and stream chunks
            audio = audio.squeeze().cpu().numpy()
            audio = normalize_audio(audio)
            audio_buffer.add_chunk(audio)

            while True:
                chunk = audio_buffer.get_chunk(settings.CHUNK_DURATION)
                if chunk is None:
                    break

                # Convert chunk to bytes
                chunk_bytes = numpy_to_bytes(chunk, settings.SAMPLE_RATE)
                yield chunk_bytes

            logger.info("Streaming generation complete")

        except Exception as e:
            logger.error(f"Streaming generation failed: {e}")
            raise

    def generate_with_narration(
        self, music_prompt: str, narration_text: str, duration: int = 30
    ) -> Tuple[np.ndarray, int]:
        """
        Generate music with text-to-speech narration overlay.

        Args:
            music_prompt: Prompt for music generation
            narration_text: Text to synthesize as narration
            duration: Total duration

        Returns:
            Tuple of (combined_audio, sample_rate)
        """
        self._load_voice_synthesizer()

        # Generate music
        music_request = GenerationRequest(prompt=music_prompt, duration=duration)
        music_result = self.generate(music_request)

        # Generate narration
        if self.voice_synthesizer:
            narration_audio, narration_sr = self.voice_synthesizer.synthesize(
                narration_text
            )

            # Resample narration if needed
            if narration_sr != settings.SAMPLE_RATE:
                narration_audio = np.interp(
                    np.linspace(0, 1, int(len(narration_audio) * settings.SAMPLE_RATE / narration_sr)),
                    np.linspace(0, 1, len(narration_audio)),
                    narration_audio,
                )

            # Mix music and narration (narration at 70% volume, music at 50%)
            combined = music_result.audio * 0.5 + narration_audio * 0.7
            combined = normalize_audio(combined)

            return combined, settings.SAMPLE_RATE
        else:
            return music_result.audio, settings.SAMPLE_RATE

    def get_result(self, generation_id: str) -> Optional[GenerationResult]:
        """Get cached generation result."""
        return self.results_cache.get(generation_id)

    def clear_cache(self, max_age_seconds: int = 3600) -> int:
        """Clear old cached results."""
        now = datetime.now()
        to_delete = []

        for gen_id, result in self.results_cache.items():
            result_time = datetime.fromisoformat(result.timestamp)
            age = (now - result_time).total_seconds()

            if age > max_age_seconds:
                to_delete.append(gen_id)

        for gen_id in to_delete:
            del self.results_cache[gen_id]

        logger.info(f"Cleared {len(to_delete)} cached results")
        return len(to_delete)

    def get_stats(self) -> dict:
        """Get service statistics."""
        return {
            "active_generations": len(
                [v for v in self.active_generations.values() if v]
            ),
            "queue_size": self.generation_queue.qsize(),
            "cached_results": len(self.results_cache),
            "model_loaded": self.model is not None,
            "voice_synthesizer_loaded": self.voice_synthesizer is not None,
            "device": str(self.device),
            "dtype": str(self.dtype),
        }

    def shutdown(self) -> None:
        """Shutdown service and free resources."""
        logger.info("Shutting down MusicGenService...")

        # Clear models
        if self.model:
            del self.model
            self.model = None

        if self.voice_synthesizer:
            self.voice_synthesizer.clear_cache()
            self.voice_synthesizer = None

        if self.processor:
            del self.processor
            self.processor = None

        torch.cuda.empty_cache()
        logger.info("Shutdown complete")
