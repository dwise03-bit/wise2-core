/**
 * Add Greensboro, NC Local News Sources
 * Run: node scripts/add-greensboro-sources.js
 * Or on VPS: cd /home/ubuntu/wise-defense-saas && node dashboard/scripts/add-greensboro-sources.js
 */

const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const GREENSBORO_SOURCES = [
  // Crime Radar & Incident Feeds
  {
    name: 'Crime Radar - Greensboro NC',
    type: 'api',
    url: 'https://newsapi.org/v2/everything',
    keywords: ['Greensboro crime radar', 'crime incidents Greensboro', 'police reports Greensboro NC'],
  },
  {
    name: 'CrimeReports.com - Greensboro',
    type: 'rss',
    url: 'https://crimereports.com/feeds/nc/44/84/',
    keywords: ['crime', 'incident', 'arrest', 'Greensboro'],
  },
  {
    name: 'Greensboro Police Department Incidents',
    type: 'api',
    url: 'https://newsapi.org/v2/everything',
    keywords: ['Greensboro police', 'GPD incident', 'armed robbery Greensboro', 'assault Greensboro'],
  },

  // Local News - Crime Coverage
  {
    name: 'Greensboro News & Record',
    type: 'rss',
    url: 'https://www.greensboro.com/search/?q=&t=article&l=25&d=&d1=&d2=&p=1&sort=newest&type=rss',
    keywords: ['Greensboro', 'North Carolina', 'crime', 'police', 'security'],
  },
  {
    name: 'WFMY News 2 (Greensboro)',
    type: 'rss',
    url: 'https://www.wfmynews2.com/feeds/news/rss.xml',
    keywords: ['Greensboro', 'crime', 'safety', 'incident'],
  },
  {
    name: 'WXII 12 News (Triad)',
    type: 'rss',
    url: 'https://www.wxii12.com/feeds/news/rss.xml',
    keywords: ['Triad', 'Greensboro', 'crime', 'investigation'],
  },

  // Regional & State
  {
    name: 'NC Policy Watch',
    type: 'rss',
    url: 'https://ncpolicywatch.com/feed/',
    keywords: ['North Carolina', 'gun rights', 'self-defense', 'crime'],
  },
  {
    name: 'Google News - Greensboro NC Crime',
    type: 'api',
    url: 'https://newsapi.org/v2/everything',
    keywords: ['Greensboro North Carolina crime', 'self-defense incident'],
  },
];

async function addSources() {
  try {
    console.log('🔄 Adding Greensboro, NC local news sources...\n');

    // Test connection
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('✅ Database connected:', testResult.rows[0].now);

    let created = 0;
    let skipped = 0;

    for (const source of GREENSBORO_SOURCES) {
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
          [source.name, source.type, source.url, JSON.stringify(source.keywords)]
        );

        if (result.rows.length > 0) {
          console.log(`✅ Created source: ${source.name} (ID: ${result.rows[0].id})`);
          console.log(`   Type: ${source.type} | Keywords: ${source.keywords.join(', ')}`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error creating source ${source.name}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created} sources`);
    console.log(`   Skipped: ${skipped} sources`);

    // Show all active sources
    const allSources = await pool.query(
      'SELECT id, source_name, source_type FROM news_scraper_config WHERE is_active = true ORDER BY priority_order'
    );
    console.log(`\n✨ Total active sources: ${allSources.rows.length}`);
    allSources.rows.forEach((source, i) => {
      console.log(`   ${i + 1}. ${source.source_name} (${source.source_type})`);
    });

    await pool.end();
    console.log('\n✅ Greensboro sources added. Scraper will pick them up on next cycle (4 hours).');
    console.log('   Tip: Restart news-scraper to scrape immediately:');
    console.log('   pm2 restart news-scraper');
  } catch (error) {
    console.error('❌ Failed to add sources:', error);
    process.exit(1);
  }
}

addSources();
