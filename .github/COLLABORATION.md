# WISE² Git Collaboration Guide

**Team**: dwise03, darrin, wisevillain86  
**Repository**: dwise03-bit/wise2-core  
**Last Updated**: 2026-09-30

---

## Quick Start

### Clone & Setup
```bash
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Daily Workflow
```bash
# Before starting work
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Work and commit
git add .
git commit -m "feat(area): description"

# Push when ready
git push origin feature/your-feature-name

# Create pull request on GitHub
# Link to issue if applicable
# Request review from team
# Merge after approval
```

---

## Branch Strategy

### Main Branches
- **main** — Production code. Always stable. Protected branch.
- **develop** (if used) — Integration branch for features

### Feature Branches
```
feature/                   # New features
fix/                       # Bug fixes
chore/                      # Maintenance, deps, cleanup
docs/                       # Documentation
refactor/                   # Code reorganization
```

### Branch Naming
```
✅ feature/tailscale-acl-updates
✅ fix/github-permission-sync
✅ chore/update-dependencies
❌ Feature1
❌ my-cool-feature
❌ fix_bug
```

---

## Commit Messages

### Format
```
type(scope): description

Body (optional, for context)
- Bullet 1
- Bullet 2

Fixes: #123
Co-Authored-By: Name <email>
```

### Types
- **feat** — New feature
- **fix** — Bug fix
- **chore** — Maintenance (deps, cleanup)
- **docs** — Documentation
- **refactor** — Code restructuring
- **test** — Tests only
- **ci** — CI/CD changes
- **security** — Security fixes

### Examples
```bash
git commit -m "feat(tailscale): add wisevillain86 to ACL"
git commit -m "fix(github): correct username spelling in permissions"
git commit -m "chore(deps): update npm packages"
```

---

## Pull Request Workflow

### Before Opening PR
1. **Sync with main** — `git pull origin main`
2. **Test locally** — Run relevant tests
3. **Self-review** — Check your own changes first
4. **Push branch** — `git push origin feature/name`

### PR Checklist
- [ ] Branch is up to date with main
- [ ] All tests pass locally
- [ ] Code follows project style
- [ ] Commit messages are descriptive
- [ ] No secrets or credentials committed
- [ ] Related issue is linked

### PR Title & Description
```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Tests pass
- [ ] No new warnings
- [ ] Documentation updated
```

### Review Process
1. Push feature branch
2. Open PR with descriptive title
3. Request review from team
4. Address feedback with new commits (don't force-push)
5. Merge when approved

---

## Staying in Sync

### Daily Sync
```bash
# At start of day
git pull origin main

# Before opening PR
git fetch origin
git rebase origin/main

# If conflicts arise
git merge --abort  # Start over if needed
# OR
git rebase --continue  # Resume if rebasing
```

### Handling Conflicts
```bash
# Pull latest main
git pull origin main

# Resolve conflicts in editor
# Mark resolved
git add .
git commit -m "chore: resolve merge conflicts"
git push origin feature/name
```

### Sync a Fork (if applicable)
```bash
git remote add upstream https://github.com/dwise03-bit/wise2-core.git
git fetch upstream
git rebase upstream/main
git push origin main
```

---

## Team Permissions

| User | Role | Access |
|------|------|--------|
| dwise03 | Admin | Full repo + branch protection |
| darrin | Write | Push, PR, merge with review |
| wisevillain86 | Write | Push, PR, merge with review |

### What Each Can Do
- **Push to feature branches** ✅
- **Create pull requests** ✅
- **Comment on PRs** ✅
- **Approve PRs** ✅
- **Merge PRs** ✅ (after review)
- **Push to main** ❌ (only via approved PR)
- **Delete branches** ✅ (after merge)
- **Change branch protection** ❌ (admin only)

---

## CI/CD Integration

### Automated Checks
- GitHub Actions runs on every PR
- Port validation checks before push
- Tests run automatically

### Before Merging
- All checks must pass ✅
- At least one review required ✅
- No unresolved conversations ✅
- Branch must be up to date ✅

---

## Common Tasks

### I want to work on an existing issue
```bash
git pull origin main
git checkout -b fix/issue-123
# Make changes
git commit -m "fix(area): resolve issue #123"
git push origin fix/issue-123
# Open PR linking to #123
```

### I made a mistake in my last commit
```bash
# Haven't pushed yet
git commit --amend
git push -f origin feature/name

# Already pushed (create new commit instead)
git commit -m "fix: revert problematic change"
git push origin feature/name
```

### I want to update my branch with latest main
```bash
git fetch origin
git rebase origin/main
git push origin feature/name --force-with-lease
```

### I want to see what changed
```bash
# Your changes vs main
git diff origin/main

# Your commits vs main
git log origin/main..HEAD

# Full diff with main
git log -p origin/main..HEAD
```

---

## Troubleshooting

### "Your branch and origin/main have diverged"
```bash
git pull origin main
# Resolve any conflicts
git commit -m "chore: sync with main"
git push origin feature/name
```

### "Permission denied" when pushing
```bash
# Check your GitHub SSH key or personal access token
git config -l | grep credential
ssh -T git@github.com
```

### "Large files preventing push"
```bash
# Check file size
git ls-tree -r -t -l --full-tree HEAD | sort -k 4 -rn | head -20

# Remove large file from history (if needed)
git filter-branch --tree-filter 'rm -f <file>'
```

---

## Best Practices

### Do
✅ Pull before starting work  
✅ Create descriptive commits  
✅ Use meaningful branch names  
✅ Link issues in PRs  
✅ Request reviews  
✅ Keep branches small & focused  
✅ Update branch before merging  

### Don't
❌ Push directly to main  
❌ Commit secrets/credentials  
❌ Force-push to main  
❌ Merge your own PR without review  
❌ Create "WIP" branches without description  
❌ Leave unresolved conversations  
❌ Commit large binary files  

---

## Useful Git Aliases

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'
```

---

## Questions?

Refer to:
- GitHub Issues — For questions about code/features
- Pull Request Comments — For code review discussion
- CLAUDE.md — For project-specific workflow

---

**Last sync**: 2026-09-30  
**Team size**: 3  
**Main branch protection**: ✅ Enabled
