"""Core voice synthesis engine using Tacotron2 + HiFi-GAN vocoder."""

import torch
import torch.nn.functional as F
import numpy as np
from typing import Tuple, Dict, Optional, List
from pathlib import Path
import librosa
import soundfile as sf
from loguru import logger

from config import config


class TextEncoder:
    """Convert text to phoneme sequence."""

    def __init__(self):
        """Initialize text encoder."""
        try:
            from g2p_en import G2p

            self.g2p = G2p()
        except ImportError:
            logger.warning("g2p_en not available, using phonemizer")
            self.use_phonemizer = True
            from phonemizer.backend import EspeakBackend

            self.phonemizer = EspeakBackend("en-us")
        else:
            self.use_phonemizer = False

        # Phoneme vocabulary
        self.phonemes = (
            " PAD EOS BOS ^".split()
            + list("AEIOUaeiouNOkhpCDFGHJKLMPQRSTVWXYZngVfzZtdDvBS".split())
        )
        self.char2idx = {char: idx for idx, char in enumerate(self.phonemes)}
        self.idx2char = {idx: char for char, idx in self.char2idx.items()}

    def encode(self, text: str) -> np.ndarray:
        """Convert text to phoneme indices."""
        # Clean text
        text = text.lower().strip()

        # Convert to phonemes
        if self.use_phonemizer:
            phonemes = self.phonemizer.phonemize([text])[0].split()
        else:
            phonemes = self.g2p(text)

        # Convert to indices
        indices = []
        for phoneme in phonemes:
            if phoneme in self.char2idx:
                indices.append(self.char2idx[phoneme])
            else:
                logger.warning(f"Unknown phoneme: {phoneme}")

        return np.array(indices, dtype=np.int64)

    def decode(self, indices: np.ndarray) -> str:
        """Convert phoneme indices back to phonemes."""
        phonemes = [self.idx2char.get(idx, "UNK") for idx in indices]
        return "".join(phonemes)


class Tacotron2Encoder(torch.nn.Module):
    """Simplified Tacotron2 text encoder."""

    def __init__(self, vocab_size: int, hidden_dim: int = 512):
        """Initialize encoder."""
        super().__init__()
        self.vocab_size = vocab_size
        self.hidden_dim = hidden_dim

        self.embedding = torch.nn.Embedding(vocab_size, hidden_dim)
        self.convolutions = torch.nn.ModuleList(
            [
                torch.nn.Conv1d(
                    hidden_dim,
                    hidden_dim,
                    kernel_size=5,
                    padding=2,
                    dilation=1,
                )
                for _ in range(3)
            ]
        )
        self.batch_norms = torch.nn.ModuleList(
            [torch.nn.BatchNorm1d(hidden_dim) for _ in range(3)]
        )
        self.lstm = torch.nn.LSTM(
            hidden_dim, hidden_dim, num_layers=1, batch_first=True, bidirectional=True
        )

    def forward(self, sequences: torch.Tensor, lengths: Optional[torch.Tensor] = None):
        """Encode text sequences to acoustic features."""
        # Embed
        embeddings = self.embedding(sequences)  # [batch, seq_len, hidden_dim]

        # Apply convolutions
        x = embeddings.transpose(1, 2)  # [batch, hidden_dim, seq_len]
        for conv, bn in zip(self.convolutions, self.batch_norms):
            x = conv(x)
            x = bn(x)
            x = F.relu(x)

        x = x.transpose(1, 2)  # [batch, seq_len, hidden_dim]

        # Apply LSTM
        if lengths is not None:
            x = torch.nn.utils.rnn.pack_padded_sequence(
                x, lengths.cpu(), batch_first=True, enforce_sorted=False
            )
        outputs, _ = self.lstm(x)
        if lengths is not None:
            outputs, _ = torch.nn.utils.rnn.pad_packed_sequence(outputs, batch_first=True)

        return outputs


