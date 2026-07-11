# Member Leaderboards

Competitive engagement system with multiple ranking categories, achievements, and gamified progression.

## Leaderboard Types

### 1. 💰 Points Leaderboard

**Ranking:** Total points earned (all-time or filtered by period)

**Metrics:**
- Total points (primary sort)
- Current streak
- Engagement count (actions taken)

**Periods:**
- All Time (lifetime total)
- This Month (last 30 days)
- This Week (last 7 days)

**Point Awards:**
- Daily check-in: +10 points
- Content share: +5 points
- Viral post (≥5 engagement): +10 bonus points
- Social media repost: +5 points per repost

**Example:**
```
🥇 Alice Smith (Pro Tier)
   💰 1,250 points
   🔥 12-day streak
   💬 87 engagements
```

### 2. 🔥 Streak Leaderboard

**Ranking:** Current active streak (consecutive engagement days)

**Metrics:**
- Current streak (primary sort)
- Streak badge (achievement level)
- Longest streak (historical best)

**Streak Badges:**
- 🌟 Rising: 1-6 days
- ⚡ Momentum: 7-13 days
- 🎯 On Fire: 14-29 days
- 🔥 Inferno: 30+ days

**Streak Logic:**
- Checked daily for any engagement action
- Action within 24h: streak continues
- >24h gap: streak resets to 1
- Same day: no increment

**Example:**
```
🥇 Bob Johnson (Enterprise Tier)
   🔥 38-day streak
   🔥 Inferno badge
   Best: 45 days
```

### 3. 📱 Viral Leaderboard

**Ranking:** Number of viral posts created

**Metrics:**
- Viral posts count (primary sort)
- Total engagement across posts
- Average engagement per post

**Viral Criteria:**
- Post with ≥5 engagement reactions counts as "viral"
- Tracked via social_posts_generated table
- Engagement = emoji reactions + comments + shares

**Example:**
```
🥇 Charlie Williams (Free Tier)
   📱 8 viral posts
   📊 142 total engagement
   📈 17.75 avg per post
```

## User Profile Page (`/profile`)

**Individual Stats Dashboard:**
- Name, email, tier, avatar
- Total points with rank (#X out of all members)
- Current streak with best streak recorded
- Engagement count (total actions)
- Viral posts count with total reach

**Achievements Section:**
- Unlocked badges earned
- Display triggers:
  - 🔥 Inferno: 30+ day streak
  - ⚡ Momentum: 14+ day streak
  - 💰 High Roller: 500+ points
  - 📱 Viral Master: 5+ viral posts
  - 🎯 Engaged: 50+ engagement actions

**Activity Section:**
- Last active date
- Current rankings (points, streak, viral)
- Trending direction (↑ improving, → stable)

## Pages & Navigation

**`/leaderboards` - Main Leaderboards Hub**
- Type selector buttons: Points | Streaks | Viral
- Period filter (for Points only): All Time | This Month | This Week
- Ranked list (100 entries for Points, 50 for Streaks/Viral)
- Medal display: 🥇 🥈 🥉 then •
- Color-coded tiers (Enterprise=Purple, Pro=Blue, Free=Gray)

**`/profile` - Individual User Profile**
- Personal stats dashboard
- Achievement badges
- Activity tracking
- Rankings across all categories

## API Endpoints

### GET `/api/leaderboards`

**Query Parameters:**
- `type`: 'points' | 'streaks' | 'viral' (default: 'points')
- `period`: 'all' | 'week' | 'month' (only for points, default: 'all')

**Response:**
```json
{
  "type": "points",
  "period": "all",
  "leaderboard": [
    {
      "rank": 1,
      "id": 1,
      "first_name": "Alice",
      "tier": "pro",
      "total_points": 1250,
      "streak_current": 12,
      "streak_longest": 15,
      "engagement_count": 87
    }
  ],
  "timestamp": "2026-06-20T15:30:45Z"
}
```

### GET `/api/profile`

**Query Parameters:**
- `userId`: User ID to fetch (default: 1 for demo)

**Response:**
```json
{
  "id": 1,
  "first_name": "Alice",
  "email": "alice@example.com",
  "tier": "pro",
  "total_points": 1250,
  "streak_current": 12,
  "streak_longest": 15,
  "engagement_count": 87,
  "viral_posts_count": 5,
  "total_engagement": 45,
  "points_rank": 1,
  "streak_rank": 3,
  "viral_rank": 2,
  "last_active_date": "2026-06-20T10:00:00Z"
}
```

## Database Queries

**Points Ranking:**
```sql
SELECT ROW_NUMBER() OVER (ORDER BY mp.total_points DESC) as rank, ...
FROM member_progress mp
WHERE mp.total_points > 0
ORDER BY mp.total_points DESC;
```

**Streak Ranking:**
```sql
SELECT ROW_NUMBER() OVER (ORDER BY mp.streak_current DESC) as rank, ...
FROM member_progress mp
WHERE mp.streak_current > 0
ORDER BY mp.streak_current DESC;
```

**Viral Ranking:**
```sql
SELECT COUNT(*) as viral_posts, SUM(engagement_count) as total_engagement
FROM social_posts_generated
WHERE engagement_count >= 5;
```

## Gamification Strategy

**Point System:**
```
Daily Check-in:           +10 pts
Viral Share (≥5 react):   +10 pts
Social Media Post:        +5 pts
Per Repost:               +5 pts
Comment/Reply:            +1 pt
```

**Streak System:**
- Consecutive engagement days
- Visible on leaderboard
- Badge unlocks at milestones (7, 14, 30 days)
- Resets after >24h gap

**Viral Content:**
- Posts with 5+ reactions
- Tracked automatically
- Awards points to creator
- Displayed on leaderboard
- Featured in admin dashboard

## Performance

| Query | Latency | Rows |
|-------|---------|------|
| Points Top 100 | <100ms | 100 |
| User Profile | <50ms | 1 |
| Streak Top 50 | <100ms | 50 |
| Achievements | <10ms | <10 |

## Future Enhancements (Task 12+)

- **Team Leaderboards:** Guild/group rankings
- **Time-based Competitions:** Weekly tournaments
- **Seasonal Resets:** Quarterly points resets
- **Badges & Trophies:** Visual achievement display
- **Notifications:** Rank change alerts
- **Share-to-Social:** Brag button for achievements

## Monitoring

**Leaderboard Health Checks:**
```bash
# Top 10 members
curl http://api/leaderboards?type=points

# Individual profile
curl http://api/profile?userId=1

# Check for stuck streaks (inactive >24h)
SELECT COUNT(*) FROM member_progress WHERE streak_current > 0 AND last_active_date < NOW() - INTERVAL '1 day';
```

## Navigation

```
/leaderboards     - Main competitive hub (Points/Streaks/Viral)
/profile          - Individual member stats & achievements
/admin/news       - Admin analytics (existing)
/admin/bots/*     - Bot management (existing)
```
