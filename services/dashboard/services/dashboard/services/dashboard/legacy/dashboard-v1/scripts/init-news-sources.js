/**
 * Initialize News Sources
 * Run once to set up default 2nd Amendment news sources
 * Usage: node scripts/init-news-sources.js
 */

const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const DEFAULT_SOURCES = [
  {
    name: 'Reuters - Gun Violence',
    type: 'rss',
    url: 'https://www.reuters.com/world',
    keywords: ['2nd Amendment', 'gun rights', 'firearms'],
  },
  {
    name: 'AP News - Gun Violence',
    type: 'rss',
    url: 'https://apnews.com/hub/gun-violence/feed',
    keywords: ['gun', 'firearm', 'ammunition'],
  },
  {
    name: 'NPR - Politics',
    type: 'rss',
    url: 'https://feeds.npr.org/1014/rss.xml',
    keywords: ['2nd Amendment', 'gun control', 'regulation'],
  },
  {
    name: 'News API - 2nd Amendment',
    type: 'api',
    url: 'https://newsapi.org/v2/everything',
    keywords: ['2nd Amendment', 'gun rights'],
  },
];

async function initializeSources() {
  try {
    console.log('🔄 Initializing news sources...');

    // Test connection
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('✅ Database connected:', testResult.rows[0].now);

    let created = 0;
    let skipped = 0;

    for (const source of DEFAULT_SOURCES) {
      try {
        // Check if source already exists
        const existing = await pool.query('SELECT id FROM news_scraper_config WHERE source_name = $1', [
          source.name,
        ]);

        if (existing.rows.length > 0) {
          console.log(`⏭️  Source already exists: ${source.name}`);
          skipped++;
          continue;
        }

        // Create source
        const result = await pool.query(
          `INSERT INTO news_scraper_config (source_name, source_type, source_url, keywords, is_active, priority_order)
           VALUES ($1, $2, $3, $4, true, (SELECT COALESCE(MAX(priority_order), 0) + 1 FROM news_scraper_config))
           RETURNING id`,
          [source.name, source.type, source.url, source.keywords]
        );

        if (result.rows.length > 0) {
          console.log(`✅ Created source: ${source.name} (ID: ${result.rows[0].id})`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error creating source ${source.name}:`, error.message);
      }
    }

    console.log('');
    console.log('📊 Summary:');
    console.log(`   Created: ${created} sources`);
    console.log(`   Skipped: ${skipped} sources`);

    if (created > 0) {
      // Verify sources
      const allSources = await pool.query('SELECT * FROM news_scraper_config WHERE is_active = true');
      console.log(`\n✨ Total active sources: ${allSources.rows.length}`);
      allSources.rows.forEach((source, i) => {
        console.log(`   ${i + 1}. ${source.source_name} (${source.source_type})`);
      });
    }

    await pool.end();
    console.log('\n✅ Initialization complete');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

initializeSources();
