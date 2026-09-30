# 🚀 WISE² Git Quick Start for Team

**For**: dwise03, darrin, wisevillain86  
**Repository**: dwise03-bit/wise2-core

---

## ⚡ One-Minute Setup

```bash
# First time only
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

## 📋 Daily Workflow

### Start Your Day
```bash
git pull origin main
git checkout -b feature/what-you-are-building
```

### Before Pushing
```bash
# Use the team sync script (handles rebasing)
./scripts/git-team-sync.sh

# Or manually
git fetch origin
git rebase origin/main
git push origin feature/what-you-are-building
```

### Create Pull Request
```bash
# GitHub web: Open PR, request review
# Or use CLI:
gh pr create --fill
```

---

## 📚 What's New

### Collaboration Guide
📖 **Read this first**: `.github/COLLABORATION.md`
- Branch naming conventions
- Commit message format
- PR workflow
- Team permissions
- Troubleshooting

### Sync Script
🔄 **Use before pushing**: `scripts/git-team-sync.sh`
- Automatically rebases onto latest main
- Detects conflicts early
- Shows what you're about to push

---

## ✅ Commit Message Format

```
type(scope): description

feat(tailscale): add user to ACL
fix(github): correct permissions
chore(deps): update packages
```

**Types**: feat, fix, chore, docs, refactor, test, ci

---

## 🔀 Branch Naming

```
✅ feature/tailscale-integration
✅ fix/permission-sync-issue
✅ chore/update-dependencies
❌ my-feature
❌ fix_bug
```

---

## 🛡️ Team Permissions

| Action | dwise03 | darrin | wisevillain86 |
|--------|---------|--------|---------------|
| Push to feature branches | ✅ | ✅ | ✅ |
| Create PRs | ✅ | ✅ | ✅ |
| Merge PRs (with review) | ✅ | ✅ | ✅ |
| Push to main | ❌ Only via PR | ❌ Only via PR | ❌ Only via PR |

---

## 🆘 Need Help?

### "I want to sync with latest main before pushing"
```bash
./scripts/git-team-sync.sh
```

### "I have conflicts"
```bash
# See conflicts
git status

# Resolve in your editor, then
git add .
git rebase --continue
```

### "I need to see what changed"
```bash
# My changes vs main
git diff origin/main

# My commits vs main
git log origin/main..HEAD
```

---

## 📖 Full Guide

For complete reference, see: `.github/COLLABORATION.md`

**Key sections:**
- Branch Strategy
- Commit Messages
- PR Workflow
- Handling Conflicts
- Best Practices
- Troubleshooting

---

## 🎯 Team Goals

✅ All code reviewed before merge to main  
✅ Descriptive commits for clear history  
✅ Regular syncs to avoid conflicts  
✅ One feature per branch  
✅ Linked issues in PRs  

---

## 📞 Quick Links

- **Repo**: https://github.com/dwise03-bit/wise2-core
- **Issues**: https://github.com/dwise03-bit/wise2-core/issues
- **PRs**: https://github.com/dwise03-bit/wise2-core/pulls
- **Actions**: https://github.com/dwise03-bit/wise2-core/actions

---

**Questions?** Create an issue or comment on a PR!  
**Ready to work?** `git checkout -b feature/your-feature` 🚀
