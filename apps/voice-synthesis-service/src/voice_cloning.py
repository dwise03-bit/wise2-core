"""Voice cloning and speaker embedding extraction."""

import torch
import torch.nn.functional as F
import numpy as np
from typing import Tuple, Dict, Optional, List
from pathlib import Path
import librosa
import soundfile as sf
from dataclasses import dataclass
import json
from loguru import logger

from config import config


@dataclass
class SpeakerProfile:
    """Speaker profile with embeddings and metadata."""

    speaker_id: str
    name: str
    embeddings: List[np.ndarray]  # List of embeddings from different samples
    mean_embedding: np.ndarray  # Average embedding
    num_samples: int
    quality_score: float  # 0-1 quality rating
    gender: Optional[str] = None
    age_group: Optional[str] = None
    language: str = "en"
    created_at: str = None

    def to_dict(self) -> dict:
        """Convert to dictionary for serialization."""
        return {
            "speaker_id": self.speaker_id,
            "name": self.name,
            "num_samples": self.num_samples,
            "quality_score": self.quality_score,
            "gender": self.gender,
            "age_group": self.age_group,
            "language": self.language,
            "created_at": self.created_at,
        }


class SpeakerEncoder(torch.nn.Module):
    """Speaker embedding encoder."""

    def __init__(self, embed_dim: int = 256):
        """Initialize encoder."""
        super().__init__()
        self.embed_dim = embed_dim

        # Mel-spectrogram input: [batch, n_mels, time]
        self.conv_stack = torch.nn.Sequential(
            torch.nn.Conv1d(config.audio.n_mels, 128, kernel_size=5, padding=2),
            torch.nn.BatchNorm1d(128),
            torch.nn.ReLU(),
            torch.nn.MaxPool1d(4),
            torch.nn.Conv1d(128, 256, kernel_size=5, padding=2),
            torch.nn.BatchNorm1d(256),
            torch.nn.ReLU(),
            torch.nn.MaxPool1d(4),
            torch.nn.Conv1d(256, 512, kernel_size=5, padding=2),
            torch.nn.BatchNorm1d(512),
            torch.nn.ReLU(),
            torch.nn.AdaptiveAvgPool1d(1),
        )

        self.embedding = torch.nn.Linear(512, embed_dim)

    def forward(self, mel_spectrogram: torch.Tensor) -> torch.Tensor:
        """Extract speaker embedding."""
        x = self.conv_stack(mel_spectrogram)
        x = x.view(x.size(0), -1)
        embedding = F.normalize(self.embedding(x), p=2, dim=1)
        return embedding