class Tacotron2Decoder(torch.nn.Module):
    """Simplified Tacotron2 decoder with attention."""

    def __init__(self, hidden_dim: int = 1024, mel_dim: int = 80):
        """Initialize decoder."""
        super().__init__()
        self.hidden_dim = hidden_dim
        self.mel_dim = mel_dim

        self.prenet = torch.nn.Sequential(
            torch.nn.Linear(mel_dim, 256),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.5),
            torch.nn.Linear(256, 256),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.5),
        )

        self.attention_lstm = torch.nn.LSTMCell(256 + hidden_dim, hidden_dim)
        self.attention_layer = torch.nn.Linear(hidden_dim, 1)
        self.decoder_lstm = torch.nn.LSTMCell(hidden_dim + hidden_dim, hidden_dim)

        self.mel_projection = torch.nn.Linear(hidden_dim, mel_dim)
        self.stop_projection = torch.nn.Linear(hidden_dim, 1)

    def forward(self, encoder_outputs: torch.Tensor, max_steps: int = 1000):
        """Decode encoder outputs to mel-spectrograms."""
        batch_size = encoder_outputs.size(0)
        device = encoder_outputs.device

        # Initialize decoder state
        mel_output = torch.zeros(
            batch_size, 1, self.mel_dim, device=device, dtype=torch.float32
        )
        decoder_hidden = torch.zeros(batch_size, self.hidden_dim, device=device)
        decoder_cell = torch.zeros(batch_size, self.hidden_dim, device=device)
        attention_hidden = torch.zeros(batch_size, self.hidden_dim, device=device)
        attention_cell = torch.zeros(batch_size, self.hidden_dim, device=device)

        mel_outputs = []
        stop_outputs = []
        attention_weights = []

        for step in range(max_steps):
            # Prenet
            mel_input = self.prenet(mel_output[:, -1, :])

            # Attention
            attention_rnn_input = torch.cat([mel_input, decoder_hidden], dim=1)
            attention_hidden, attention_cell = self.attention_lstm(
                attention_rnn_input, (attention_hidden, attention_cell)
            )

            # Compute attention weights
            attention_scores = self.attention_layer(attention_hidden).squeeze(-1)
            attention_scores = torch.softmax(attention_scores, dim=1)
            attention_weights.append(attention_scores)

            # Apply attention
            context = torch.sum(encoder_outputs * attention_scores.unsqueeze(-1), dim=1)

            # Decoder
            decoder_input = torch.cat([attention_hidden, context], dim=1)
            decoder_hidden, decoder_cell = self.decoder_lstm(
                decoder_input, (decoder_hidden, decoder_cell)
            )

            # Predict mel
            mel_pred = self.mel_projection(decoder_hidden).unsqueeze(1)
            stop_pred = self.stop_projection(decoder_hidden)

            mel_outputs.append(mel_pred)
            stop_outputs.append(stop_pred)

            # Stop condition
            if torch.sigmoid(stop_pred).mean() > 0.5:
                break

            mel_output = mel_pred

        mel_outputs = torch.cat(mel_outputs, dim=1)
        stop_outputs = torch.cat(stop_outputs, dim=1)
        attention_weights = torch.stack(attention_weights, dim=1)

        return mel_outputs, stop_outputs, attention_weights


class HiFiGANVocoder(torch.nn.Module):
    """HiFi-GAN neural vocoder for mel-to-waveform conversion."""

    def __init__(self, mel_dim: int = 80, hidden_channels: int = 192):
        """Initialize vocoder."""
        super().__init__()
        self.mel_dim = mel_dim
        self.hidden_channels = hidden_channels

        # Pre-processing
        self.mel_dense = torch.nn.Linear(mel_dim, hidden_channels)

        # Residual blocks
        self.residual_blocks = torch.nn.ModuleList(
            [
                self._make_residual_block(hidden_channels, 3, dilation)
                for dilation in [1, 2, 4, 8, 16]
            ]
        )

        # Post-processing
        self.post_conv = torch.nn.Conv1d(hidden_channels, hidden_channels, 3, padding=1)
        self.output_conv = torch.nn.Conv1d(hidden_channels, 1, 7, padding=3)

    def _make_residual_block(self, channels: int, kernel_size: int, dilation: int):
        """Create residual block."""
        return torch.nn.Sequential(
            torch.nn.Conv1d(
                channels, channels, kernel_size, dilation=dilation, padding=dilation * (kernel_size - 1) // 2
            ),
            torch.nn.ReLU(),
            torch.nn.Conv1d(channels, channels, 1),
        )

    def forward(self, mel: torch.Tensor) -> torch.Tensor:
        """Convert mel-spectrogram to waveform."""
        # [batch, mel_dim, time] -> [batch, hidden_channels, time]
        x = self.mel_dense(mel.transpose(1, 2)).transpose(1, 2)

        # Residual blocks
        for residual_block in self.residual_blocks:
            x = x + residual_block(x)

        # Post-processing
        x = self.post_conv(x)
        x = torch.tanh(x)

        # Output
        x = self.output_conv(x)
        x = torch.tanh(x)

        return x.squeeze(1)


