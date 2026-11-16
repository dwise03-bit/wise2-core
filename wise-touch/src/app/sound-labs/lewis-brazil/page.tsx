import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lewis Brazil | The Kingdom Within — WISE² Sound Labs',
  description: 'Enter the creative world of Lewis Brazil: music, storytelling, and an original fantasy-inspired journey.',
}

const chapters = [
  { number: '01', title: 'The Journey', description: 'The story, the lessons, the becoming.', icon: '✦' },
  { number: '02', title: 'The Sound', description: 'Music production, original compositions, and sonic worlds.', icon: '♫' },
  { number: '03', title: 'The Growth', description: 'Purpose, resilience, discipline, and imagination.', icon: '◇' },
  { number: '04', title: 'The Community', description: 'Build something that lasts with the people who matter.', icon: '♡' },
]

export default function LewisBrazilPage() {
  return (
    <main style={{background:'#080b19',color:'#fff',minHeight:'100vh',fontFamily:'Arial, sans-serif'}}>
      <section style={{minHeight:'90vh',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'space-between',background:'radial-gradient(ellipse at 74% 70%, #f5a766 0%, #7d4669 22%, #252b55 49%, #080b19 83%)'}}>
        <div aria-hidden style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(2,4,15,.6),transparent 40%,rgba(3,5,16,.9))',pointerEvents:'none'}} />
        <nav aria-label="Lewis Brazil navigation" style={{zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,padding:'24px clamp(20px,5vw,72px)',flexWrap:'wrap'}}>
          <Link href="/sound-labs" style={{color:'#fff',textDecoration:'none',fontWeight:800,letterSpacing:3}}>WISE² / SOUND LABS</Link>
          <div style={{display:'flex',gap:22,flexWrap:'wrap',fontSize:12,letterSpacing:2}}>
            <a href="#journey" style={{color:'#fff'}}>JOURNEY</a><a href="#creative" style={{color:'#fff'}}>CREATIVE</a><a href="#studio" style={{color:'#fff'}}>STUDIO</a>
          </div>
        </nav>
        <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'90px 20px 110px'}}>
          <p style={{letterSpacing:5,fontSize:12,color:'#ffdfb5'}}>AN ORIGINAL CINEMATIC JOURNEY</p>
          <h1 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(64px,11vw,170px)',lineHeight:1,margin:'24px 0',textShadow:'0 10px 45px #101020'}}>LEWIS<br/>BRAZIL</h1>
          <p style={{fontFamily:'Georgia,serif',fontSize:'clamp(20px,3vw,34px)',letterSpacing:4}}>THE KINGDOM WITHIN</p>
          <p style={{maxWidth:550,margin:'24px auto 34px',lineHeight:1.8,color:'#eee1dc'}}>Every world begins with a story. Explore music, imagination, and the lessons that shape who we become.</p>
          <a href="#journey" style={{display:'inline-block',padding:'16px 32px',border:'1px solid #ffd398',borderRadius:4,color:'#fff',background:'rgba(18,16,38,.5)',textDecoration:'none',letterSpacing:2}}>ENTER THE WORLD →</a>
        </div>
        <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'0 20px 34px',fontSize:11,letterSpacing:3,color:'#f6dbca'}}>CREATIVITY × MUSIC × MINDSET × GROWTH</div>
      </section>
      <section id="journey" style={{padding:'85px clamp(20px,6vw,100px)',maxWidth:1400,margin:'auto'}}>
        <p style={{color:'#f7c38d',letterSpacing:4,fontSize:12}}>EXPLORE THE WORLD</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(36px,5vw,64px)',fontWeight:400}}>Four chapters. One story.</h2>
        <div id="creative" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginTop:35}}>
          {chapters.map(chapter=><article key={chapter.number} style={{border:'1px solid #42445f',borderRadius:12,padding:28,background:'linear-gradient(145deg,#25243e,#101427)',minHeight:215}}>
            <span style={{color:'#efb97e',fontSize:13}}>{chapter.number} / {chapter.icon}</span>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:27,margin:'36px 0 12px'}}>{chapter.title}</h3>
            <p style={{lineHeight:1.7,color:'#bcbdd1'}}>{chapter.description}</p>
          </article>)}
        </div>
      </section>
      <section id="studio" style={{padding:'80px 24px 100px',textAlign:'center',background:'linear-gradient(180deg,#101427,#080b19)'}}>
        <p style={{color:'#f7c38d',letterSpacing:4,fontSize:12}}>WISE² SOUND LABS</p>
        <h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(34px,5vw,62px)'}}>Where worlds become sound.</h2>
        <p style={{color:'#c9c6d5',maxWidth:570,margin:'20px auto 35px',lineHeight:1.8}}>Explore the production ecosystem behind the music. Lewis&apos;s dedicated DAW workspace is planned for a future integration.</p>
        <Link href="/sound-labs" style={{display:'inline-block',padding:'15px 28px',border:'1px solid #f4c48b',color:'#fff',textDecoration:'none'}}>EXPLORE SOUND LABS →</Link>
      </section>
    </main>
  )
}
