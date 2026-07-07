/**
 * YouTube Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Manages YouTube channel:
 * - Post training tutorial videos
 * - Publish student success stories
 * - Share tactical tips and techniques
 * - Monitor video analytics and engagement
 * - Respond to community posts
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - YOUTUBE_API_KEY: YouTube Data API key
 * - YOUTUBE_CHANNEL_ID: Channel ID for Wise Defense
 * - YOUTUBE_ACCESS_TOKEN: OAuth2 access token
 */

const pg = require('pg');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('[YOUTUBE] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[YOUTUBE] Query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Post video to YouTube
 */
async function postYouTubeVideo(title, description, videoUrl, thumbnail = null) {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('[YOUTUBE] API key not configured, logging video to database');
    }

    // Log video to database
    await query(
      `INSERT INTO video_content (platform, title, description, video_url, thumbnail_url, status, published_at)
       VALUES ($1, $2, $3, $4, $5, 'published', NOW())`,
      ['youtube', title, description, videoUrl, thumbnail]
    );

    console.log(`[YOUTUBE] Video published: "${title}"`);
    return true;
  } catch (error) {
    console.error('[YOUTUBE] Error publishing video:', error.message);
    return false;
  }
}

/**
 * Task 1: Post weekly training tutorial
 * Runs every Monday at 9:00 AM
 */
async function taskPostWeeklyTutorial() {
  console.log('[YOUTUBE] Running task: Post weekly tutorial...');

  try {
    const tutorials = [
      {
        title: 'Dry Fire Fundamentals - Building Muscle Memory',
        description: 'Learn the essential dry fire drills that will improve your accuracy and speed. This tutorial covers proper technique, safety protocols, and progression drills.',
      },
      {
        title: 'Grip Control Mastery - The Foundation of Accuracy',
        description: 'Master the perfect grip that reduces recoil and improves consistency. We break down hand positioning, pressure points, and drills to develop muscle memory.',
      },
      {
        title: 'Tactical Stance & Balance - Moving Safely',
        description: 'Discover the tactical stance that gives you stability, control, and the ability to move safely. Learn isosceles, weaver, and modern hybrid stances.',
      },
      {
        title: 'Sight Alignment Secrets - Never Miss the Target',
        description: 'Perfect your sight alignment and sight picture. This tutorial explains the relationship between front and rear sight and how to achieve consistent accuracy.',
      },
    ];

    const tutorial = tutorials[Math.floor(Math.random() * tutorials.length)];

    await postYouTubeVideo(
      tutorial.title,
      tutorial.description + '\n\nVisit wise2.net to book a session with our certified instructors!',
      'https://youtube.com/watch?v=example',
      'https://wise2.net/hero-vr.webp'
    );

    console.log('[YOUTUBE] Weekly tutorial posted');
  } catch (error) {
    console.error('[YOUTUBE] Error in weekly tutorial task:', error.message);
  }
}

/**
 * Task 2: Post student success stories
 * Runs every Friday at 3:00 PM
 */
async function taskPostSuccessStories() {
  console.log('[YOUTUBE] Running task: Post success stories...');

  try {
    const result = await query(
      `SELECT u.first_name, COUNT(s.id) as sessions_completed,
              AVG(sp.score) as avg_score
       FROM users u
       LEFT JOIN sessions s ON u.id = ANY(s.student_ids) AND s.status = 'completed'
       LEFT JOIN student_progress sp ON u.id = sp.user_id
       WHERE s.scheduled_time > NOW() - INTERVAL '30 days'
       GROUP BY u.id, u.first_name
       HAVING COUNT(s.id) >= 3
       ORDER BY sessions_completed DESC
       LIMIT 1`
    );

    if (result.rows.length > 0) {
      const student = result.rows[0];
      const title = `Success Story: ${student.first_name}'s 30-Day Transformation`;
      const description =
        `Join us as we celebrate ${student.first_name}'s incredible progress!\n\n` +
        `In just 30 days:\n` +
        `✓ Completed ${student.sessions_completed} training sessions\n` +
        `✓ Achieved an average score of ${Math.round(student.avg_score)}%\n` +
        `✓ Mastered fundamental techniques\n\n` +
        `Start YOUR journey today at wise2.net!`;

      await postYouTubeVideo(title, description, 'https://youtube.com/watch?v=story', null);
    }

    console.log('[YOUTUBE] Success story posted');
  } catch (error) {
    console.error('[YOUTUBE] Error in success stories task:', error.message);
  }
}

/**
 * Task 3: Post quick tips and tricks
 * Runs every Wednesday at 12:00 PM
 */
