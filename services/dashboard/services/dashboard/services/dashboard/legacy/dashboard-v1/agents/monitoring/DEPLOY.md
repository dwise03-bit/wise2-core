# Monitoring System Deployment Guide

## 🚀 Quick Deploy (5 minutes)

### Step 1: SSH to VPS & Create Database Table
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@51.81.80.252

# Create monitoring table
psql wisedefense << 'EOF'
CREATE TABLE IF NOT EXISTS monitoring_cycles (
  id SERIAL PRIMARY KEY,
  cycle_number INT,
  cycle_timestamp TIMESTAMP,
  cycle_duration_seconds INT,
  uptime_percentage FLOAT,
  uptime_status VARCHAR(20),
  web_vitals_lcp FLOAT,
  web_vitals_fid FLOAT,
  web_vitals_cls FLOAT,
  api_latency_p50 INT,
  api_latency_p95 INT,
  api_latency_p99 INT,
  chat_sessions INT,
  chat_bounce_rate FLOAT,
  active_users INT,
  conversion_rate FLOAT,
  popular_buttons JSONB,
  escalation_rate FLOAT,
  escalation_count INT,
  negative_sentiment_pct FLOAT,
  trending_questions JSONB,
  new_knowledge_gaps JSONB,
  response_quality_score INT,
  user_satisfaction_pct FLOAT,
  mrr FLOAT,
  arr FLOAT,
  daily_revenue FLOAT,
  churn_rate FLOAT,
  ltv FLOAT,
  chat_adoption FLOAT,
  course_adoption FLOAT,
  booking_adoption FLOAT,
  shop_adoption FLOAT,
  anomalies_detected INT,
  anomalies_data JSONB,
  recommendations_count INT,
  recommendations_data JSONB,
  cycle_status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_timestamp
  ON monitoring_cycles(cycle_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_status
  ON monitoring_cycles(cycle_status);
CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_created
  ON monitoring_cycles(created_at DESC);
EOF

# Verify table created
psql wisedefense -c "\dt monitoring_cycles"
```

### Step 2: Copy Monitoring Files to VPS
```bash
# From your local machine
scp -r -i ~/.ssh/id_ed25519 /home/dwise03/wise-defense-saas/dashboard/agents/monitoring \
  ubuntu@51.81.80.252:/home/ubuntu/wise-defense-saas/dashboard/agents/

# Verify files copied
ssh -i ~/.ssh/id_ed25519 ubuntu@51.81.80.252 "ls -la /home/ubuntu/wise-defense-saas/dashboard/agents/monitoring/"
```

### Step 3: Install Dependencies
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@51.81.80.252
cd /home/ubuntu/wise-defense-saas/dashboard/agents/monitoring

# Install npm dependencies
npm install

# Verify installation
npm list
```

### Step 4: Set Environment Variables
```bash
# Add Discord webhook to .env
echo "DISCORD_MONITORING_WEBHOOK_URL=$(grep DISCORD_ALERTS_WEBHOOK_URL ../.env | cut -d= -f2)" >> .env.local

# Add other variables
echo "MONITORING_INTERVAL_MINUTES=15" >> .env.local
echo "NODE_ENV=production" >> .env.local

# Verify
cat .env.local
```

### Step 5: Test First Cycle
```bash
# Run one cycle manually
node start.js

# Should output:
# ✅ First cycle successful!
# 📅 Next cycle in 15 minutes...

# Then press Ctrl+C to stop
```

### Step 6: Start with PM2
```bash
# Install PM2 globally (if not already)
npm install -g pm2

# Start monitoring
pm2 start start.js --name "monitoring-orchestrator" --watch

# Verify it's running
pm2 list
pm2 logs monitoring-orchestrator
```

### Step 7: Set PM2 to Start on Reboot
```bash
pm2 startup
pm2 save
```

---

## ✅ Verification Checklist

- [ ] Table created in PostgreSQL: `psql wisedefense -c "SELECT COUNT(*) FROM monitoring_cycles"`
- [ ] Files copied to VPS: `ls /home/ubuntu/wise-defense-saas/dashboard/agents/monitoring/`
- [ ] Dependencies installed: `npm list` shows pg, dotenv
- [ ] Environment variables set: `cat .env.local`
- [ ] First cycle completed: `pm2 logs monitoring-orchestrator | head -20`
- [ ] Discord alert posted: Check #monitoring-alerts channel
- [ ] PM2 process running: `pm2 list` shows "monitoring-orchestrator"
- [ ] Data in database: `psql wisedefense -c "SELECT COUNT(*) FROM monitoring_cycles"`

---

## 🐛 Troubleshooting

### "Cannot find module 'pg'"
```bash
cd /home/ubuntu/wise-defense-saas/dashboard/agents/monitoring
npm install pg dotenv
```

### "No such table: monitoring_cycles"
```bash
psql wisedefense < monitoring-setup.sql
```

### "Discord webhook not sending"
```bash
# Check webhook URL is set
grep DISCORD .env.local

# Test webhook manually
curl -X POST $DISCORD_MONITORING_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content":"Test alert"}'
```

### "Database connection timeout"
```bash
# Verify database is running
psql wisedefense -c "SELECT NOW()"

# Check DATABASE_URL
echo $DATABASE_URL
```

---

## 📊 View Results

### Check Latest Cycle
```bash
psql wisedefense << 'EOF'
SELECT 
  cycle_number,
  cycle_timestamp,
  uptime_percentage,
  response_quality_score,
  mrr,
  anomalies_detected,
  recommendations_count,
  cycle_status
FROM monitoring_cycles
ORDER BY cycle_timestamp DESC
LIMIT 1;
EOF
```

### View All Cycles
```bash
psql wisedefense << 'EOF'
SELECT 
  TO_CHAR(cycle_timestamp, 'YYYY-MM-DD HH:24:MI') as time,
  uptime_percentage,
  response_quality_score,
  escalation_rate,
  anomalies_detected,
  cycle_status
FROM monitoring_cycles
ORDER BY cycle_timestamp DESC
LIMIT 10;
EOF
```

### View Recommendations
```bash
psql wisedefense << 'EOF'
SELECT 
  cycle_timestamp,
  recommendations_data
FROM monitoring_cycles
WHERE recommendations_count > 0
ORDER BY cycle_timestamp DESC
LIMIT 5;
EOF
```

---

## 🔄 Monitoring Status Commands

```bash
# View logs
pm2 logs monitoring-orchestrator

# View with real-time updates
pm2 monit

# Restart if needed
pm2 restart monitoring-orchestrator

# Stop monitoring
pm2 stop monitoring-orchestrator

# Remove from PM2
pm2 delete monitoring-orchestrator
```

---

## 📈 What to Expect

**First Run:**
- All agents complete in ~3-4 seconds
- Discord alert posts within 5 seconds
- Cycle logged to database
- Next cycle waits 15 minutes (or your configured interval)

**Subsequent Runs:**
- Agents run in parallel
- Anomalies detected by comparing to previous cycles
- Recommendations prioritized
- Discord alert updated with findings

---

## 🎯 Next Steps

1. ✅ Deploy and test first cycle
2. ✅ Monitor for 24 hours - collect baseline data
3. ⏳ After 1 week - tune anomaly thresholds
4. ⏳ Create dashboard for visualization
5. ⏳ Train team on interpreting alerts
