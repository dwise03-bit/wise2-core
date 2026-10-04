export default function Home() {
  return (
    <main style={{background:'#050607',color:'#f6f0e4',fontFamily:'system-ui',minHeight:'100vh',padding:'0',margin:'0'}}>
      <header style={{padding:'2rem',background:'rgba(5,6,7,0.95)',borderBottom:'1px solid rgba(0,217,255,0.2)',maxWidth:'1400px',margin:'0 auto'}}>
        <h1 style={{fontSize:'1.5rem',margin:'0',letterSpacing:'0.15em'}}>PETALS <span style={{color:'#c4a369'}}>&</span> POTIONS</h1>
      </header>

      <section style={{padding:'6rem 2rem',maxWidth:'1400px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4rem',alignItems:'center'}}>
        <div>
          <p style={{color:'#c4a369',fontSize:'0.85rem',letterSpacing:'0.2em',textTransform:'uppercase',margin:'0 0 1rem'}}>BOTANICAL WELLNESS · HEART · MIND · BODY · SOUL</p>
          <h2 style={{fontSize:'3.5rem',margin:'0 0 1.5rem',lineHeight:'1.2'}}>Your Ritual.<br/><em style={{fontStyle:'italic',color:'#00d9ff'}}>Your Blend.</em><br/>Your Wellness.</h2>
          <p style={{fontSize:'1.1rem',lineHeight:'1.6',margin:'0 0 2rem',color:'rgba(246,240,228,0.9)'}}>Personalized botanical teas, body care and mindful rituals created to make everyday wellness feel beautiful, intentional and yours.</p>
          <button style={{background:'#c4a369',color:'#050607',border:'none',padding:'1rem 2rem',fontSize:'0.9rem',fontWeight:'600',cursor:'pointer'}}>BUILD MY RITUAL →</button>
        </div>
        <div style={{background:'linear-gradient(135deg,rgba(0,217,255,0.1) 0%,rgba(0,255,127,0.1) 100%)',height:'500px',border:'1px solid rgba(0,217,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(246,240,228,0.5)',fontSize:'1.1rem'}}>Paige Brand Image</div>
      </section>

      <section style={{background:'rgba(0,217,255,0.05)',padding:'4rem 2rem',textAlign:'center',borderTop:'1px solid rgba(0,217,255,0.2)',borderBottom:'1px solid rgba(0,217,255,0.2)'}}>
        <p style={{color:'#c4a369',fontSize:'0.85rem',letterSpacing:'0.2em',textTransform:'uppercase',margin:'0 0 1rem'}}>THE PHILOSOPHY</p>
        <h2 style={{fontSize:'2.5rem',margin:'0 0 1rem'}}>More than tea.<br/><em style={{fontStyle:'italic',color:'#c4a369'}}>A movement back to self.</em></h2>
        <p style={{maxWidth:'600px',margin:'1rem auto 0',color:'rgba(246,240,228,0.9)',fontSize:'1rem',lineHeight:'1.6'}}>Petals & Potions brings together Heart, Mind, Body and Soul through handcrafted products and intentional everyday rituals.</p>
      </section>

      <footer style={{padding:'3rem 2rem',borderTop:'1px solid rgba(0,217,255,0.2)',textAlign:'center',color:'rgba(246,240,228,0.7)'}}>
        <h3 style={{fontSize:'1.5rem',margin:'0 0 0.5rem'}}>PETALS <span style={{color:'#c4a369'}}>&</span> POTIONS</h3>
        <p style={{margin:'0.5rem 0'}}>Your Ritual. Your Blend. Your Wellness.</p>
        <p style={{margin:'1rem 0 0',fontSize:'0.9rem'}}>© 2026 PETALS & POTIONS · BOTANICAL WELLNESS, INTENTIONALLY.</p>
      </footer>
    </main>
  )
}
