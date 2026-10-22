'use client';
import {useEffect,useRef,useState} from 'react';

const base='https://d8j0ntlcm91z4.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/';
const scenes=[
 {title:'The Descent',note:'IMP leads us down the stairs',src:base+'hf_20261021_195451_638a756c-8aea-4b43-9ea3-b90953559491.mp4'},
 {title:'Something in the Station',note:'The subway starts to feel different',src:base+'hf_20261021_204449_a145b4a5-db4f-46ab-90ed-9ae119f19c7a.mp4'},
 {title:'Follow Him',note:'The guide shows us the way',src:base+'hf_20261021_205935_2839bf51-45e3-4c0a-bf20-2a0b2b158ffe.mp4'},
 {title:'The Hidden Entrance',note:'A secret passage opens',src:base+'hf_20261022_041926_43abcdfb-1b1d-4a74-8184-a07cc8e55042.mp4'},
 {title:'The Reveal',note:'Welcome to the WISE² underground',src:base+'hf_20261022_043055_a8230d56-f77c-494f-a64e-a012d523c588.mp4'},
];
export default function TransitPreview(){
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true),[muted,setMuted]=useState(true),[complete,setComplete]=useState(false),[failed,setFailed]=useState(false);
 const video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{if(complete)return;setFailed(false);const el=video.current;if(!el)return;el.load();el.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));},[index,complete]);
 const next=()=>{if(index<scenes.length-1)setIndex(i=>i+1);else{setComplete(true);setPlaying(false);}};
 const jump=(i:number)=>{setComplete(false);setIndex(i);};
 return <main className="min-h-screen bg-[#030709] text-white">
 <style>{`
 .tp-frame{position:relative;min-height:72vh;background:#030709;display:flex;align-items:center;justify-content:center;overflow:hidden}
 .tp-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:contrast(1.08) saturate(.92)}
 .tp-vignette{pointer-events:none;position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.65),transparent 24%,transparent 66%,rgba(0,0,0,.86))}
 .tp-action{border:1px solid #70ffa6a0;background:#061b16e6;color:#b4ffd0;padding:11px 17px;border-radius:6px;font-size:13px;cursor:pointer}
 .tp-action:hover{background:#125038}
 .tp-scene{border:1px solid #30483e;background:#0a1413;padding:13px;text-align:left;border-radius:8px;cursor:pointer;min-height:85px}
 .tp-scene[aria-current="step"]{border-color:#65ffa9;background:#10291e;box-shadow:inset 0 0 0 1px #65ffa966}
 .tp-scene strong{display:block;font-size:13px;margin-top:4px}
 .tp-scene span{color:#a3b6af;font-size:11px}
 @media(max-width:640px){.tp-frame{min-height:67svh}.tp-video{object-fit:cover}.tp-scene{min-height:75px}}
 @media(prefers-reduced-motion:reduce){.tp-video{filter:none}}
 `}</style>
 <section className="tp-frame">
 {!complete&&<video key={index} ref={video} className="tp-video" autoPlay muted={muted} playsInline preload="auto" onEnded={next} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)} aria-label={`WISE² cinematic scene ${index+1}: ${scenes[index].title}`}><source src={scenes[index].src} type="video/mp4"/></video>}
 <div className="tp-vignette"/>
 <div className="absolute left-5 top-6 z-10 sm:left-10"><a href="/" className="font-black tracking-widest text-[#65ffa9]">WISE²</a><p className="mt-2 text-[10px] uppercase tracking-[.3em] text-white/65">FOLLOW HIM · FULL FILM PREVIEW</p></div>
 {!complete&&<div className="absolute right-5 top-6 z-10 flex gap-2"><button className="tp-action" onClick={()=>setMuted(m=>!m)}>{muted?'Sound off':'Sound on'}</button><button className="tp-action" onClick={()=>{const el=video.current;if(!el)return;if(el.paused)el.play().catch(()=>setPlaying(false));else el.pause();}}>{playing?'Pause':'Play'}</button></div>}
 <div className="absolute bottom-7 left-5 right-5 z-10 flex flex-wrap items-end justify-between gap-4 sm:left-10 sm:right-10">
 <div><p className="text-xs tracking-[.25em] text-[#65ffa9]">{complete?'JOURNEY COMPLETE':`SCENE ${String(index+1).padStart(2,'0')} / 05`}</p><h1 className="mt-2 text-2xl font-black sm:text-5xl">{complete?'WELCOME TO THE NETWORK':scenes[index].title}</h1><p className="mt-2 text-sm text-white/70">{complete?'The entrance is only the beginning.':scenes[index].note}</p>{failed&&<p role="alert" className="mt-2 text-sm text-amber-300">Video unavailable. Select another scene or continue.</p>}</div>
 <div className="flex gap-2">{complete?<><button className="tp-action" onClick={()=>jump(0)}>Replay all</button><a className="tp-action" href="/transit">Enter WISE² Transit →</a></>:<><button className="tp-action" onClick={()=>jump(0)}>Restart</button><button className="tp-action" onClick={next}>{index===4?'Finish →':'Next scene →'}</button></>}</div></div>
 </section>
 <section className="mx-auto max-w-6xl px-5 py-7 sm:px-10"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">Five-scene film</h2><p className="text-xs text-white/50">Choose any scene to review · Auto-plays in order</p></div><div className="grid grid-cols-2 gap-2 md:grid-cols-5">{scenes.map((s,i)=><button key={s.title} className="tp-scene" aria-current={!complete&&i===index?'step':undefined} onClick={()=>jump(i)}><span>0{i+1} / 05</span><strong>{s.title}</strong><span>{s.note}</span></button>)}</div><p className="mt-6 text-xs leading-6 text-white/55">Preview only. This does not replace the existing Transit network or its interactive map. Sound starts muted to allow mobile autoplay.</p></section>
 </main>;
}
