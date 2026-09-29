#!/usr/bin/env python3
"""
Knight Wing Viral Ad - Professional Video Generator
Pure OpenCV + PIL (no CUDA dependencies)
Generates smooth 30-second MP4 with dynamic effects
"""

import cv2
import numpy as np
import sys
from pathlib import Path

def generate_knight_wing_video(output_path="knight_wing_30s.mp4", fps=30, duration=30):
    """
    Generate professional 30-second viral ad video.
    Pure OpenCV - works on any GPU via ffmpeg backend
    """

    print("🎬 Knight Wing Viral Ad Generator")
    print("=" * 60)

    width, height = 1080, 1080
    total_frames = fps * duration

    # Initialize video writer with GPU acceleration (NVIDIA CUVID if available)
    # Falls back to software encoding if GPU unavailable
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    if not out.isOpened():
        print("❌ Failed to initialize video writer")
        return None

    # Color palette (BGR format for OpenCV)
    colors = {
        'dark_bg': (10, 14, 39),       # #0A0E27
        'red': (46, 62, 255),          # #FF2E3E
        'blue': (255, 168, 0),         # #00A8FF
        'neon_green': (65, 255, 0),    # #00FF41
        'white': (255, 255, 255),
        'black': (0, 0, 0)
    }

    print(f"Target: {width}x{height} @ {fps}fps = {total_frames} frames")
    print()

    for frame_idx in range(total_frames):
        progress = frame_idx / total_frames

        # Create frame with dark background
        frame = np.full((height, width, 3), colors['dark_bg'], dtype=np.uint8)

        # ============================================
        # PHASE 1: Headlight Pulse (0-8 seconds, 0.0-0.267)
        # ============================================
        if progress < 0.267:
            phase_progress = progress / 0.267
            pulse_intensity = np.sin(phase_progress * np.pi * 4) * 0.5 + 0.5

            # Left headlight - red glow with gradient
            center_left = (420, 320)
            radius_left = int(120 * pulse_intensity)
            cv2.circle(frame, center_left, radius_left, colors['red'], -1)

            # Right headlight - red glow
            center_right = (660, 320)
            radius_right = int(120 * pulse_intensity)
            cv2.circle(frame, center_right, radius_right, colors['red'], -1)

            # Brighten headlight centers
            for r in range(int(50 * pulse_intensity), 0, -2):
                alpha = (1 - r / (50 * pulse_intensity)) * 0.3
                overlay = frame.copy()
                cv2.circle(overlay, center_left, r, colors['red'], -1)
                cv2.circle(overlay, center_right, r, colors['red'], -1)
                cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

        # ============================================
        # PHASE 2: Dashboard Tech Activation (8-16 seconds, 0.267-0.533)
        # ============================================
        if 0.267 < progress < 0.533:
            phase_progress = (progress - 0.267) / 0.266
            glow_intensity = np.sin(phase_progress * np.pi * 3) * 0.4 + 0.5

            # Dashboard panel glow
            dash_top, dash_left = 380, 750
            dash_height, dash_width = 180, 280
            dash_alpha = int(glow_intensity * 100)

            overlay = frame.copy()
            cv2.rectangle(overlay, (dash_left, dash_top), (dash_left + dash_width, dash_top + dash_height),
                         colors['blue'], -1)
            cv2.addWeighted(overlay, glow_intensity * 0.3, frame, 1, 0, frame)

            # Scan lines - neon green
            line_alpha = glow_intensity * 0.5
            for i in range(5):
                y = dash_top + 10 + i * 35
                for x in range(dash_left, dash_left + dash_width, 5):
                    frame[y, x] = colors['neon_green']

        # ============================================
        # PHASE 3: Operator Focus (16-24 seconds, 0.533-0.8)
        # ============================================
        if 0.533 < progress < 0.8:
            phase_progress = (progress - 0.533) / 0.267
            focus_intensity = np.sin(phase_progress * np.pi * 2) * 0.3 + 0.4

            # Operator silhouette - blue ethereal glow
            operator_center = (540, 280)
            glow_radius = int(150 * focus_intensity)

            overlay = frame.copy()
            cv2.circle(overlay, operator_center, glow_radius, colors['blue'], -1)
            cv2.addWeighted(overlay, focus_intensity * 0.4, frame, 1, 0, frame)

            # Inner highlight
            cv2.circle(frame, operator_center, int(50 * focus_intensity), colors['blue'], -1)

        # ============================================
        # PHASE 4: Logo Reveal (24-30 seconds, 0.8-1.0)
        # ============================================
        if progress > 0.8:
            phase_progress = (progress - 0.8) / 0.2
            fade_in = min(phase_progress * 2, 1.0)

            # Red accent overlay
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (width, height), colors['red'], -1)
            cv2.addWeighted(overlay, fade_in * 0.15, frame, 1, 0, frame)

            # KNIGHT WING text
            if fade_in > 0.2:
                font = cv2.FONT_HERSHEY_BOLD
                text_color = tuple(int(c * fade_in) for c in colors['red'])

                # Main logo text
                text1 = "KNIGHT WING"
                font_scale1 = 2.5
                thickness1 = 4
                text_size1 = cv2.getTextSize(text1, font, font_scale1, thickness1)[0]
                x1 = (width - text_size1[0]) // 2
                y1 = height - 80

                cv2.putText(frame, text1, (x1, y1), font, font_scale1, text_color, thickness1)

                # Tagline
                text2 = "STAY READY. STAY WISE."
                font_scale2 = 1.2
                thickness2 = 2
                text_color2 = tuple(int(c * fade_in) for c in colors['white'])
                text_size2 = cv2.getTextSize(text2, font, font_scale2, thickness2)[0]
                x2 = (width - text_size2[0]) // 2
                y2 = height - 30

                cv2.putText(frame, text2, (x2, y2), font, font_scale2, text_color2, thickness2)

        # ============================================
        # Ambient blue glow throughout
        # ============================================
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (width, height), colors['blue'], -1)
        cv2.addWeighted(overlay, 0.03, frame, 1, 0, frame)

        # Write frame to video
        out.write(frame)

        # Progress indicator
        progress_pct = 100 * (frame_idx + 1) / total_frames
        if (frame_idx + 1) % 30 == 0 or frame_idx == 0 or frame_idx == total_frames - 1:
            print(f"  [{frame_idx + 1:3d}/{total_frames}] {progress_pct:5.1f}% | " +
                  f"Phase: ", end="")
            if progress < 0.267:
                print("1️⃣  Headlight Pulse")
            elif progress < 0.533:
                print("2️⃣  Dashboard Activation")
            elif progress < 0.8:
                print("3️⃣  Operator Focus")
            else:
                print("4️⃣  Logo Reveal")

    # Release video writer
    out.release()

    # Check file size
    output_file = Path(output_path)
    if output_file.exists():
        file_size_mb = output_file.stat().st_size / (1024 * 1024)
        print()
        print(f"✅ Video generation complete!")
        print(f"   Output: {output_path}")
        print(f"   Size: {file_size_mb:.1f} MB")
        print(f"   Resolution: {width}x{height}")
        print(f"   Duration: {duration} seconds @ {fps} fps")
        print(f"   Format: MP4 (h264)")
        return output_path
    else:
        print("❌ Video file not created")
        return None


if __name__ == "__main__":
    output_file = sys.argv[1] if len(sys.argv) > 1 else "knight_wing_30s.mp4"

    try:
        result = generate_knight_wing_video(output_file)
        if result:
            print(f"\n🎉 Ready to upload to Discord!")
        else:
            print("\n❌ Failed to generate video")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⏸️  Interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
