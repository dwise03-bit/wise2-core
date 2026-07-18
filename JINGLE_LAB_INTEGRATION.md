# WISE² Jingle Lab - Integration Guide

## Overview

Jingle Lab is now fully integrated into WISE² as a premium AI music creation platform. It's accessible through the main dashboard navigation and includes complete project management, generation workflows, and team collaboration features.

## Architecture

### Navigation Structure

**Sidebar Entry:** Creative → Jingle Lab
- Main Dashboard: `/studio/jingle-lab`
- Create New Project: `/studio/jingle-lab/new`
- Project Editor: `/studio/jingle-lab/[projectId]`

### Components Structure

```
components/
├── AppShell.tsx          (Main layout container)
├── SidebarNav.tsx        (Navigation menu)
├── TopBar.tsx            (Top navigation bar)
└── navConfig.tsx         (Navigation configuration)
```

### Pages Structure

```
app/studio/jingle-lab/
├── page.tsx              (Dashboard - project list)
├── new/page.tsx          (Create new project)
└── [projectId]/page.tsx  (Individual project editor)
```

### API Endpoints

```
/api/projects/
  GET    - List all projects
  POST   - Create new project

/api/generation/create/
  POST   - Start audio generation

/api/generation/status/
  GET    - Check generation progress
```

## Features Integrated

### Dashboard Features
- ✅ Project listing with filtering
- ✅ Favorite/star projects
- ✅ Quick stats (total, completed, processing, favorites)
- ✅ Create new project button
- ✅ Project status indicators
- ✅ Delete projects
- ✅ Quick actions (play, download)

### Creation Workflow
- ✅ 6 generation types (Song, Jingle, Podcast, Commercial, Ambient, Logo)
- ✅ Project form with title, description, mood, genre
- ✅ Duration slider (5s - 300s)
- ✅ Vocal include/exclude toggle
- ✅ Generation start

### Project Editor
- ✅ Audio player with waveform visualization
- ✅ Playback controls (play, pause, seek, volume)
- ✅ Progress bar with time display
- ✅ Download button
- ✅ Share button
- ✅ Favorite toggle
- ✅ Regenerate options
- ✅ Project settings panel
- ✅ Version history
- ✅ Project metadata display

### Design
- ✅ Organized Chaos design language
- ✅ Dark theme with electric blue accents
- ✅ Glassmorphism panels
- ✅ Smooth animations (Framer Motion)
- ✅ Responsive design
- ✅ Professional typography
- ✅ Status indicators and badges

## Project Data Model

```typescript
interface JingleProject {
  id: string;
  title: string;
  type: 'song' | 'jingle' | 'commercial' | 'podcast' | 'logo';
  duration: number;
  genre: string;
  mood: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  audioUrl?: string;
  isFavorite: boolean;
  status: 'draft' | 'processing' | 'ready' | 'archived';
}
```

## Generation Model

```typescript
interface GenerationRequest {
  title: string;
  description?: string;
  generationType: string;
  genre: string;
  mood: string;
  tempo: number;
  energy: number;
  duration: number;
  language: string;
  vocalStyle: string;
  lyrics?: string;
  negativePrompt?: string;
  brandKeywords?: string;
  referenceNotes?: string;
}
```

## Next Steps

### Database Integration (TODO)
1. Create Prisma schema for projects and generations
2. Set up PostgreSQL connection
3. Implement database queries in API routes
4. Add authentication/authorization checks

### AI Integration (TODO)
1. Connect to audio generation provider
2. Implement background job processor (Bull/BullMQ)
3. Handle generation status updates
4. Implement WebSocket for real-time progress

### Features (TODO)
1. Lyrics assistant with AI writing tools
2. Audio editor (trim, fade, normalize)
3. Collaboration features (comments, mentions)
4. Team management and permissions
5. Analytics and usage tracking
6. Credit system and billing integration

### Performance (TODO)
1. Optimize waveform rendering
2. Add audio caching
3. Implement code splitting for large components
4. Add service worker for offline support

## Testing

### Manual Testing
```bash
# Navigate to Jingle Lab
1. Click "Jingle Lab" in sidebar under Creative section
2. View project dashboard
3. Click "Create New" button
4. Follow creation workflow
5. View generated project
```

### API Testing
```bash
# Test project creation
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Jingle",
    "type": "jingle",
    "genre": "Electronic",
    "mood": "Professional",
    "duration": 30
  }'

# Test generation start
curl -X POST http://localhost:3000/api/generation/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Song",
    "generationType": "FULL_SONG",
    "genre": "Pop",
    "mood": "Happy",
    "tempo": 120,
    "energy": 75,
    "duration": 60
  }'
```

## Configuration

### Environment Variables
Add to `.env.local`:

```env
# Optional: AI Provider Configuration
AUDIO_PROVIDER=default
AUDIO_GENERATION_TIMEOUT=300000

# Optional: Storage Configuration
STORAGE_PROVIDER=s3
S3_BUCKET=wise2-audio
S3_REGION=us-east-1

# Optional: Queue Configuration
REDIS_URL=redis://localhost:6379
QUEUE_CONCURRENCY=5
```

## Styling

Uses existing WISE² design tokens:
- `bg-slate-950` - Primary background
- `bg-slate-900` - Secondary background
- `text-blue-400` - Accent color
- `border-slate-700` - Border color
- Tailwind classes for responsive design

## Known Limitations

1. **Audio Generation**: Currently returns demo status - needs AI provider integration
2. **Database**: Using mock data - needs Prisma/PostgreSQL setup
3. **Authentication**: No user authentication yet
4. **Team Features**: UI present but not functional
5. **Analytics**: Dashboard shows mock data

## Integration Checklist

- [x] Navigation setup
- [x] Dashboard page with project listing
- [x] Create new project workflow
- [x] Project editor page
- [x] Audio player component
- [x] API route structure
- [ ] Database schema
- [ ] Authentication guards
- [ ] AI provider integration
- [ ] Background job processing
- [ ] Real-time updates (WebSocket)
- [ ] Team collaboration features
- [ ] Analytics tracking
- [ ] Billing/credits integration

## Support

For issues or questions about the Jingle Lab integration, refer to:
- CLAUDE.md - Project structure and routing
- Database schema - packages/db/prisma/schema.prisma
- AI Provider adapter - lib/ai-provider.ts
