import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WISE² IMPS | Five Units. One Ecosystem.",
  description: "A modular local-first ecosystem of interfaces, wearables, sensors, gateways, and edge AI.",
};

const units = [
  ["01","BYTE MINI","The Interface","Visual status, voice, alerts, and fast control."],
  ["02","POCKET NODE","The Wearable","Portable presence, field alerts, and sensor input."],
  ["03","C5 NODE","The Connector","Links radios, sensors, tools, and custom modules."],
  ["04","WIMP GATEWAY","The Coordinator","Routes messages, runs automations, and manages devices."],
  ["05","BIG BLIMP NODE","The Heavy Hitter","Edge AI, vision, storage, dashboards, and orchestration."],
];

export default function ImpsPage() {
  return (
    <main style={{minHeight:"100vh",color:"#effff4",background:"radial-gradient(circle at 80% 10%,#123d24 0,transparent 30%),#030706",fontFamily:"Arial,Helvetica,sans-serif"}}>
      <header style={{maxWidth:1180,margin:"auto",padding:"24px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #173323"}}>
        <Link href="/" style={{color:"#fff",fontWeight:900,fontSize:22,textDecoration:"none"}}>WISE<sup style={{color:"#59ff94"}}>²</sup> <span style={{color:"#59ff94",fontSize:12,letterSpacing:3}}>IMPS</span></Link>
        <a href="mailto:hello@wise2.net?subject=Build%20My%20WISE%C2%B2%20IMPS" style={{background:"#59ff94",color:"#031109",padding:"14px 18px",fontWeight:900,fontSize:11,textDecoration:"none"}}>BUILD YOURS</a>
      </header>

      <section style={{maxWidth:1180,margin:"auto",padding:"100px 20px 80px",display:"grid",gap:50}}>
        <div style={{maxWidth:850}}>
          <p style={{color:"#59ff94",fontSize:11,fontWeight:900,letterSpacing:4}}>INTELLIGENT MULTI-AGENT PLATFORM</p>
          <h1 style={{fontSize:"clamp(54px,8vw,104px)",lineHeight:.9,letterSpacing:-6,margin:"22px 0"}}>FIVE UNITS.<br/>FIVE ROLES.<br/><span style={{color:"#59ff94"}}>ONE ECOSYSTEM.</span></h1>
          <p style={{maxWidth:720,color:"#9eb0a5",fontSize:18,lineHeight:1.7}}>WISE² IMPS connects intelligent interfaces, wearables, sensor nodes, gateways, and edge compute into one modular system built to operate locally and grow with the mission.</p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:30}}>
            <a href="#units" style={{background:"#59ff94",color:"#031109",padding:"17px 22px",fontWeight:900,fontSize:12,textDecoration:"none"}}>EXPLORE THE IMPS →</a>
            <a href="mailto:hello@wise2.net?subject=WISE%C2%B2%20IMPS%20Demo" style={{border:"1px solid #31543d",color:"#d9eee0",padding:"17px 22px",fontWeight:900,fontSize:12,textDecoration:"none"}}>BOOK A DEMO</a>
          </div>
        </div>

        <div id="units" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14}}>
          {units.map(([n,name,role,desc])=>(
            <article key={name} style={{padding:24,border:"1px solid #173323",background:"linear-gradient(180deg,#09140e,#050906)",minHeight:250}}>
              <div style={{display:"flex",justifyContent:"space-between",color:"#59ff94",fontSize:11,fontWeight:900}}><span>{n}</span><span>● READY</span></div>
              <div style={{height:72,width:72,border:"1px solid #59ff94",borderRadius:18,margin:"28px 0",boxShadow:"0 0 30px #163f26 inset"}}/>
              <p style={{color:"#59ff94",fontSize:10,letterSpacing:2,fontWeight:900}}>{role.toUpperCase()}</p>
              <h2 style={{fontSize:22,margin:"9px 0"}}>{name}</h2>
              <p style={{color:"#92a398",lineHeight:1.55,fontSize:14}}>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{maxWidth:1180,margin:"auto",padding:"90px 20px",borderTop:"1px solid #173323"}}>
        <p style={{color:"#59ff94",fontSize:11,fontWeight:900,letterSpacing:4}}>ONE COORDINATED ARCHITECTURE</p>
        <h2 style={{fontSize:"clamp(38px,6vw,72px)",lineHeight:1,letterSpacing:-3,margin:"20px 0 40px"}}>INTERACT → CONNECT →<br/><span style={{color:"#59ff94"}}>COORDINATE → COMPUTE</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
          {[
            ["LOCAL-FIRST","Private, resilient operation with local control."],
            ["MODULAR","Start with one IMP and expand when needed."],
            ["BUILDABLE","Own the hardware, software, and workflows."],
            ["CONNECTED","Every unit has one clear job in the system."]
          ].map(([a,b])=><div key={a} style={{padding:24,border:"1px solid #173323"}}><b style={{color:"#59ff94"}}>{a}</b><p style={{color:"#92a398",lineHeight:1.6}}>{b}</p></div>)}
        </div>
      </section>

      <section style={{maxWidth:1180,margin:"auto",padding:"90px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
          {[
            ["SCHOOL EDITION","Hands-on AI, robotics, coding, vision, voice, and sensors in a teacher-managed local lab."],
            ["BUSINESS EDITION","Customer interfaces, field devices, automation, alerts, dashboards, and local AI for real operations."]
          ].map(([a,b])=><article key={a} style={{padding:34,border:"1px solid #244b32",background:"#07110b"}}><small style={{color:"#59ff94",fontWeight:900,letterSpacing:3}}>{a}</small><h3 style={{fontSize:30,lineHeight:1.1}}>One ecosystem. A deployment built for the environment.</h3><p style={{color:"#9eb0a5",lineHeight:1.7}}>{b}</p></article>)}
        </div>
      </section>

      <section style={{textAlign:"center",padding:"110px 20px",borderTop:"1px solid #173323"}}>
        <p style={{color:"#59ff94",fontSize:11,fontWeight:900,letterSpacing:4}}>BUILD YOUR INTELLIGENT ECOSYSTEM</p>
        <h2 style={{fontSize:"clamp(42px,7vw,82px)",lineHeight:1,letterSpacing:-4}}>START WITH ONE IMP.<br/><span style={{color:"#59ff94"}}>GROW INTO THE PLATFORM.</span></h2>
        <a href="mailto:hello@wise2.net?subject=Build%20My%20WISE%C2%B2%20IMPS" style={{display:"inline-block",marginTop:22,background:"#59ff94",color:"#031109",padding:"18px 24px",fontWeight:900,fontSize:12,textDecoration:"none"}}>START YOUR BUILD →</a>
      </section>
    </main>
  );
}
