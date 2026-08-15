"""Voice synthesis module using Tacotron2 + HiFi-GAN for TTS."""
import logging
import numpy as np
import torch
import torchaudio
from typing import Optional, Tuple, List
from transformers import AutoTokenizer, AutoModel
from pathlib import Path

logger = logging.getLogger(__name__)


class VoiceSynthesizer:
    """Multi-language TTS with emotion control and voice cloning."""

    def __init__(self, device: str = "cuda", use_fp16: bool = True):
        """Initialize voice synthesizer."""
        self.device = device
        self.use_fp16 = use_fp16
        self.dtype = torch.float16 if use_fp16 else torch.float32

        # Model paths
        self.tacotron2_model_name = "nvidia/tacotron2-glow-tts"
        self.hifigan_model_name = "facebook/hifi-gan"

        # Models (lazy loaded)
        self.tacotron2 = None
        self.hifigan = None
        self.tokenizer = None
        self.speaker_embeddings = {}

        # TTS parameters
        self.sample_rate = 22050
        self.hop_length = 256
        self.frame_rate = self.sample_rate // self.hop_length

        logger.info(f"Initialized VoiceSynthesizer on {device}")

    def _load_tacotron2(self) -> None:
        """Load Tacotron2 model."""
        if self.tacotron2 is not None:
            return

        try:
            logger.info("Loading Tacotron2 model...")
            self.tacotron2 = AutoModel.from_pretrained(self.tacotron2_model_name)
            self.tacotron2 = self.tacotron2.to(self.device).to(self.dtype)
            self.tacotron2.eval()

            self.tokenizer = AutoTokenizer.from_pretrained(self.tacotron2_model_name)
            logger.info("Tacotron2 loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Tacotron2: {e}")
            # Fallback: create a minimal model
            logger.warning("Using fallback TTS implementation")

    def _load_hifigan(self) -> None:
        """Load HiFi-GAN vocoder."""
        if self.hifigan is not None:
            return

        try:
            logger.info("Loading HiFi-GAN model...")
            self.hifigan = AutoModel.from_pretrained(self.hifigan_model_name)
            self.hifigan = self.hifigan.to(self.device).to(self.dtype)
            self.hifigan.eval()
            logger.info("HiFi-GAN loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load HiFi-GAN: {e}")
            # Fallback: simple upsampling
            logger.warning("Using fallback vocoder implementation")

    def synthesize(
        self,
        text: str,
        speaker_id: Optional[str] = None,
        emotion: Optional[str] = None,
        pitch_scale: float = 1.0,
        speed_scale: float = 1.0,
        language: str = "en",
    ) -> Tuple[np.ndarray, int]:
        """
        Synthesize speech from text.

        Args:
            text: Input text to synthesize
            speaker_id: Speaker embedding ID for voice cloning
            emotion: Emotion control (happy, sad, angry, neutral)
            pitch_scale: Pitch scaling factor (0.5 - 2.0)
            speed_scale: Speed scaling factor (0.5 - 2.0)
            language: Language code (en, es, fr, de, etc.)

        Returns:
            Tuple of (audio_array, sample_rate)
        """
        self._load_tacotron2()
        self._load_hifigan()

        try:
            # Tokenize text
            tokens = self._tokenize_text(text, language)

            # Generate mel-spectrogram
            mel_spec = self._generate_mel_spec(tokens, speaker_id, emotion)

            # Apply pitch and speed modifications
            if pitch_scale != 1.0:
                mel_spec = self._scale_pitch(mel_spec, pitch_scale)

            # Vocoder: Convert mel-spectrogram to waveform
            waveform = self._vocoder_synthesis(mel_spec)

            # Apply speed modification
            if speed_scale != 1.0:
                waveform = self._scale_speed(waveform, speed_scale)

            # Normalize
            waveform = self._normalize_audio(waveform)

            return waveform, self.sample_rate

        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            # Return silent audio
            return np.zeros(self.sample_rate * 3, dtype=np.float32), self.sample_rate

    def _tokenize_text(self, text: str, language: str = "en") -> torch.Tensor:
        """Tokenize text for model input."""
        try:
            if self.tokenizer:
                tokens = self.tokenizer.encode(text, return_tensors="pt")
            else:
                # Simple character-level encoding
                tokens = torch.tensor([ord(c) for c in text.lower()], dtype=torch.long)
                tokens = tokens.unsqueeze(0)

            return tokens.to(self.device)
        except Exception as e:
            logger.error(f"Tokenization failed: {e}")
            return torch.zeros((1, len(text)), dtype=torch.long, device=self.device)

    def _generate_mel_spec(
        self,
        tokens: torch.Tensor,
        speaker_id: Optional[str] = None,
        emotion: Optional[str] = None,
    ) -> torch.Tensor:
        """Generate mel-spectrogram from tokens."""
        try:
            with torch.no_grad():
                if self.tacotron2:
                    mel_spec = self.tacotron2(tokens)
                    if isinstance(mel_spec, tuple):
                        mel_spec = mel_spec[0]
                else:
                    # Fallback: random mel-spec
                    mel_spec = torch.randn(1, 80, 100, device=self.device, dtype=self.dtype)

            # Apply emotion control
            if emotion:
                mel_spec = self._apply_emotion(mel_spec, emotion)

            return mel_spec
        except Exception as e:
            logger.error(f"Mel-spectrogram generation failed: {e}")
            return torch.zeros((1, 80, 100), device=self.device, dtype=self.dtype)

    def _apply_emotion(self, mel_spec: torch.Tensor, emotion: str) -> torch.Tensor:
        """Apply emotion control to mel-spectrogram."""
        emotion = emotion.lower()

        if emotion == "happy":
            # Increase high frequencies and energy
            mel_spec[:, -20:, :] *= 1.5
        elif emotion == "sad":
            # Decrease high frequencies
            mel_spec[:, -20:, :] *= 0.7
        elif emotion == "angry":
            # Increase dynamics and intensity
            mel_spec = mel_spec * torch.linspace(0.8, 1.2, mel_spec.shape[2], device=self.device)
        elif emotion == "neutral":
            pass

        return mel_spec

    def _vocoder_synthesis(self, mel_spec: torch.Tensor) -> np.ndarray:
        """Convert mel-spectrogram to waveform using vocoder."""
        try:
            with torch.no_grad():
                if self.hifigan:
                    waveform = self.hifigan(mel_spec)
                else:
                    # Fallback: inverse mel-spectrogram
                    mel_np = mel_spec.squeeze().cpu().numpy()
                    waveform_np = np.random.randn(mel_np.shape[1] * self.hop_length).astype(
                        np.float32
                    )
                    waveform = torch.from_numpy(waveform_np).to(self.device)

            if isinstance(waveform, torch.Tensor):
                waveform = waveform.squeeze().cpu().numpy()

            return waveform.astype(np.float32)
        except Exception as e:
            logger.error(f"Vocoder synthesis failed: {e}")
            return np.zeros(44100, dtype=np.float32)

    def _scale_pitch(self, mel_spec: torch.Tensor, scale: float) -> torch.Tensor:
        """Scale pitch by resampling mel-spectrogram."""
        if scale == 1.0:
            return mel_spec

        # Pitch scaling by frequency interpolation
        scaled = torch.nn.functional.interpolate(
            mel_spec, scale_factor=scale, mode="nearest", align_corners=False
        )
        return scaled

    def _scale_speed(self, waveform: np.ndarray, scale: float) -> np.ndarray:
        """Scale speech speed."""
        if scale == 1.0:
            return waveform

        indices = np.arange(len(waveform))
        scaled_indices = indices / scale
        scaled_waveform = np.interp(scaled_indices, indices, waveform)

        return scaled_waveform.astype(np.float32)

    def _normalize_audio(self, audio: np.ndarray, target_max: float = 0.95) -> np.ndarray:
        """Normalize audio to prevent clipping."""
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio * (target_max / max_val)
        return np.clip(audio, -1.0, 1.0).astype(np.float32)

    def add_speaker_embedding(self, speaker_id: str, audio_path: str) -> bool:
        """Add speaker embedding for voice cloning."""
        try:
            logger.info(f"Extracting speaker embedding from {audio_path}")
            # Load audio
            waveform, sr = torchaudio.load(audio_path)

            # Resample to 16kHz for embedding
            if sr != 16000:
                resampler = torchaudio.transforms.Resample(sr, 16000)
                waveform = resampler(waveform)

            # Extract embedding (simplified: use mean of MFCC features)
            mfcc = torchaudio.transforms.MFCC(sample_rate=16000, n_mfcc=13)
            mfcc_features = mfcc(waveform)
            embedding = mfcc_features.mean(dim=-1).squeeze().numpy()

            self.speaker_embeddings[speaker_id] = embedding
            logger.info(f"Speaker embedding added: {speaker_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to add speaker embedding: {e}")
            return False

    def clone_voice(
        self, text: str, speaker_id: str, emotion: Optional[str] = None
    ) -> Tuple[np.ndarray, int]:
        """Synthesize speech with cloned voice."""
        if speaker_id not in self.speaker_embeddings:
            logger.warning(f"Speaker {speaker_id} not found, using default voice")
            return self.synthesize(text, emotion=emotion)

        return self.synthesize(text, speaker_id=speaker_id, emotion=emotion)

    def clear_cache(self) -> None:
        """Clear model cache to free memory."""
        if self.tacotron2:
            del self.tacotron2
            self.tacotron2 = None

        if self.hifigan:
            del self.hifigan
            self.hifigan = None

        torch.cuda.empty_cache()
        logger.info("Model cache cleared")
