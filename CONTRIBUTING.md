# Contributing to WISE² Genesis

Welcome to the WISE² team! This guide ensures smooth collaboration.

## Quick Start

```bash
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
git config user.name "Your Name"
git config user.email "your.email@example.com"
./scripts/setup-git-hooks.sh
pnpm install
```

## Development Workflow

```bash
# Create feature branch
git checkout -b feature/what-you-are-building

# Make changes & test
npm test
npm run lint

# Commit with format: type(scope): description
git commit -m "feat(tailscale): add user to ACL"

# Sync with main
./scripts/git-team-sync.sh

# Push & create PR
git push origin feature/what-you-are-building
gh pr create --fill
```

## Commit Format

```
type(scope): description

type: feat, fix, chore, docs, refactor, perf, test, ci, security
```

## Code Standards

- TypeScript required
- 80% test coverage minimum
- ESLint & Prettier enforced
- Documentation for public APIs

```bash
npm run format
npm run lint
npm test -- --coverage
```

## Pull Request Checklist

- [ ] Tests pass
- [ ] Linting passes
- [ ] No secrets committed
- [ ] Documentation updated
- [ ] Issue linked
- [ ] Branch synced with main

## Security

### Never Commit
- API keys or tokens
- Passwords
- Database credentials
- Private keys

### Git Hooks Protect
- Pre-commit: blocks secrets, large files, direct main commits
- Commit-msg: enforces conventional commits format

## Git Hooks

Install once:
```bash
./scripts/setup-git-hooks.sh
```

What they check:
- No secrets (env files, keys, etc)
- No large files (>10MB)
- No direct commits to main
- Proper commit message format

## Review Process

**Before Opening PR**:
- Code tested locally
- Branch synced with main (`./scripts/git-team-sync.sh`)
- All checks pass

**Merge Requirements**:
- All checks pass ✅
- At least 1 approval ✅
- No unresolved conversations ✅
- Branch up-to-date ✅

## Code Review

**As Reviewer**:
- Check correctness
- Review performance impact
- Verify security
- Approve when satisfied

**As Author**:
- Respond to feedback
- Create new commits (don't force-push)
- Ask for clarification if needed

## Questions?

- **Quick Start**: GIT_QUICK_START.md
- **Full Guide**: .github/COLLABORATION.md
- **Code Owners**: .github/CODEOWNERS
- **Issues**: GitHub Issues

---

**Thank you for contributing to WISE² Genesis! 🚀**
