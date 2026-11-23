'use client';

import { useRef, useState } from 'react';

const TRACK = {
  title: 'Queen Baby (Deluxe)',
  artist: 'WISE² Records',
  duration: '3:16',
  src: '/radio/audio/queen-baby-radio.mp3',
};

export default function RadioPage() {
  const player = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  async function toggle() {
    const audio = player.current;
    if (!audio) return;
    if (!audio.paused) { audio.pause(); setPlaying(false); return; }
    try { await audio.play(); setPlaying(true); setError(''); }
    catch { setError('Audio is not available yet. The premiere master is awaiting upload.'); setPlaying(false); }
  }
  return (
    <main style={{minHeight:'100vh',background:'radial-gradient(circle at 65% 10%,#14375b 0%,#080c17 48%,#020308 100%)',color:'#fff',fontFamily:'Arial, sans-serif',padding:'clamp(24px,6vw,90px)'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <a href="/" style={{color:'#fff',fontWeight:900,letterSpacing:3,textDecoration:'none'}}>WISE² RECORDS</a>
        <span style={{color:'#7edcff',letterSpacing:3,fontSize:12}}>QUEENSBRIDGE TO THE WORLD</span>
      </header>
      <section style={{maxWidth:980,margin:'12vh auto 0'}}>
        <p style={{color:'#71d4ff',letterSpacing:5,fontWeight:700}}>THE NEW SOUND OF INDEPENDENT RADIO</p>
        <h1 style={{fontSize:'clamp(56px,11vw,148px)',lineHeight:.88,letterSpacing:-5,margin:'25px 0'}}>WE GOT<br/><span style={{color:'#63c9ff'}}>HITZ.</span></h1>
        <p style={{fontSize:'clamp(17px,2vw,24px)',color:'#c3cddd',maxWidth:650}}>Original music. Real artists. No shortcuts. WISE² Records Radio starts here.</p>
        <div style={{marginTop:55,padding:'28px',border:'1px solid #31506b',borderRadius:20,background:'#0a1525',display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
          <button onClick={toggle} aria-label={playing?'Pause Queen Baby':'Play Queen Baby'} style={{width:76,height:76,borderRadius:'50%',border:0,background:'#69d1ff',color:'#03101b',fontSize:30,cursor:'pointer'}}>{playing?'Ⅱ':'▶'}</button>
          <div style={{flex:1,minWidth:190}}><div style={{fontSize:11,letterSpacing:3,color:'#7bd6ff'}}>FIRST PREMIERE · ON DEMAND</div><h2 style={{fontSize:25,margin:'8px 0'}}>Queen Baby (Deluxe)</h2><div style={{color:'#aabed1'}}>WISE² Records · {TRACK.duration}</div></div>
          <audio ref={player} src={TRACK.src} preload="none" onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError('Premiere audio is not uploaded yet.');}} />
        </div>
        {error && <p role="status" style={{color:'#ffd2a8'}}>{error}</p>}
        <p style={{fontSize:13,color:'#8fa3b8',marginTop:20}}>Radio stream coming soon. This player is for the first single, not a live broadcast.</p>
      </section>
      <footer style={{marginTop:100,color:'#7891a9',fontSize:12}}>© WISE² RECORDS · WE GOT HITZ RADIO</footer>
    </main>
  );
}