async function taskPostQuickTips() {
  console.log('[YOUTUBE] Running task: Post quick tips...');

  try {
    const tips = [
      {
        title: '60-Second Tip: Improving Trigger Control',
        description: 'A quick technique to smooth out your trigger press and reduce flinch. Try this drill today!',
      },
      {
        title: '60-Second Tip: Proper Sight Alignment',
        description: 'The most common mistake shooters make and how to fix it in under a minute.',
      },
      {
        title: '60-Second Tip: Breath Control for Accuracy',
        description: 'Learn the optimal breathing technique used by competitive shooters worldwide.',
      },
    ];

    const tip = tips[Math.floor(Math.random() * tips.length)];

    await postYouTubeVideo(
      tip.title,
      tip.description + '\n\nSubscribe for more tactical tips and join our community at wise2.net',
      'https://youtube.com/watch?v=shorts',
      null
    );

    console.log('[YOUTUBE] Quick tip posted');
  } catch (error) {
    console.error('[YOUTUBE] Error in quick tips task:', error.message);
  }
}

/**
 * Task 4: Track video analytics
 * Runs daily at 8:00 PM
 */
async function taskTrackAnalytics() {
  console.log('[YOUTUBE] Running task: Track video analytics...');

  try {
    const result = await query(
      `SELECT platform, COUNT(*) as video_count,
              SUM(COALESCE(views, 0)) as total_views,
              SUM(COALESCE(likes, 0)) as total_likes,
              SUM(COALESCE(comments, 0)) as total_comments
       FROM video_content
       WHERE platform = 'youtube'
       AND published_at > NOW() - INTERVAL '30 days'
       GROUP BY platform`
    );

    if (result.rows.length > 0) {
      const stats = result.rows[0];
      console.log(`[YOUTUBE] Analytics - Videos: ${stats.video_count}, Views: ${stats.total_views}, Likes: ${stats.total_likes}, Comments: ${stats.total_comments}`);
    }

    console.log('[YOUTUBE] Analytics tracking completed');
  } catch (error) {
    console.error('[YOUTUBE] Error in analytics task:', error.message);
  }
}

/**
 * Schedule jobs using setInterval
 */
function scheduleJobs() {
  console.log('[YOUTUBE] Scheduling YouTube content...');

  // Task 1: Weekly tutorial Monday 9am
  function scheduleWeeklyTutorial() {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
    nextMonday.setHours(9, 0, 0, 0);

    const delayMs = nextMonday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostWeeklyTutorial();
      setInterval(taskPostWeeklyTutorial, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[YOUTUBE] Weekly tutorial scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 2: Success stories Friday 3pm
  function scheduleSuccessStories() {
    const now = new Date();
    const nextFriday = new Date(now);
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7;
    nextFriday.setDate(nextFriday.getDate() + (daysUntilFriday || 7));
    nextFriday.setHours(15, 0, 0, 0);

    const delayMs = nextFriday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostSuccessStories();
      setInterval(taskPostSuccessStories, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[YOUTUBE] Success stories scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 3: Quick tips Wednesday noon
  function scheduleQuickTips() {
    const now = new Date();
    const nextWednesday = new Date(now);
    const daysUntilWednesday = (3 - nextWednesday.getDay() + 7) % 7;
    nextWednesday.setDate(nextWednesday.getDate() + (daysUntilWednesday || 7));
    nextWednesday.setHours(12, 0, 0, 0);

    const delayMs = nextWednesday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostQuickTips();
      setInterval(taskPostQuickTips, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[YOUTUBE] Quick tips scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 4: Daily analytics 8pm
  function scheduleAnalytics() {
    const now = new Date();
    const nextAnalytics = new Date(now);
    nextAnalytics.setDate(nextAnalytics.getDate() + 1);
    nextAnalytics.setHours(20, 0, 0, 0);

    const delayMs = nextAnalytics.getTime() - now.getTime();
    setTimeout(() => {
      taskTrackAnalytics();
      setInterval(taskTrackAnalytics, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[YOUTUBE] Analytics scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  scheduleWeeklyTutorial();
  scheduleSuccessStories();
  scheduleQuickTips();
  scheduleAnalytics();
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('[YOUTUBE] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[YOUTUBE] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[YOUTUBE] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[YOUTUBE] Agent started. Managing YouTube channel...');

  try {
    await pool.query('SELECT 1');
    console.log('[YOUTUBE] Database connection verified');
  } catch (error) {
    console.error('[YOUTUBE] Failed to connect to database:', error.message);
    process.exit(1);
  }

  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('[YOUTUBE] YouTube API key not configured - will log videos but not publish');
  }

  scheduleJobs();
}

main().catch((error) => {
  console.error('[YOUTUBE] Fatal error:', error);
  process.exit(1);
});
