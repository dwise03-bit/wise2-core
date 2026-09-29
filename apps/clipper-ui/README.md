# WISE² Video Clipper UI

AI-powered video clipping and multi-platform publishing web application.

## Features

- **📤 Media Upload**: Upload video or audio files
- **🤖 AI Analysis**: Automatic moment detection, transcription, and clip suggestions
- **✂️ Clip Editor**: Create clips with precise time ranges and metadata
- **📱 Multi-Platform Publishing**: Publish to Instagram, TikTok, YouTube, Twitter, Discord, LinkedIn
- **⚙️ Smart Optimization**: Automatic format, resolution, and codec optimization per platform
- **📊 Analytics**: Track engagement and publishing performance

## Getting Started

### Install Dependencies

```bash
cd apps/clipper-ui
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3011](http://localhost:3011) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## API Integration

The UI connects to the WISE² API at `https://api.wise2.net/api/v1/clipper`

### Key Endpoints

- `POST /api/v1/clipper/media/upload` - Upload media
- `GET /api/v1/clipper/media/:id` - Get media details
- `POST /api/v1/clipper/media/:id/analyze` - Analyze for moments
- `POST /api/v1/clipper/clips` - Create clip
- `GET /api/v1/clipper/clips/:id` - Get clip details
- `POST /api/v1/clipper/clips/:id/extract` - Extract video segment
- `POST /api/v1/clipper/clips/:id/publish` - Publish to platform
- `GET /api/v1/clipper/clips/:id/publishing-jobs` - Get publishing status
- `GET /api/v1/clipper/media/:id/suggested-clips` - Get AI suggestions

## Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Zustand (optional)

## Architecture

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Main dashboard
└── globals.css         # Global styles

components/
├── MediaUpload.tsx     # Upload interface
├── ClipEditor.tsx      # Clip creation
├── PublishManager.tsx  # Publishing interface
└── SuggestedClips.tsx  # AI suggestions
```

## Workflow

1. **Upload Media** - Upload video/audio file
2. **Analyze** - AI detects moments, transcribes, generates suggestions
3. **Create Clips** - Define time ranges or use AI suggestions
4. **Extract** - FFmpeg extracts optimized video segments
5. **Publish** - Send to multiple platforms with platform-specific optimizations
6. **Track** - Monitor publishing status and engagement metrics

## Platform Specifications

| Platform | Resolution | Format | Max Size |
|----------|-----------|--------|----------|
| Instagram | 1080×1350 | MP4 | 4GB |
| TikTok | 1080×1920 | MP4 | 287.6MB |
| YouTube | 1280×720 | MP4 | 256GB |
| Twitter | 1200×675 | MP4 | 512MB |
| Discord | Variable | MP4 | 8MB |
| LinkedIn | 1200×675 | MP4 | 2GB |

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

## Brand Colors

- Navy: `#050607`
- Cyan: `#00D9FF`
- Neon Green: `#00FF7F`
- Gold: `#C4A369`

## License

© 2026 WISE² Genesis. All rights reserved.
