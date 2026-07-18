# WISE² + Klingai Animation Skill Integration

**Status**: ✅ Installed  
**Location**: `.claude/skills/animate-character/`  
**Command**: `/animate-character`

## Overview

The Klingai Animation skill integrates AI-powered character animation into the WISE² platform. Transform static character images into production-ready CSS sprite sheet animations using Kling AI video generation.

### What It Does

1. **Input**: A static character image (PNG/JPG) + animation description
2. **Process**: Generates animated video via Kling AI → Extracts frames → Creates sprite sheet
3. **Output**: Optimized PNG sprite sheet (~50-150KB) + CSS/React code

### Why Use It for WISE²

- **Live Stream Characters**: Animate your broadcasting persona or on-screen character
- **Dashboard Mascots**: Add animated guides to studio workspace
- **Marketing**: Create animated avatars for website hero sections
- **UX Enhancement**: Lightweight character animations (no JavaScript, pure CSS)

## Setup

### Prerequisites

Before using the skill, ensure you have:

1. **ffmpeg** installed (required for frame extraction)
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # Windows
   choco install ffmpeg
   ```
   Verify: `ffmpeg -version`

2. **Node.js 18+** (already installed in wise2-core)
   Verify: `node -v`

### Choose a Backend

The skill supports two video generation backends. Pick **one**:

#### Option A: Kling AI Direct API (Recommended for WISE²)

1. Get API credentials from [Kling AI Developer Console](https://app.klingai.com/global/dev)
2. Set environment variables (persistent across sessions):
   
   **macOS/Linux** (add to `~/.zshrc` or `~/.bashrc`):
   ```bash
   export KLING_ACCESS_KEY="your-access-key-here"
   export KLING_SECRET_KEY="your-secret-key-here"
   ```
   
   **Windows PowerShell**:
   ```powershell
   [Environment]::SetEnvironmentVariable("KLING_ACCESS_KEY", "your-access-key-here", "User")
   [Environment]::SetEnvironmentVariable("KLING_SECRET_KEY", "your-secret-key-here", "User")
   ```

3. Restart your terminal and verify:
   ```bash
   echo $KLING_ACCESS_KEY  # Should print your key
   ```

#### Option B: Higgsfield CLI (Access to 15+ Models)

For more model variety (Seedance, Veo, Wan, Hailuo, etc.):

```bash
npm install -g @higgsfield-ai/cli
higgsfield auth login          # Opens browser for OAuth
higgsfield model list --json   # Verify models available
```

## Usage

### Basic Usage

```bash
/animate-character ./path/to/character.png "animation description"
```

**Examples:**

```bash
# Idle animation
/animate-character ./fox.png "standing idle, blinking and breathing gently"

# Jump celebration
/animate-character ./panda.png "doing a happy jump with clapping hands"

# Walking
/animate-character ./character.png "walking left to right, swinging arms"

# Custom options
/animate-character ./character.png "typing excitedly" --quality=high --width=300 --fps=12
```

### Output Structure

The skill generates files in the current directory:

```
./
├── animation.mp4              # Original generated video
├── sprite-sheet/
│   ├── spritesheet.png       # Optimized sprite sheet (~50-150KB)
│   └── metadata.json         # Frame data + CSS snippets
```

### Integration in WISE²

#### 1. For Studio Workspace

Place animated characters in the studio UI:

```typescript
// apps/studio/components/AnimatedCharacter.tsx
import { useSpriteAnimation } from '@/hooks/useSpriteAnimation';

export default function AnimatedCharacter() {
  const { spriteUrl, css } = useSpriteAnimation('/animations/studio-guide.png', {
    fps: 12,
    width: 120,
    frames: 24
  });

  return (
    <div className="animate-character" style={css}>
      {/* Sprite will render via CSS animation */}
    </div>
  );
}
```

#### 2. For Website Hero

Animated welcome character for landing page:

```tsx
// apps/website/components/HeroCharacter.tsx
import Image from 'next/image';

export default function HeroCharacter() {
  return (
    <div className="hero-character">
      <Image
        src="/animations/welcome-character-sprite.png"
        alt="Welcome mascot"
        width={400}
        height={400}
        className="animate-welcome"
      />
    </div>
  );
}
```

Add to global CSS:

```css
.animate-welcome {
  animation: sprite-play 3s steps(24) infinite;
  background-position: 0 0;
}

