# Contributing to WISE² Core

Thank you for your interest in contributing to WISE² Core! This document outlines our development practices, code standards, and workflow.

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (check with `node --version`)
- **npm** 9+ or **pnpm** (check with `npm --version`)
- **Docker** & **Docker Compose** (for local deployment testing)
- **Git** 2.40+

### Local Setup

```bash
# Clone the repository
git clone https://github.com/wise2-defense/wise2-core.git
cd wise2-core

# Install dependencies
npm install

# Start development server
npm run dev
```

**For Docker-based development:**

```bash
# Build and run the full stack locally
docker-compose -f docker-compose.prod.yml up --build
```

---

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

```
feature/<feature-name>      # New feature or addition
fix/<bug-description>       # Bug fix
docs/<documentation>        # Documentation updates
refactor/<improvement>      # Code refactoring
test/<test-name>           # Test additions
chore/<maintenance>        # Dependencies, build scripts, etc.
```

**Example:** `feature/sound-labs-video-player` or `fix/docker-compose-network-issue`

### Commits

- Write clear, descriptive commit messages
- Use the present tense ("Add feature" not "Added feature")
- Reference issues when applicable: "Fix #123: Improve audio quality"
- Keep commits atomic and focused

**Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that don't affect code meaning
- `refactor:` Code change without feature or fix
- `perf:` Code change that improves performance
- `test:` Adding or updating tests
- `chore:` Build process, dependency updates, etc.

### Pull Requests

Before opening a PR:

1. **Update main branch:** `git pull origin main`
2. **Create feature branch:** `git checkout -b feature/your-feature`
3. **Make your changes** with clear commits
4. **Test locally:** `npm run dev` and `npm run test`
5. **Push your branch:** `git push origin feature/your-feature`
6. **Open a PR** with:
   - Clear title describing the change
   - Description of what changed and why
   - Related issue numbers (if applicable)
   - Testing steps for reviewers

**PR Title Format:**
```
[type]: Brief description

Examples:
[FEATURE] Add audio waveform visualization
[FIX] Correct container port mapping in docker-compose
[DOCS] Update installation guide for ARM systems
```

---

## Code Standards

### TypeScript

- Strict mode enabled (`strict: true` in `tsconfig.json`)
- No `any` types without explanation
- Export clear, well-named types
- Use `const` by default, `let` when necessary, never `var`

### React Components

- Functional components with hooks (no class components)
- Props interface defined above component
- Memoize expensive components with `React.memo`
- Use Framer Motion for animations with `prefers-reduced-motion` support

**Example:**
```typescript
interface SoundLabsHeroProps {
  title: string;
  description?: string;
}

export const SoundLabsHero: React.FC<SoundLabsHeroProps> = ({
  title,
  description,
}) => {
  return (
    <section className="hero">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </section>
  );
};
```

### CSS/Tailwind

- Use Tailwind CSS utilities (no arbitrary inline styles)
- Extend theme in `tailwind.config.ts` for custom colors/sizes
- Respect `prefers-reduced-motion` in animations
- Test at breakpoints: mobile (320px), tablet (768px), desktop (1440px)

### File Organization

```
wise-touch/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   │   ├── layout/            # Layout components
│   │   └── sound-labs/        # Sound Labs specific
│   ├── lib/                   # Utilities and helpers
│   ├── styles/                # Global styles
│   └── types/                 # TypeScript types
├── public/                     # Static assets
└── docker-compose.prod.yml     # Deployment config
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Test user-facing behavior, not implementation details
- Use descriptive test names: `it('should display package prices in USD')`
- Aim for >80% coverage on critical paths
- Mock external dependencies (APIs, third-party libraries)

---

## Documentation

All documentation lives in `*.md` files at the repository root:

- **README.md** — Project overview and quick start
- **INSTALLATION_INDEX.md** — Installation and deployment guide
- **SOUND_LABS_GUIDE.md** — Sound Labs feature documentation
- **CHANGELOG.md** — Release notes and version history
- **CONTRIBUTING.md** — This file
- **CODEOWNERS** — Code ownership and review requirements

When adding features:
1. Update the relevant `*.md` guide
2. Add inline code comments for complex logic
3. Update CHANGELOG.md under the "Unreleased" section

---

## Deployment

### Local Testing

```bash
# Test production build locally
docker-compose -f docker-compose.prod.yml up --build

# Access running services:
# - Website: http://localhost:3001
# - API: http://localhost:3101
# - Dashboard: http://localhost:3000
```

### Staging Deployment

The staging environment automatically deploys from `develop` branch on push. Test your changes there before merging to `main`.

### Production Deployment

Production deployments happen from `main` branch. The CI/CD pipeline:
1. Runs tests and linters
2. Builds Docker images
3. Deploys to production server (173.208.147.165)
4. Runs health checks
5. Rolls back on failure

---

## Code Review

### For Authors

- Self-review your code before requesting review
- Respond to feedback promptly
- Ask questions if feedback is unclear
- Keep PR scope focused and manageable

### For Reviewers

- Review for correctness, clarity, and style
- Suggest improvements, don't demand perfection
- Approve once code meets standards
- Mark "Approved" when ready to merge

---

## Security

- **Never commit secrets** — use `.env` files and environment variables
- **Keep dependencies updated** — enable Dependabot
- **Report vulnerabilities privately** — see SECURITY.md
- **Review dependencies** before adding new packages

---

## Questions?

- **Documentation:** Check README.md and SOUND_LABS_GUIDE.md
- **Installation:** See INSTALLER_README.md
- **Issues:** Open a GitHub issue with reproduction steps
- **General:** Check existing issues before creating duplicates

---

## Code of Conduct

- Be respectful and inclusive
- Focus on the work, not the person
- Welcome diverse perspectives
- Report code of conduct violations privately

---

## License

By contributing to WISE² Core, you agree that your contributions are licensed under the same license as the project (All rights reserved).

---

**Ready to contribute?** Pick an issue, create a branch, and start coding! 🚀

---

**Questions about these guidelines?** Open an issue or contact the development team.

**Last updated:** 2026-07-11
