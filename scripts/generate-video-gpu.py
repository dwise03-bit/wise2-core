#!/usr/bin/env python3
"""
Knight Wing Viral Ad - GPU Video Generator
Uses Stable Diffusion + AnimateDiff for professional 30-second video
Free, open-source models on GPU
"""

import os
import torch
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Check GPU availability
print(f"GPU Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU Device: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

def create_knight_wing_video(output_path="knight_wing_30s.mp4", fps=30, duration=30):
    """
    Generate professional 30-second viral ad video using GPU acceleration.
    Uses free, open-source AI models.
    """

    try:
        # Try using diffusers + AnimateDiff (free models)
        from diffusers import AnimateDiffPipeline, DDIMScheduler
        from diffusers.utils import export_to_video

        print("🎬 Initializing AnimateDiff GPU pipeline...")

        # Use free AnimateDiff model from HuggingFace
        model_id = "emilianJR/epiCRealism"
        motion_adapter_id = "guoyww/animatediff-motion-adapter-v1-5-2"

        pipe = AnimateDiffPipeline.from_pretrained(
            model_id,
            motion_adapter_id=motion_adapter_id,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )

        if torch.cuda.is_available():
            pipe = pipe.to("cuda")
            pipe.enable_attention_slicing()

        # 4-phase prompt that matches our animation
        prompt = """
        PHASE 1 (0-8s): Tactical armored SUV with glowing red headlights, neon red pulses
        PHASE 2 (8-16s): Vehicle dashboard glows brilliant blue, holographic scan lines in neon green, tech aesthetic
        PHASE 3 (16-24s): Silhouette of tactical operator in NYC skyline backdrop, blue ethereal glow, night sky
        PHASE 4 (24-30s): KNIGHT WING logo in red, tagline "STAY READY. STAY WISE." white text, red accent overlay

        Style: Cinematic, high-tech military aesthetic, dark background, neon colors, professional commercial grade
        """

        print(f"Generating animation: {prompt[:100]}...")

        # Generate frames
        frames = pipe(
            prompt=prompt,
            height=1080,
            width=1080,
            num_frames=fps * duration,  # 900 frames
            num_inference_steps=25,
            guidance_scale=7.5,
        ).frames[0]

        print(f"Generated {len(frames)} frames")

        # Export to video
        export_to_video(frames, output_path, fps=fps)
        print(f"✅ Video saved to: {output_path}")

        return output_path

    except ImportError:
        print("⚠️  AnimateDiff not available, falling back to frame-by-frame generation...")
        return generate_frames_opencv(output_path, fps, duration)


def generate_frames_opencv(output_path, fps=30, duration=30):
    """
    Fallback: Generate frames using OpenCV + PIL (if diffusers unavailable)
    Creates smooth transitions between animation phases
    """

    print("🎨 Generating animation frames with OpenCV...")

    width, height = 1080, 1080
    total_frames = fps * duration

    # Video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # Color palette
    colors = {
        'dark_bg': (10, 14, 39),      # #0A0E27
        'red': (46, 62, 255),          # #FF2E3E (BGR)
        'blue': (255, 168, 0),         # #00A8FF (BGR)
        'neon_green': (65, 255, 0),    # #00FF41 (BGR)
        'white': (255, 255, 255)
    }

    for frame_idx in range(total_frames):
        progress = frame_idx / total_frames

        # Create frame
        frame = np.full((height, width, 3), colors['dark_bg'], dtype=np.uint8)

        # Phase 1: Headlight pulse (0-0.267)
        if progress < 0.267:
            phase_progress = progress / 0.267
            pulse = np.sin(phase_progress * np.pi * 4) * 0.5 + 0.5
            intensity = int(pulse * 100)

            # Left headlight
            cv2.circle(frame, (420, 320), int(120 * pulse), colors['red'], -1)
            # Right headlight
            cv2.circle(frame, (660, 320), int(120 * pulse), colors['red'], -1)

        # Phase 2: Dashboard glow (0.267-0.533)
        elif progress < 0.533:
            phase_progress = (progress - 0.267) / 0.266
            glow = int((np.sin(phase_progress * np.pi * 3) * 0.4 + 0.5) * 100)

            # Dashboard rectangle
            cv2.rectangle(frame, (750, 380), (1030, 560), colors['blue'], glow)

            # Scan lines
            for i in range(5):
                y = 390 + i * 35
                cv2.line(frame, (750, y), (1030, y), colors['neon_green'], 2)

        # Phase 3: Operator focus (0.533-0.8)
        elif progress < 0.8:
            phase_progress = (progress - 0.533) / 0.267
            focus = int((np.sin(phase_progress * np.pi * 2) * 0.3 + 0.4) * 150)
            cv2.circle(frame, (540, 280), focus, colors['blue'], -1)

        # Phase 4: Logo reveal (0.8-1.0)
        else:
            phase_progress = (progress - 0.8) / 0.2
            fade = min(phase_progress * 2, 1.0)

            # Red overlay
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (width, height), colors['red'], -1)
            cv2.addWeighted(frame, 1, overlay, fade * 0.15, 0, frame)

            # Draw text
            font = cv2.FONT_HERSHEY_BOLD
            text1 = "KNIGHT WING"
            text2 = "STAY READY. STAY WISE."

            # White text with fade
            alpha = int(fade * 255)
            cv2.putText(frame, text1, (540, height - 80), font, 2, colors['white'], 3)
            cv2.putText(frame, text2, (540, height - 30), font, 1, colors['white'], 2)

        # Ambient glow
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (width, height), colors['blue'], -1)
        cv2.addWeighted(frame, 1, overlay, 0.05, 0, frame)

        # Write frame
        out.write(frame)

        if (frame_idx + 1) % 100 == 0:
            print(f"  Frame {frame_idx + 1}/{total_frames} ({100 * (frame_idx + 1) / total_frames:.0f}%)")

    out.release()
    print(f"✅ Video saved to: {output_path}")
    return output_path


def install_dependencies():
    """Install required packages if using GPU acceleration"""
    print("📦 Checking dependencies...")

    packages = [
        'torch',
        'torchvision',
        'opencv-python',
        'Pillow',
        'numpy'
    ]

    try:
        import torch
        print(f"✅ PyTorch already installed (CUDA: {torch.cuda.is_available()})")
    except ImportError:
        print("⚠️  PyTorch not found. For GPU support, install:")
        print("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")

    for pkg in packages[1:]:
        try:
            __import__(pkg.lower().replace('-', '_'))
            print(f"✅ {pkg} installed")
        except ImportError:
            print(f"⚠️  {pkg} not found. Install with: pip install {pkg}")


if __name__ == "__main__":
    import sys

    output_file = sys.argv[1] if len(sys.argv) > 1 else "knight_wing_30s.mp4"

    print("🎬 Knight Wing Viral Ad - GPU Video Generator")
    print("=" * 50)

    install_dependencies()
    print()

    # Generate video
    try:
        result = create_knight_wing_video(output_file)
        print(f"\n🎉 Video generation complete!")
        print(f"   Output: {result}")
        print(f"   Resolution: 1080x1080")
        print(f"   Duration: 30 seconds @ 30 fps")
        print(f"   Format: MP4 (h264)")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nFalling back to frame-based generation...")
        result = generate_frames_opencv(output_file)
        print(f"✅ Video saved: {result}")
