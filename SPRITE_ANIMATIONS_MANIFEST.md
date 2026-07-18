# WISE² Sprite Animation Manifest

**Status**: Ready for generation  
**Tool**: Klingai Animation Skill (`/animate-character`)  
**Credentials**: Configured ✅ (pending account credits)

## Animation Inventory

### Studio App (`apps/studio/`)

#### 1. Studio Guide (Workspace Companion)
- **Location**: `public/animations/guide-idle-sprite.png`
- **Purpose**: Welcome and guide users in workspace
- **Prompt**: "A cute friendly fox character standing idle, blinking and breathing gently, occasionally looking around with curiosity, waiting to help. Smooth looping animation, 3 seconds, solid green background, no camera movement."
- **Config**: 24 frames, 150×150px, 12 FPS
- **Component**: `components/AnimatedGuide.tsx`

#### 2. Guide Typing State
- **Location**: `public/animations/guide-typing-sprite.png`
- **Purpose**: Active state when processing or thinking
- **Prompt**: "A fox character at a computer, fingers typing rapidly on keyboard, focused expression, bouncing slightly with energy. Smooth typing motion, 2 seconds, solid green background, no camera movement."
- **Config**: 20 frames, 150×150px, 15 FPS
- **Component**: `components/AnimatedGuide.tsx`

#### 3. Guide Thinking State
- **Location**: `public/animations/guide-thinking-sprite.png`
- **Purpose**: Loading or processing indicator
- **Prompt**: "A fox character thinking, hand on chin, eyes looking up thoughtfully, slight head tilt, contemplative pose. Subtle looping motion, 3 seconds, solid green background, no camera movement."
- **Config**: 16 frames, 150×150px, 10 FPS
- **Component**: `components/AnimatedGuide.tsx`

---

### Website App (`apps/website/`)

#### 4. Hero Welcome Character
- **Location**: `public/animations/hero-welcome-sprite.png`
- **Purpose**: Hero section entrance animation
- **Prompt**: "A dynamic character entering the screen from the left with an enthusiastic wave, big welcoming smile, arms spread open. Entrance movement into center position, loop the idle pose. Smooth 3-second animation, solid green background, no camera movement."
- **Config**: 32 frames, 300×300px, 12 FPS
- **Component**: `components/HeroCharacter.tsx`

#### 5. Hero Celebration
- **Location**: `public/animations/hero-celebration-sprite.png`
- **Purpose**: Call-to-action celebration animation
- **Prompt**: "A character doing a happy celebration dance - jumping with arms up, clapping hands, big smile, spinning slightly. Joyful movement, 2-second loop, solid green background, no camera movement."
- **Config**: 24 frames, 300×300px, 12 FPS
- **Component**: `components/HeroCharacter.tsx`

---

### Dashboard App (`apps/dashboard/`)

#### 6. Guide Help State
- **Location**: `public/animations/guide-help-sprite.png`
- **Purpose**: Friendly helper indicator in dashboard
- **Prompt**: "A helpful guide character with raised hand, gentle smile, nodding head subtly, suggesting readiness to help. Subtle looping animation, 2 seconds, solid green background, no camera movement."
- **Config**: 20 frames, 80×80px, 12 FPS
- **Component**: `components/DashboardGuide.tsx`

#### 7. Guide Alert State
- **Location**: `public/animations/guide-alert-sprite.png`
- **Purpose**: Important warning or alert indicator
- **Prompt**: "A character looking alert and focused, slightly raised eyebrows, hand gesturing attention, looking forward seriously. Alert posture with subtle movement, 2 seconds, solid green background, no camera movement."
- **Config**: 16 frames, 80×80px, 12 FPS
- **Component**: `components/DashboardGuide.tsx`

#### 8. Guide Success State
- **Location**: `public/animations/guide-success-sprite.png`
- **Purpose**: Success or completion celebration
- **Prompt**: "A character celebrating success - thumbs up, big smile, slight jump, arms raised in victory. Celebratory movement, 2 seconds, solid green background, no camera movement."
- **Config**: 24 frames, 80×80px, 12 FPS
- **Component**: `components/DashboardGuide.tsx`

#### 9. Guide Info State
- **Location**: `public/animations/guide-info-sprite.png`
- **Purpose**: Informational indicator
- **Prompt**: "A character in a casual, friendly pose - hand on hip, smiling, looking forward, suggesting approachable information. Relaxed idle stance, 2 seconds, solid green background, no camera movement."
- **Config**: 12 frames, 80×80px, 10 FPS
- **Component**: `components/DashboardGuide.tsx`

---

## Generation Workflow

### Prerequisites
- ✅ Klingai skill installed
- ✅ Kling API credentials configured
- ❌ Account credits (need to be added)

### Generation Commands

Once credits are added to Kling account, generate each sprite sheet:

```bash
# Studio Guide
/animate-character ./character.png "A cute friendly fox character standing idle..." --width=150 --fps=12

# Website Hero
/animate-character ./character.png "A dynamic character entering the screen..." --width=300 --fps=12

# Dashboard Guides
/animate-character ./character.png "A helpful guide character with raised hand..." --width=80 --fps=12
```

### After Generation

For each sprite sheet generated:

1. Move PNG to appropriate `public/animations/` directory
2. Update component config with actual frameCount from metadata.json
3. Copy metadata.json to same directory for reference
4. Add CSS imports to component if using `useSpriteAnimation` hook

### Directory Structure

```
apps/studio/public/animations/
├── guide-idle-sprite.png
├── guide-typing-sprite.png
└── guide-thinking-sprite.png

apps/website/public/animations/
├── hero-welcome-sprite.png
└── hero-celebration-sprite.png

apps/dashboard/public/animations/
├── guide-help-sprite.png
├── guide-alert-sprite.png
├── guide-success-sprite.png
└── guide-info-sprite.png
```

---

## Integration Checklist

- [ ] Add credits to Kling account (https://app.klingai.com/billing)
- [ ] Generate studio guide animations (3 sprite sheets)
- [ ] Generate website hero animations (2 sprite sheets)
- [ ] Generate dashboard guide animations (4 sprite sheets)
- [ ] Place sprite sheets in `public/animations/` directories
- [ ] Update component configs with actual frame counts
- [ ] Test animations in each app
- [ ] Verify responsive sizing on mobile
- [ ] Commit sprite sheets to git (add to `.gitignore` if large)
- [ ] Deploy with animations live

---

## Technical Notes

### File Size Expectations
- Small (80×80px @ 12fps): ~50KB
- Medium (150×150px @ 12fps): ~100KB
- Large (300×300px @ 12fps): ~200KB

### Performance
- Pure CSS animation (no JavaScript)
- GPU-accelerated via `background-position` transitions
- 60 FPS capable on modern browsers
- Respects `prefers-reduced-motion` media query

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- iOS Safari: ✅ Full support

---

## Cost Estimate

Based on Kling AI pricing:
- 9 sprite sheets needed
- ~2-3 minutes video generation per sprite
- Estimated cost: 1-2 credits (varies by subscription tier)

---

**Last Updated**: 2026-07-17  
**Ready for**: Sprite generation (pending credits)
