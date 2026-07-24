# Website Deployment Cheatsheet

## Automated (Recommended)

```bash
./scripts/deploy-website.sh
```

Handles everything: kills old process, deploys build, starts server, verifies.

---

## Manual Quick Deploy

```bash
# 1. Stop old
ssh dwise@173.208.147.165 "kill -9 \$(lsof -t -i :3000) 2>/dev/null; sleep 1" || true

# 2. Deploy .next build
rsync -avz --delete apps/website/.next/ \
  dwise@173.208.147.165:/home/dwise/wise2-core/apps/website/.next/

# 3. Start new
ssh dwise@173.208.147.165 "
  cd /home/dwise/wise2-core/apps/website && \
  PORT=3000 npx next start > /tmp/website.log 2>&1 &
  sleep 2
"

# 4. Verify
curl -I http://173.208.147.165:3000
```

---

## Troubleshooting

| Issue | Command |
|-------|---------|
| Port in use | `lsof -i :3000` |
| Kill process | `kill -9 <PID>` or `ssh dwise@173.208.147.165 "kill -9 $(lsof -t -i :3000)"` |
| View logs | `ssh dwise@173.208.147.165 tail -50 /tmp/website.log` |
| Check if running | `ssh dwise@173.208.147.165 lsof -i :3000` |
| Test locally | `cd apps/website && npm run build && PORT=3000 npx next start` |

---

## Build & Test Locally

```bash
cd apps/website

# Build for production
npm run build

# Test on port 3000
PORT=3000 npx next start

# Test on different port
PORT=3001 npx next start
```

---

## The Correct Command

**This works:**
```bash
cd /home/dwise/wise2-core/apps/website && PORT=3000 npx next start
```

**This does NOT work:**
```bash
cd /home/dwise && npm start --port 3000   # turbo doesn't understand port flag
```

---

## Status Check

```bash
# Server running?
ssh dwise@173.208.147.165 "lsof -i :3000 | grep LISTEN"

# Responding?
ssh dwise@173.208.147.165 "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"
# Should return: 200

# Process details?
ssh dwise@173.208.147.165 "ps aux | grep 'next start' | grep -v grep"
```

---

## Emergency Kill & Restart

```bash
ssh dwise@173.208.147.165 "
  echo 'Killing all node processes...'
  pkill -f 'next start' || true
  pkill -f 'node' || true
  sleep 2
  echo 'Starting fresh...'
  cd /home/dwise/wise2-core/apps/website && PORT=3000 npx next start > /tmp/website.log 2>&1 &
  sleep 2
  lsof -i :3000
"
```

---

## When Changes Don't Show Up

1. **Edit source**: `apps/website/app/page.tsx`
2. **Rebuild**: `npm run build` (creates new `.next/`)
3. **Deploy**: `rsync -avz --delete apps/website/.next/ ...`
4. **Restart**: Kill old process, start new
5. **Verify**: `curl -I http://173.208.147.165:3000`

---

**Remember**: Always deploy `.next/` after building. The `.next/` directory contains the compiled, production-optimized code.
