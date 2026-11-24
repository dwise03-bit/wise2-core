'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function CinematicPage() {
  const [angle, setAngle] = useState(287);
  const reduced = useReducedMotion();
  return (
    <main style={{minHeight:'100vh',background:'#080f19',color:'#eef8ff',padding:'clamp(24px,5vw,80px)',fontFamily:'system-ui'}}>
      <p style={{letterSpacing:4,color:'#67dfff'}}>WISE² / CINEMATIC LAB</p>
      <h1 style={{fontSize:'clamp(42px,8vw,112px)',lineHeight:1,margin:'24px 0'}}>A new<br/>dimension.</h1>
      <p style={{maxWidth:580,color:'#b6c9db'}}>An interactive motion and instrument design experiment. Explore the dial to change its heading.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:24,marginTop:40}}>
        <section aria-label="Motion study" style={{minHeight:340,display:'grid',placeItems:'center',background:'radial-gradient(ellipse,#294b80,#101b30 65%)',borderRadius:24,overflow:'hidden',perspective:800}}>
          <motion.div animate={reduced?{y:0}:{y:[-12,12,-12],rotateY:[-12,12,-12]}} transition={reduced?{duration:0}:{duration:6,repeat:Infinity,ease:'easeInOut'}} style={{width:180,height:180,borderRadius:40,background:'linear-gradient(145deg,#e7f7ff,#4275ae 45%,#152941)',boxShadow:'inset 0 0 0 2px #a4e4ff,0 25px 60px #0009',display:'grid',placeItems:'center',fontSize:52,fontWeight:800}}>W²</motion.div>
        </section>
        <section style={{padding:24,border:'1px solid #25485c',borderRadius:24,background:'#0c202b'}}>
          <h2>Precision instrument</h2>
          <svg viewBox="0 0 300 300" role="img" aria-label={'Compass heading '+angle+' degrees'} style={{width:'100%',maxHeight:300}}>
            <circle cx="150" cy="150" r="125" fill="#091820" stroke="#43d8ed" strokeWidth="2"/>
            {Array.from({length:72},(_,i)=><line key={i} x1="150" y1="29" x2="150" y2={i%6===0?43:35} stroke={i%6===0?'#e0faff':'#49808c'} transform={'rotate('+i*5+' 150 150)'}/>)}
            {['N','E','S','W'].map((s,i)=><text key={s} x={150+93*Math.sin(i*Math.PI/2)} y={155-93*Math.cos(i*Math.PI/2)} fill="#c6eff5" textAnchor="middle" fontSize="16">{s}</text>)}
            <motion.g animate={{rotate:angle}} transition={reduced?{duration:0}:{type:'spring',stiffness:100,damping:20}} style={{originX:'150px',originY:'150px'}}><path d="M150 54 L164 150 L150 172 L136 150 Z" fill="#55e5fa"/><circle cx="150" cy="150" r="7" fill="#fff"/></motion.g>
            <text x="150" y="215" textAnchor="middle" fill="white" fontSize="25">{angle}°</text>
          </svg>
          <label htmlFor="heading">Heading: {angle}°</label>
          <input id="heading" type="range" min="0" max="359" value={angle} onChange={e=>setAngle(Number(e.target.value))} style={{display:'block',width:'100%',accentColor:'#55e5fa',marginTop:12}}/>
        </section>
      </div>
      <p style={{color:'#b6c9db',marginTop:32}}>Motion study • Responsive layout • Reduced-motion support</p>
    </main>
  );
}
