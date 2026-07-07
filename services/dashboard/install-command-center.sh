#!/bin/bash
cd ~/wise-defense-saas/dashboard-v2
rm -rf .next
npm install
fuser -k 3002/tcp >/dev/null 2>&1 || true
npm run dev -- -p 3002