class VoiceEngine:
    """Main voice synthesis engine."""

    def __init__(self, device: str = None):
        """Initialize voice engine."""
        self.device = device or config.device
        logger.info(f"Initializing VoiceEngine on {self.device}")

        # Text encoder
        self.text_encoder = TextEncoder()

        # Tacotron2 components
        vocab_size = len(self.text_encoder.phonemes)
        self.encoder = Tacotron2Encoder(
            vocab_size=vocab_size, hidden_dim=config.model.encoder_hidden_dim
        ).to(self.device)
        self.decoder = Tacotron2Decoder(
            hidden_dim=config.model.decoder_hidden_dim, mel_dim=config.audio.n_mels
        ).to(self.device)

        # Vocoder
        self.vocoder = HiFiGANVocoder(
            mel_dim=config.audio.n_mels, hidden_channels=192
        ).to(self.device)

        # Emotion conditioning
        self.emotion_embedding = torch.nn.Embedding(4, config.model.encoder_hidden_dim).to(self.device)
        self.emotion_map = {"neutral": 0, "happy": 1, "sad": 2, "angry": 3}

        # Speaker embedding (placeholder)
        self.speaker_embedding_dim = config.model.speaker_embed_dim
        self.speaker_embeddings = {}

        self.eval_mode()
        logger.info("VoiceEngine initialized successfully")

    def eval_mode(self):
        """Set models to evaluation mode."""
        self.encoder.eval()
        self.decoder.eval()
        self.vocoder.eval()

    def train_mode(self):
        """Set models to training mode."""
        self.encoder.train()
        self.decoder.train()
        self.vocoder.train()

    def synthesize(
        self,
        text: str,
        speaker_id: str = "default",
        emotion: str = "neutral",
        speed: float = 1.0,
    ) -> Tuple[np.ndarray, int]:
        """Synthesize speech from text.

        Args:
            text: Input text to synthesize
            speaker_id: Speaker ID (for voice cloning)
            emotion: Emotion category (neutral, happy, sad, angry)
            speed: Speech speed multiplier

        Returns:
            Tuple of (waveform, sample_rate)
        """
        logger.info(f"Synthesizing: '{text}' (speaker={speaker_id}, emotion={emotion})")

        with torch.no_grad():
            # Encode text
            phoneme_indices = self.text_encoder.encode(text)
            phoneme_tensor = torch.from_numpy(phoneme_indices).long().to(self.device).unsqueeze(0)

            # Encode with emotion conditioning
            emotion_idx = self.emotion_map.get(emotion.lower(), 0)
            emotion_embed = self.emotion_embedding(
                torch.tensor([emotion_idx]).to(self.device)
            ).unsqueeze(0)

            # Encoder forward pass
            encoder_outputs = self.encoder(phoneme_tensor)

            # Add emotion conditioning
            encoder_outputs = encoder_outputs + emotion_embed.unsqueeze(1)

            # Decoder forward pass
            mel_outputs, stop_outputs, attention_weights = self.decoder(encoder_outputs)

            # Vocoder forward pass
            waveform = self.vocoder(mel_outputs)

            # Convert to numpy
            waveform = waveform.squeeze(0).cpu().numpy()

            # Apply speed adjustment
            if speed != 1.0:
                waveform = librosa.effects.time_stretch(waveform, rate=speed)

            # Normalize
            max_val = np.abs(waveform).max()
            if max_val > 1.0:
                waveform = waveform / max_val

        logger.info(f"Synthesis complete: {len(waveform)} samples ({len(waveform) / config.audio.sample_rate:.2f}s)")
        return waveform, config.audio.sample_rate

    def save_audio(self, waveform: np.ndarray, output_path: str):
        """Save waveform to file."""
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(output_path, waveform, config.audio.sample_rate)
        logger.info(f"Audio saved to {output_path}")

    def load_speaker_embedding(self, speaker_id: str, embedding_path: str):
        """Load speaker embedding for voice cloning."""
        embedding = np.load(embedding_path)
        self.speaker_embeddings[speaker_id] = torch.from_numpy(embedding).to(self.device)
        logger.info(f"Loaded speaker embedding for {speaker_id}")

    def get_mel_spectrogram(self, waveform: np.ndarray) -> np.ndarray:
        """Compute mel-spectrogram from waveform."""
        mel = librosa.feature.melspectrogram(
            y=waveform,
            sr=config.audio.sample_rate,
            n_fft=config.audio.n_fft,
            hop_length=config.audio.hop_length,
            n_mels=config.audio.n_mels,
            fmin=config.audio.f_min,
            fmax=config.audio.f_max,
        )
        mel_db = librosa.power_to_db(mel, ref=np.max)
        return mel_db

    def get_phoneme_alignment(
        self, text: str, mel_spectrogram: np.ndarray
    ) -> Dict[str, Tuple[int, int]]:
        """Get phoneme-to-frame alignment."""
        phoneme_indices = self.text_encoder.encode(text)
        phoneme_seq = self.text_encoder.decode(phoneme_indices)

        # Compute rough alignment
        num_frames = mel_spectrogram.shape[1]
        num_phonemes = len(phoneme_indices)

        alignment = {}
        for i, phoneme_idx in enumerate(phoneme_indices):
            start_frame = int(i * num_frames / num_phonemes)
            end_frame = int((i + 1) * num_frames / num_phonemes)
            phoneme = self.text_encoder.idx2char.get(phoneme_idx, "UNK")
            alignment[phoneme] = (start_frame, end_frame)

        return alignment

    def inference_batch(
        self, texts: List[str], emotions: Optional[List[str]] = None
    ) -> List[Tuple[np.ndarray, int]]:
        """Synthesize multiple texts in batch."""
        results = []
        for i, text in enumerate(texts):
            emotion = emotions[i] if emotions else "neutral"
            waveform, sr = self.synthesize(text, emotion=emotion)
            results.append((waveform, sr))
        return results
