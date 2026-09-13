import styles from './meta-glasses.module.css'

const nav = ['Dashboard','Devices','Apps','App Store','Development','Automation','AI Assistant','Cloud Services','Alerts','Team','Settings']
const activity = [
  ['Developer Mode enabled','6:00 PM'],
  ['App version checked','5:58 PM'],
  ['Device connected','5:58 PM'],
  ['Synced successfully','5:57 PM'],
  ['Voice test completed','5:56 PM'],
  ['Camera access granted','5:55 PM'],
]

export default function MetaGlassesPage() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>WISE<sup>2</sup><span>INTELLIGENCE IN ACTION™</span></div>
        <nav>{nav.map((item) => <div key={item} className={`${styles.navItem} ${item==='Devices' ? styles.active : ''}`}>{item}</div>)}</nav>
        <div className={styles.motto}><b>BUILD<br/>DEPLOY<br/>DOMINATE</b><span>WISE² UNITED</span></div>
      </aside>

      <section className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.search}>⌕&nbsp;&nbsp; Search devices, apps, or commands...</div>
          <div className={styles.profile}><span>●</span><div><b>Daniel Wise</b><small>WISE² Admin</small></div></div>
        </header>

        <div className={styles.titleRow}>
          <div><h1>WISE² DEVICES</h1><p>Manage and deploy apps across your Meta AI glasses and connected devices.</p></div>
          <div className={styles.tagline}>WORK SMARTER. GO FURTHER.</div>
        </div>

        <div className={styles.heroGrid}>
          <article className={styles.deviceCard}>
            <div className={styles.deviceTitle}><span className={styles.dot}></span><h2>RB Meta 00RW</h2></div>
            <p className={styles.connected}>Connected • Meta AI Glasses</p>
            <dl>
              <div><dt>App Version</dt><dd>289.0.0.21.157</dd></div>
              <div><dt>DAT SDK</dt><dd>0.9.0.26.0</dd></div>
              <div><dt>Language</dt><dd>English (United States)</dd></div>
              <div><dt>Developer Mode</dt><dd className={styles.good}>Enabled</dd></div>
              <div><dt>Connection</dt><dd className={styles.good}>Wi‑Fi • Excellent</dd></div>
            </dl>
            <div className={styles.actions}><button>Open in Meta App ↗</button><button>↻ Sync Now</button><button>•••</button></div>
          </article>

          <article className={styles.showcase}>
            <div className={styles.glasses}>
              <div className={styles.lens}></div><div className={styles.lens}></div><div className={styles.bridge}></div>
              <div className={styles.arm}></div>
            </div>
            <div className={styles.capture}>CAPTURE<br/>ANALYZE<br/>ASSIST<br/>DOMINATE</div>
            <div className={styles.quickIcons}><span>▣<small>Photos/Video</small></span><span>◉<small>Voice AI</small></span><span>◌<small>Live View</small></span><span>◎<small>Context AI</small></span></div>
          </article>
        </div>

        <div className={styles.stats}>
          <div><small>Apps Installed</small><b>12</b><span>↑ +2 this week</span></div>
          <div><small>Battery Level</small><b>78%</b><span>▰▰▰▰▱</span></div>
          <div><small>Storage Used</small><b>3.4 GB</b><span>of 32 GB</span></div>
          <div><small>Last Sync</small><b>2 minutes ago</b><span>● Online</span></div>
        </div>

        <div className={styles.bottomGrid}>
          <article className={styles.panel}><h3>App Information</h3><dl>
            <div><dt>App language</dt><dd>English (United States)</dd></div>
            <div><dt>App version</dt><dd>289.0.0.21.157</dd></div>
            <div><dt>DAT SDK version</dt><dd>0.9.0.26.0</dd></div>
            <div><dt>Developer Mode</dt><dd className={styles.good}>Enabled</dd></div>
            <div><dt>Device ID</dt><dd>RB Meta 00RW</dd></div>
          </dl></article>
          <article className={styles.panel}><h3>Quick Actions</h3><div className={styles.stack}><button>⇩ Install App</button><button>↻ Update Firmware</button><button>▤ View Logs</button><button>⌘ Developer Tools</button><button>↗ Open Meta App</button></div></article>
          <article className={styles.panel}><h3>Recent Activity</h3>{activity.map(([a,t]) => <div className={styles.activity} key={a}><span>{a}</span><small>{t}</small></div>)}</article>
        </div>
        <footer className={styles.footer}>WISE² COMMAND CENTER <span>PEOPLE × TECHNOLOGY × OPPORTUNITY</span><b>● All Systems Online</b></footer>
      </section>
    </main>
  )
}