@keyframes sprite-play {
  to {
    background-position: -9600px 0; /* 400px × 24 frames */
  }
}
```

#### 3. For Dashboard Widgets

Use in admin dashboard:

```tsx
// apps/dashboard/components/GuideCharacter.tsx
export default function GuideCharacter({ animation }) {
  return (
    <div className="guide-character">
      <style>{`
        .guide-char {
          width: 200px;
          height: 200px;
          background: url('${animation.spriteUrl}') left center;
          animation: guide-play ${animation.duration}s steps(${animation.frames}) infinite;
        }
        
        @keyframes guide-play {
          to { background-position: right center; }
        }
      `}</style>
      <div className="guide-char"></div>
    </div>
  );
}
```

## Configuration Options

Available flags for customization:

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--quality` | `low` \| `high` | `high` | FPS preset (low=8fps, high=12fps) |
| `--fps` | 8-30 | 12 | Frames per second to extract |
| `--width` | 50-2000 | 200 | Frame width in pixels |
| `--height` | 50-2000 | auto | Frame height (maintains aspect ratio if auto) |
| `--duration` | 5 \| 10 | 5 | Video length in seconds |
| `--provider` | `kling` \| `higgsfield` | auto-detect | Video backend |
| `--remove-bg` | `green` \| `auto` \| `none` | `green` | Background removal method |
| `--format` | `horizontal` \| `grid` \| `vertical` | `horizontal` | Sprite sheet layout |

**Examples:**

```bash
# Low-quality (faster, smaller file)
/animate-character ./char.png "idle" --quality=low

# Custom dimensions
/animate-character ./char.png "walk" --width=300 --height=300

# 10-second video
/animate-character ./char.png "long animation" --duration=10 --fps=8

# Force Higgsfield backend
/animate-character ./char.png "animation" --provider=higgsfield

# AI background removal
/animate-character ./char.png "animation" --remove-bg=auto

# Grid layout (2x3 tiles)
/animate-character ./char.png "animation" --format=grid
```

## Best Practices

### Character Design

- **Solid background**: Easier background removal. Avoid complex scenery.
- **Centered pose**: Character should face center for optimal animation.
- **Consistent style**: Match WISE² design system (see [Master Design System](docs/WISE2_DESIGN_SYSTEM_MASTER_VISUAL.png))
- **Transparent PNG**: Use RGBA PNG for easy chroma-key removal.

### Animation Prompts

Write clear, specific prompts:

- ❌ "move the character"
- ✅ "walking left to right with swinging arms, turning head slightly"

- ❌ "idle"
- ✅ "standing still, breathing gently, occasional eye blinks, subtle head turn"

- ❌ "happy"
- ✅ "doing a small jump with arms raised, big smile, landing back on feet"

### Performance

- **File size**: Sprite sheets are ~50-150KB (far smaller than video)
- **No JavaScript**: Pure CSS `steps()` animation (60 FPS capable)
- **Browser support**: Works in all modern browsers
- **Mobile friendly**: Optimized for iOS and Android

### Quality Settings

| Setting | FPS | File Size | Use Case |
|---------|-----|-----------|----------|
| `--quality=low` | 8 | ~50KB | Loading screens, subtle idle |
| `--quality=high` | 12 | ~150KB | Hero animations, hero sections |
| Custom `--fps=30` | 30 | 300KB+ | Smooth, complex motion |

## Troubleshooting

### "ffmpeg not found"
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```
Then restart your terminal.

### "Kling API credentials not found"
Set env vars and restart terminal:
```bash
export KLING_ACCESS_KEY="your-key"
export KLING_SECRET_KEY="your-secret"
```

### "higgsfield CLI not found"
```bash
npm install -g @higgsfield-ai/cli
higgsfield auth login
higgsfield model list --json
```

### "Poor background removal"
Try AI-based removal:
```bash
/animate-character ./char.png "animation" --remove-bg=auto
```

### "Video generation timeout"
Use faster settings:
```bash
/animate-character ./char.png "animation" --quality=low --provider=kling
```

## File Locations

| Path | Purpose |
|------|---------|
| `.claude/skills/animate-character/` | Skill scripts and config |
| `apps/website/public/animations/` | Website character sprites |
| `apps/dashboard/public/animations/` | Dashboard character sprites |
| `apps/studio/public/animations/` | Studio character sprites |

## Next Steps

1. ✅ Skill installed
2. ⬜ Set up backend (Kling API or Higgsfield CLI)
3. ⬜ Create character images
4. ⬜ Generate first sprite sheet
5. ⬜ Integrate into apps/website, apps/studio, apps/dashboard
6. ⬜ Add to git and deploy

## References

- **Klingai Skill Repo**: https://github.com/TamerinTECH/claude-skill-klingai-animation
- **Kling AI Docs**: https://klingai.com/docs
- **Higgsfield Skills**: https://github.com/higgsfield-ai/skills
- **WISE² Design System**: See `docs/WISE2_DESIGN_SYSTEM_MASTER_VISUAL.png`
- **Master Brand**: See `docs/BRAND_BIBLE_UPDATED.md`

---

**Last Updated**: 2026-07-17  
**Installed**: ✅ Yes  
**Backend Configured**: ⬜ Pending
