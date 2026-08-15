# WISE² Podcast Music - Quick Start Guide

Get up and running with the Podcast Music frontend in minutes.

## Prerequisites

- Node.js 18+ and npm 9+
- A running WISE² backend API (or mock API)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Navigate to Dashboard App

```bash
cd apps/dashboard
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios
- React Hook Form

### 3. Configure Environment

Create `.env.local` in the dashboard app root:

```bash
cat > .env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: Development features
NEXT_PUBLIC_DEBUG=false
EOF
```

**For Production**, use:
```env
NEXT_PUBLIC_API_URL=https://api.your-production-domain.com/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Access at: `http://localhost:3002`

The app will hot-reload on file changes.

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

## First Time Setup

### 1. Access the Application

Open your browser and navigate to:
```
http://localhost:3002/podcast
```

### 2. Create Account

Click "Create Account" and sign up with:
- Email: any valid email
- Password: minimum 8 characters
- Podcast Name: your podcast name

### 3. Verify Authentication

After signup, you'll be redirected to dashboard showing:
- 0 projects (empty state)
- 0/10 generations used
- Create New Project button

### 4. Create Your First Project

1. Click "Create New Project"
2. Enter podcast name (e.g., "My Podcast")
3. Set episode number (e.g., 1)
4. Click "Next Step"
5. Select a template (Intro, Outro, or Transition)
6. Click "Next Step"
7. Choose a mood (Upbeat, Calm, or Dramatic)
8. Click "✨ Generate Audio"

### 5. Download Audio

When generation completes:
1. Your audio will appear in the player
2. Click "⬇️ Download MP3" to download
3. Share the link or create another project

## API Mock Server (Development)

If you don't have a backend running, use this mock server for testing:

```bash
# Create mock-api.js in project root
cat > mock-api.js << 'EOF'
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'your-secret-key';
let users = new Map();
let projects = new Map();

// Auth endpoints
app.post('/api/auth/signup', (req, res) => {
  const { email, password, podcastName } = req.body;
  
  if (users.has(email)) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  
  const userId = 'user_' + Date.now();
  users.set(email, { userId, email, podcastName, password });
  
  const token = jwt.sign({ userId, email }, SECRET);
  res.status(201).json({
    token,
    user: { id: userId, email, podcastName }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.userId, email }, SECRET);
  res.json({
    token,
    user: { id: user.userId, email }
  });
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing token' });
  
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Project endpoints
app.get('/api/podcast/projects', verifyToken, (req, res) => {
  const userProjects = Array.from(projects.values())
    .filter(p => p.userId === req.user.userId);
  res.json(userProjects);
});

app.post('/api/podcast/projects', verifyToken, (req, res) => {
  const { projectName, episodeNumber, template, mood } = req.body;
  const id = 'proj_' + Date.now();
  
  const project = {
    id,
    name: projectName,
    episodeNumber,
    template,
    mood,
    status: 'draft',
    userId: req.user.userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  projects.set(id, project);
  res.status(201).json(project);
});

app.get('/api/podcast/projects/:id', verifyToken, (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  if (project.userId !== req.user.userId) return res.status(403).json({ message: 'Forbidden' });
  res.json(project);
});

app.post('/api/podcast/projects/:id/generate', verifyToken, (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  
  project.status = 'generating';
  
  // Simulate async generation
  setTimeout(() => {
    project.status = 'completed';
    project.audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
  }, 3000);
  
  res.status(202).json({ status: 'generating' });
});

app.get('/api/podcast/projects/:id/status', verifyToken, (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  
  res.json({
    status: project.status,
    progress: project.status === 'generating' ? 50 : 100,
    audioUrl: project.audioUrl
  });
});

app.get('/api/podcast/subscription/plans', (req, res) => {
  res.json([
    {
      id: 'plan_free',
      name: 'Free',
      price: 0,
      generationsPerMonth: 5,
      features: ['5 generations/month', 'Basic templates']
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      price: 29,
      generationsPerMonth: 100,
      features: ['100 generations/month', 'All templates', 'Priority support']
    }
  ]);
});

app.get('/api/podcast/stats', verifyToken, (req, res) => {
  res.json({
    generationsUsed: 0,
    generationsLimit: 10,
    storageUsed: 0
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
EOF
```

Install mock server dependencies:
```bash
npm install express cors jsonwebtoken
```

Run mock server:
```bash
node mock-api.js
```

Then run frontend:
```bash
npm run dev
```

## File Structure

```
apps/dashboard/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── podcast/
│       ├── page.tsx
│       ├── auth/
│       │   ├── login/page.tsx
│       │   └── signup/page.tsx
│       ├── dashboard/page.tsx
│       ├── generate/page.tsx
│       ├── downloads/page.tsx
│       ├── checkout/page.tsx
│       └── components/
│           ├── PodcastLayout.tsx
│           ├── TemplateCard.tsx
│           ├── ProjectCard.tsx
│           ├── AudioPlayer.tsx
│           └── index.ts
├── lib/
│   ├── auth-context.tsx
│   └── podcast/
│       ├── api-client.ts
│       └── hooks.ts
├── package.json
└── tsconfig.json
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3002)

# Production
npm run build        # Build for production
npm start            # Run production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Type check with TypeScript
npm run test         # Run tests

# Formatting
npm run format       # Format code with Prettier
```