class VoiceCloner:
    """Voice cloning system."""

    def __init__(self, device: str = None):
        """Initialize voice cloner."""
        self.device = device or config.device
        logger.info(f"Initializing VoiceCloner on {self.device}")

        # Speaker encoder
        self.encoder = SpeakerEncoder(embed_dim=config.model.speaker_embed_dim).to(self.device)
        self.encoder.eval()

        # Speaker profiles storage
        self.speaker_profiles: Dict[str, SpeakerProfile] = {}
        self.profile_dir = config.data_dir / "speaker_profiles"
        self.profile_dir.mkdir(parents=True, exist_ok=True)

        self._load_speaker_profiles()
        logger.info("VoiceCloner initialized")

    def extract_embedding(self, audio_path: str, sr: int = None) -> np.ndarray:
        """Extract speaker embedding from audio file.

        Args:
            audio_path: Path to audio file
            sr: Sample rate (if None, uses config default)

        Returns:
            Speaker embedding vector
        """
        sr = sr or config.audio.sample_rate

        # Load audio
        waveform, _ = librosa.load(audio_path, sr=sr)

        # Compute mel-spectrogram
        mel = librosa.feature.melspectrogram(
            y=waveform,
            sr=sr,
            n_fft=config.audio.n_fft,
            hop_length=config.audio.hop_length,
            n_mels=config.audio.n_mels,
            fmin=config.audio.f_min,
            fmax=config.audio.f_max,
        )

        # Convert to dB scale and normalize
        mel_db = librosa.power_to_db(mel, ref=np.max)
        mel_normalized = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-9)

        # Extract embedding
        with torch.no_grad():
            mel_tensor = torch.from_numpy(mel_normalized).float().to(self.device).unsqueeze(0)
            embedding = self.encoder(mel_tensor)
            embedding = embedding.cpu().numpy()[0]

        logger.info(f"Extracted embedding from {audio_path}")
        return embedding

    def create_speaker_profile(
        self,
        speaker_id: str,
        audio_files: List[str],
        name: str = None,
        gender: Optional[str] = None,
        age_group: Optional[str] = None,
    ) -> SpeakerProfile:
        """Create speaker profile from audio samples.

        Args:
            speaker_id: Unique speaker identifier
            audio_files: List of audio file paths
            name: Speaker name
            gender: Gender (optional)
            age_group: Age group (optional)

        Returns:
            SpeakerProfile instance
        """
        logger.info(f"Creating speaker profile: {speaker_id} ({len(audio_files)} samples)")

        embeddings = []
        quality_scores = []

        for audio_path in audio_files:
            try:
                embedding = self.extract_embedding(audio_path)
                embeddings.append(embedding)

                # Estimate quality (based on signal energy)
                waveform, sr = librosa.load(audio_path, sr=config.audio.sample_rate)
                energy = np.mean(waveform**2)
                quality = min(1.0, energy * 100)  # Rough quality metric
                quality_scores.append(quality)

            except Exception as e:
                logger.error(f"Error processing {audio_path}: {e}")
                continue

        if not embeddings:
            raise ValueError(f"No valid embeddings extracted for {speaker_id}")

        # Compute mean embedding
        mean_embedding = np.mean(embeddings, axis=0)

        # Average quality score
        avg_quality = np.mean(quality_scores) if quality_scores else 0.5

        profile = SpeakerProfile(
            speaker_id=speaker_id,
            name=name or speaker_id,
            embeddings=embeddings,
            mean_embedding=mean_embedding,
            num_samples=len(embeddings),
            quality_score=avg_quality,
            gender=gender,
            age_group=age_group,
        )

        self.speaker_profiles[speaker_id] = profile
        self._save_speaker_profile(profile)

        logger.info(
            f"Speaker profile created: {speaker_id} "
            f"({len(embeddings)} embeddings, quality={avg_quality:.2f})"
        )
        return profile

    def get_speaker_profile(self, speaker_id: str) -> Optional[SpeakerProfile]:
        """Get speaker profile by ID."""
        return self.speaker_profiles.get(speaker_id)

    def list_speakers(self) -> List[str]:
        """List all available speakers."""
        return list(self.speaker_profiles.keys())

    def compute_speaker_similarity(
        self,
        speaker_id1: str,
        speaker_id2: str,
    ) -> float:
        """Compute similarity between two speakers.

        Args:
            speaker_id1: First speaker ID
            speaker_id2: Second speaker ID

        Returns:
            Cosine similarity (0-1)
        """
        profile1 = self.get_speaker_profile(speaker_id1)
        profile2 = self.get_speaker_profile(speaker_id2)

        if not profile1 or not profile2:
            return 0.0

        # Cosine similarity
        sim = np.dot(profile1.mean_embedding, profile2.mean_embedding) / (
            np.linalg.norm(profile1.mean_embedding)
            * np.linalg.norm(profile2.mean_embedding)
            + 1e-9
        )

        return float(sim)

    def find_similar_speakers(
        self,
        speaker_id: str,
        top_k: int = 5,
    ) -> List[Tuple[str, float]]:
        """Find speakers similar to given speaker.

        Args:
            speaker_id: Reference speaker ID
            top_k: Number of similar speakers to return

        Returns:
            List of (speaker_id, similarity) tuples
        """
        similarities = []

        for other_id in self.list_speakers():
            if other_id != speaker_id:
                sim = self.compute_speaker_similarity(speaker_id, other_id)
                similarities.append((other_id, sim))

        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def _save_speaker_profile(self, profile: SpeakerProfile):
        """Save speaker profile to disk."""
        profile_path = self.profile_dir / f"{profile.speaker_id}.npz"

        np.savez(
            profile_path,
            mean_embedding=profile.mean_embedding,
            num_samples=profile.num_samples,
        )

        # Save metadata as JSON
        metadata_path = self.profile_dir / f"{profile.speaker_id}.json"
        with open(metadata_path, "w") as f:
            json.dump(profile.to_dict(), f, indent=2)

        logger.info(f"Saved speaker profile to {profile_path}")

    def _load_speaker_profiles(self):
        """Load speaker profiles from disk."""
        npz_files = list(self.profile_dir.glob("*.npz"))

        for npz_path in npz_files:
            speaker_id = npz_path.stem
            metadata_path = self.profile_dir / f"{speaker_id}.json"

            if metadata_path.exists():
                try:
                    # Load embedding
                    data = np.load(npz_path)
                    mean_embedding = data["mean_embedding"]

                    # Load metadata
                    with open(metadata_path, "r") as f:
                        metadata = json.load(f)

                    profile = SpeakerProfile(
                        speaker_id=speaker_id,
                        name=metadata.get("name", speaker_id),
                        embeddings=[mean_embedding],
                        mean_embedding=mean_embedding,
                        num_samples=metadata.get("num_samples", 1),
                        quality_score=metadata.get("quality_score", 0.5),
                        gender=metadata.get("gender"),
                        age_group=metadata.get("age_group"),
                        language=metadata.get("language", "en"),
                    )

                    self.speaker_profiles[speaker_id] = profile

                except Exception as e:
                    logger.error(f"Error loading speaker profile {speaker_id}: {e}")

        logger.info(f"Loaded {len(self.speaker_profiles)} speaker profiles")

    def delete_speaker_profile(self, speaker_id: str):
        """Delete speaker profile."""
        if speaker_id in self.speaker_profiles:
            del self.speaker_profiles[speaker_id]

            # Remove files
            (self.profile_dir / f"{speaker_id}.npz").unlink(missing_ok=True)
            (self.profile_dir / f"{speaker_id}.json").unlink(missing_ok=True)

            logger.info(f"Deleted speaker profile: {speaker_id}")

    def get_embedding_vector(self, speaker_id: str) -> Optional[np.ndarray]:
        """Get mean embedding vector for speaker."""
        profile = self.get_speaker_profile(speaker_id)
        return profile.mean_embedding if profile else None

    def compute_embedding_statistics(self, speaker_id: str) -> Dict:
        """Compute statistics about speaker embeddings."""
        profile = self.get_speaker_profile(speaker_id)

        if not profile:
            return {}

        embeddings = np.array(profile.embeddings)

        return {
            "speaker_id": speaker_id,
            "num_embeddings": len(embeddings),
            "mean_magnitude": float(np.mean(np.linalg.norm(embeddings, axis=1))),
            "std_magnitude": float(np.std(np.linalg.norm(embeddings, axis=1))),
            "mean_pairwise_sim": float(
                np.mean(
                    [
                        np.dot(embeddings[i], embeddings[j])
                        / (np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j]) + 1e-9)
                        for i in range(len(embeddings))
                        for j in range(i + 1, len(embeddings))
                    ]
                )
            ),
            "quality_score": profile.quality_score,
        }
