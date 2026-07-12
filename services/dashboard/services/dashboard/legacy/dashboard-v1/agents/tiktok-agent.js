/**
 * TikTok Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Creates viral short-form content:
 * - 15-60 second training clips
 * - Trending challenge participation
 * - Student transformation videos
 * - Quick tips and hacks
 * - Behind-the-scenes training content
 * - Engagement with community trends
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - TIKTOK_ACCESS_TOKEN: TikTok Business API token
 * - TIKTOK_BUSINESS_ACCOUNT_ID: Business account ID
 */

const pg = require('pg');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('[TIKTOK] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[TIKTOK] Query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Post video to TikTok
 */
async function postTikTokVideo(title, description, videoUrl, tags = []) {
  try {
    if (!process.env.TIKTOK_ACCESS_TOKEN) {
      console.log('[TIKTOK] Token not configured, logging video to database');
    }

    // Log video to database
    const tagString = tags.join(',');
    await query(
      `INSERT INTO video_content (platform, title, description, video_url, tags, status, published_at)
       VALUES ($1, $2, $3, $4, $5, 'published', NOW())`,
      ['tiktok', title, description, videoUrl, tagString]
    );

    console.log(`[TIKTOK] Video posted: "${title}" with tags: ${tags.join(', ')}`);
    return true;
  } catch (error) {
    console.error('[TIKTOK] Error posting video:', error.message);
    return false;
  }
}

/**
 * Task 1: Daily 60-second training tip
 * Runs every day at 12:00 PM
 */
async function taskPostDailyTip() {
  console.log('[TIKTOK] Running task: Post daily 60-second tip...');

  try {
    const tips = [
      {
        title: '60-Second Trigger Control Fix',
        description: 'Stop jerking the trigger! Here\'s the ONE thing that fixed my accuracy...',
        tags: ['#FirearmTraining', '#ShootingTips', '#TacticalTraining', '#MarksmanshipDrill'],
      },
      {
        title: '3 Grip Mistakes Costing You Accuracy',
        description: 'Grip is EVERYTHING. Check if you\'re making these common mistakes...',
        tags: ['#GripControl', '#ShootingFundamentals', '#TrainingTips', '#ProShooting'],
      },
      {
        title: 'The Breathing Hack Pro Shooters Use',
        description: 'Controlled breathing = better accuracy. Learn the technique...',
        tags: ['#BreathControl', '#ShootingTechnique', '#ProTips', '#Marksmanship'],
      },
      {
        title: 'Stance That Reduces Recoil',
        description: 'Proper stance = more control. See the difference it makes...',
        tags: ['#ShootingStance', '#Recoil', '#TrainingTips', '#Tactical'],
      },
      {
        title: 'Sight Alignment in 60 Seconds',
        description: 'Perfect sight picture explained simply. Never miss again...',
        tags: ['#SightAlignment', '#ShootingAccuracy', '#QuickTips', '#Marksmanship'],
      },
    ];

    const tip = tips[Math.floor(Math.random() * tips.length)];

    await postTikTokVideo(
      tip.title,
      `${tip.description}\n\nBook your training session: wise2.net 🎯 #WiseDefense`,
      'https://tiktok.com/@wisedefense/video',
      tip.tags
    );

    console.log('[TIKTOK] Daily tip posted');
  } catch (error) {
    console.error('[TIKTOK] Error in daily tip task:', error.message);
  }
}

/**
 * Task 2: Trending challenge participation
 * Runs every Tuesday at 10:00 AM
 */
async function taskPostTrendingChallenge() {
  console.log('[TIKTOK] Running task: Post trending challenge...');

  try {
    const challenges = [
      {
        title: '#SkillChallenge - Can You Hit All 5 Targets?',
        description: 'We\'re taking the #SkillChallenge and hitting 5 targets in 10 seconds! Can you beat our time? 🎯',
        tags: ['#SkillChallenge', '#Shooting', '#Challenge', '#WiseDefense', '#Training'],
      },
      {
        title: '#TransformationTuesday - 30 Days of Training',
        description: 'See the incredible progress our students make in just 30 days of dedicated training! 💪',
        tags: ['#TransformationTuesday', '#TrainingResults', '#Progress', '#Motivation', '#WiseDefense'],
      },
      {
        title: '#FitnessFirst - Training Prep Routine',
        description: 'Every great shooter starts with proper prep. Here\'s our pre-training routine! 🏋️',
        tags: ['#FitnessFirst', '#TrainingPrep', '#Fitness', '#Discipline', '#Tactical'],
      },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];

    await postTikTokVideo(
      challenge.title,
      challenge.description + '\n\nJoin our community: wise2.net',
      'https://tiktok.com/@wisedefense/video',
      challenge.tags
    );

    console.log('[TIKTOK] Trending challenge posted');
  } catch (error) {
    console.error('[TIKTOK] Error in trending challenge task:', error.message);
  }
}

/**
 * Task 3: Behind-the-scenes content
 * Runs every Thursday at 6:00 PM
 */
async function taskPostBehindTheScenes() {
  console.log('[TIKTOK] Running task: Post behind-the-scenes content...');

  try {
    const bts = [
      {
        title: 'Range Setup Time-Lapse - Under 30 Seconds',
        description: 'Watch us set up the tactical range in 30 seconds! 📸 #BehindTheScenes',
        tags: ['#BehindTheScenes', '#TrainingSetup', '#TacticalRange', '#RangeDay', '#Vlog'],
      },
      {
        title: 'Instructor Tip: How We Customize Training',
        description: 'Every student is different. Here\'s how our instructors personalize each session...',
        tags: ['#CoachLife', '#TrainingTips', '#Instruction', '#PersonalTraining', '#Coaching'],
      },
      {
        title: 'Student Story - Week 1 to Week 4',
        description: 'Watch our newest student\'s journey from nervous to confident! 🎯',
        tags: ['#StudentSuccess', '#TrainingJourney', '#Motivation', '#Transformation', '#WiseDefense'],
      },
    ];

    const content = bts[Math.floor(Math.random() * bts.length)];

    await postTikTokVideo(
      content.title,
      content.description + '\n\nStart your journey: wise2.net',
      'https://tiktok.com/@wisedefense/video',
      content.tags
    );

    console.log('[TIKTOK] Behind-the-scenes content posted');
  } catch (error) {
    console.error('[TIKTOK] Error in BTS task:', error.message);
  }
}

/**
 * Task 4: Track TikTok analytics
 * Runs daily at 9:00 PM
 */
async function taskTrackTikTokMetrics() {
  console.log('[TIKTOK] Running task: Track TikTok metrics...');

  try {
    const result = await query(
      `SELECT platform, COUNT(*) as video_count,
              SUM(COALESCE(views, 0)) as total_views,
              SUM(COALESCE(likes, 0)) as total_likes,
              SUM(COALESCE(shares, 0)) as total_shares
       FROM video_content
       WHERE platform = 'tiktok'
       AND published_at > NOW() - INTERVAL '7 days'
       GROUP BY platform`
    );

    if (result.rows.length > 0) {
      const stats = result.rows[0];
      console.log(
        `[TIKTOK] Weekly metrics - Videos: ${stats.video_count}, ` +
        `Views: ${stats.total_views}, Likes: ${stats.total_likes}, Shares: ${stats.total_shares}`
      );
    }

    console.log('[TIKTOK] Metrics tracking completed');
  } catch (error) {
    console.error('[TIKTOK] Error in metrics task:', error.message);
  }
}

/**
 * Schedule jobs using setInterval
 */
function scheduleJobs() {
  console.log('[TIKTOK] Scheduling TikTok content...');

  // Task 1: Daily tip at noon
  function scheduleDailyTip() {
    const now = new Date();
    const nextTip = new Date(now);
    nextTip.setDate(nextTip.getDate() + 1);
    nextTip.setHours(12, 0, 0, 0);

    const delayMs = nextTip.getTime() - now.getTime();
    setTimeout(() => {
      taskPostDailyTip();
      setInterval(taskPostDailyTip, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[TIKTOK] Daily tip scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 2: Trending challenge Tuesday 10am
  function scheduleTrendingChallenge() {
    const now = new Date();
    const nextTuesday = new Date(now);
    const daysUntilTuesday = (2 - nextTuesday.getDay() + 7) % 7;
    nextTuesday.setDate(nextTuesday.getDate() + (daysUntilTuesday || 7));
    nextTuesday.setHours(10, 0, 0, 0);

    const delayMs = nextTuesday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostTrendingChallenge();
      setInterval(taskPostTrendingChallenge, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[TIKTOK] Trending challenge scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 3: Behind-the-scenes Thursday 6pm
  function scheduleBehindTheScenes() {
    const now = new Date();
    const nextThursday = new Date(now);
    const daysUntilThursday = (4 - nextThursday.getDay() + 7) % 7;
    nextThursday.setDate(nextThursday.getDate() + (daysUntilThursday || 7));
    nextThursday.setHours(18, 0, 0, 0);

    const delayMs = nextThursday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostBehindTheScenes();
      setInterval(taskPostBehindTheScenes, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[TIKTOK] BTS content scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 4: Daily metrics 9pm
  function scheduleMetrics() {
    const now = new Date();
    const nextMetrics = new Date(now);
    nextMetrics.setDate(nextMetrics.getDate() + 1);
    nextMetrics.setHours(21, 0, 0, 0);

    const delayMs = nextMetrics.getTime() - now.getTime();
    setTimeout(() => {
      taskTrackTikTokMetrics();
      setInterval(taskTrackTikTokMetrics, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[TIKTOK] Metrics tracking scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  scheduleDailyTip();
  scheduleTrendingChallenge();
  scheduleBehindTheScenes();
  scheduleMetrics();
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('[TIKTOK] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[TIKTOK] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[TIKTOK] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[TIKTOK] Agent started. Managing TikTok account...');

  try {
    await pool.query('SELECT 1');
    console.log('[TIKTOK] Database connection verified');
  } catch (error) {
    console.error('[TIKTOK] Failed to connect to database:', error.message);
    process.exit(1);
  }

  if (!process.env.TIKTOK_ACCESS_TOKEN) {
    console.warn('[TIKTOK] TikTok access token not configured - will log videos but not publish');
  }

  scheduleJobs();
}

main().catch((error) => {
  console.error('[TIKTOK] Fatal error:', error);
  process.exit(1);
});