## Development Tips

### Debugging

Enable debug mode:
```env
NEXT_PUBLIC_DEBUG=true
```

Check browser console for:
- API requests/responses
- Authentication state
- Component render issues

### Hot Module Replacement

The dev server supports HMR. File changes instantly reload.

Caveat: Page redirects reset on some file changes (auth context).

### Testing API Calls

Use browser DevTools Network tab to inspect:
- Request headers (including Authorization)
- Request/response bodies
- Status codes and timing

### Component Structure

All podcast pages extend `PodcastLayout`:

```tsx
<PodcastLayout currentTab="dashboard">
  {/* Content */}
</PodcastLayout>
```

Layout provides:
- Header with navigation
- Authentication display
- Footer
- Responsive mobile menu

## Styling Guide

### Tailwind Classes Used

**Colors**:
- Purple: `from-purple-500 to-blue-500` (primary gradient)
- Green: `from-green-500 to-emerald-500` (success)
- Red: `from-red-500/20 to-red-500/40` (danger)
- Dark: `bg-black text-white` (background)

**Spacing**: 
- Base: `p-6` (24px padding)
- Large: `p-8` (32px padding)
- Compact: `p-4` (16px)

**Borders**:
- `border border-purple-500/30` (30% opacity)
- `rounded-2xl` (24px radius)

**Responsive**:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `hidden md:flex` (hide on mobile)

## Authentication Flow

1. **Signup/Login**: 
   - POST to `/auth/signup` or `/auth/login`
   - Receive JWT token
   - Store in `localStorage.authToken`

2. **Protected Routes**:
   - `useAuth()` hook checks token
   - Auto-redirect to login if not authenticated

3. **API Requests**:
   - Axios interceptor adds `Authorization: Bearer {token}` header
   - Token included in all requests to protected endpoints

4. **Logout**:
   - Clear `localStorage.authToken`
   - Clear auth context
   - Redirect to login

## Common Tasks

### Add a New Page

1. Create file: `app/podcast/newfeature/page.tsx`
2. Use `PodcastLayout` wrapper
3. Add route to navigation in `PodcastLayout.tsx`
4. Export component as default

### Add a New Component

1. Create file: `app/podcast/components/MyComponent.tsx`
2. Export from `components/index.ts`
3. Import and use in pages

### Add New API Endpoint

1. Add to `lib/podcast/api-client.ts`:
```typescript
myNewEndpoint: () => apiClient.get('/podcast/my-endpoint')
```

2. Create hook in `lib/podcast/hooks.ts`:
```typescript
export function useMyFeature() {
  // Hook logic
}
```

3. Use in component:
```typescript
const { data, loading } = useMyFeature();
```

### Customize Styling

Edit Tailwind classes directly in components. Example:

```tsx
// Change purple to blue
className="bg-gradient-to-r from-blue-500 to-cyan-500"
```

## Troubleshooting

### "API URL not found"
- Check `.env.local` has `NEXT_PUBLIC_API_URL`
- Ensure backend is running
- Verify CORS is enabled on backend

### "Module not found"
- Run `npm install`
- Clear `.next` folder: `rm -rf .next`
- Restart dev server

### "Port already in use"
- Change port in `package.json`: `"dev": "next dev -p 3003"`
- Or kill existing process: `lsof -ti:3002 | xargs kill -9`

### "Styles not loading"
- Ensure Tailwind CSS is installed
- Check `tailwind.config.js` exists
- Restart dev server after config changes

### "Authentication not working"
- Clear `localStorage.authToken`
- Check backend is returning valid JWT
- Verify JWT secret matches between frontend and backend

## Performance Tips

1. **Images**: Use Next.js `<Image>` component
2. **Lazy Loading**: Use dynamic imports for heavy components
3. **Memoization**: Use `useMemo` for expensive computations
4. **Debouncing**: Debounce search/filter inputs

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t podcast-music .
docker run -p 3002:3002 -e NEXT_PUBLIC_API_URL=http://api:3001/api podcast-music
```

### Manual Deployment

```bash
npm run build
npm start
# Access at http://your-server:3002
```

## Support & Help

- Check `/docs` folder for component documentation
- Review API docs in `PODCAST_API_ENDPOINTS.md`
- Check integration guide in `PODCAST_MUSIC_INTEGRATION.md`

## Next Steps

1. ✅ Frontend setup complete
2. Build backend API endpoints (see `PODCAST_API_ENDPOINTS.md`)
3. Setup authentication service
4. Implement audio generation service
5. Setup payment processing
6. Deploy to staging
7. User testing
8. Production deployment

---

Happy coding! 🎵✨

Last Updated: 2026-07-18
