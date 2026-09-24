"use client";
import { useState } from "react";

const sample = [
  {route:"GSO → LGA", price:"—", carrier:"Search exact inventory", tag:"VERIFY AT CHECKOUT"},
  {route:"RDU → JFK", price:"—", carrier:"Search exact inventory", tag:"VERIFY AT CHECKOUT"},
  {route:"CLT → EWR", price:"—", carrier:"Search exact inventory", tag:"VERIFY AT CHECKOUT"},
];

export default function FlightDealsPage() {
 const [origins,setOrigins]=useState("GSO, RDU, CLT");
 const [destinations,setDestinations]=useState("LGA, JFK, EWR");
 const [date,setDate]=useState("");
 const [searched,setSearched]=useState(false);
 return <main style={{minHeight:"100vh",background:"#05080d",color:"#f5f7fa",fontFamily:"Inter,system-ui,sans-serif",padding:"28px"}}>
  <div style={{maxWidth:1180,margin:"0 auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,marginBottom:34}}>
    <div><div style={{fontSize:12,letterSpacing:3,color:"#72ff9d",fontWeight:800}}>WISE² TRAVEL INTELLIGENCE</div><h1 style={{fontSize:"clamp(30px,5vw,58px)",margin:"6px 0 0",letterSpacing:-2}}>FLIGHT DEAL HUNTER</h1></div>
    <div style={{border:"1px solid #244336",borderRadius:999,padding:"9px 14px",color:"#72ff9d",fontSize:12}}>SELF-HOSTED • WISE2 CORE</div>
   </header>
   <section style={{background:"linear-gradient(135deg,#0b121b,#08100e)",border:"1px solid #1e342c",borderRadius:22,padding:22,boxShadow:"0 20px 70px #0008"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
     <Field label="FROM — MULTI AIRPORT" value={origins} onChange={setOrigins}/>
     <Field label="TO — MULTI AIRPORT" value={destinations} onChange={setDestinations}/>
     <Field label="DEPARTURE" value={date} onChange={setDate} type="date"/>
    </div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:16}}>
     {["ONE WAY","NONSTOP FIRST","1 ADULT","ECONOMY","TOTAL COST"].map(x=><span key={x} style={{border:"1px solid #263844",padding:"8px 11px",borderRadius:8,fontSize:11,color:"#aab7c2"}}>{x}</span>)}
    </div>
    <button onClick={()=>setSearched(true)} style={{width:"100%",marginTop:18,border:0,borderRadius:12,padding:16,fontWeight:900,letterSpacing:1,background:"#72ff9d",color:"#031008",cursor:"pointer"}}>HUNT REAL FARES</button>
   </section>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginTop:18}}>
    <Stat n="3×3" t="PRIMARY ROUTE MATRIX"/><Stat n="TOTAL" t="PRICE-FIRST COMPARISON"/><Stat n="NO FAKE" t="TEASER FARE LABELS"/>
   </div>
   <section style={{marginTop:28}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end"}}><div><div style={{color:"#72ff9d",fontSize:11,letterSpacing:2}}>DEAL BOARD</div><h2 style={{margin:"4px 0"}}>{searched?"SEARCH READY":"NYC QUICK HUNT"}</h2></div><span style={{fontSize:12,color:"#71808d"}}>Exact-query inventory only</span></div>
    <div style={{display:"grid",gap:10,marginTop:12}}>
     {sample.map((d,i)=><article key={d.route} style={{display:"grid",gridTemplateColumns:"1.1fr .7fr 1.2fr auto",gap:14,alignItems:"center",background:"#091018",border:"1px solid #182833",borderRadius:14,padding:16}}>
      <strong>{d.route}</strong><strong style={{fontSize:24}}>{d.price}</strong><div style={{color:"#8c9ba7",fontSize:13}}>{d.carrier}<br/><span style={{color:"#ffb85c",fontSize:10}}>{d.tag}</span></div><button disabled style={{background:"#111b23",border:"1px solid #263844",color:"#60717e",borderRadius:9,padding:"10px 14px"}}>BOOK</button>
     </article>)}
    </div>
   </section>
   <footer style={{marginTop:28,padding:"18px 0",borderTop:"1px solid #17232c",color:"#687984",fontSize:11}}>WISE² FLIGHT DEAL HUNTER • Provider checkout remains source of final price • No Vercel dependency</footer>
  </div>
 </main>
}
function Field({label,value,onChange,type="text"}:{label:string,value:string,onChange:(v:string)=>void,type?:string}){return <label style={{display:"grid",gap:7,fontSize:10,letterSpacing:1.4,color:"#82929e"}}>{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} style={{background:"#050a0f",border:"1px solid #253540",borderRadius:10,padding:"14px 13px",color:"#f5f7fa",outline:"none"}}/></label>}
function Stat({n,t}:{n:string,t:string}){return <div style={{background:"#081017",border:"1px solid #182832",borderRadius:14,padding:16}}><div style={{fontSize:22,fontWeight:900,color:"#72ff9d"}}>{n}</div><div style={{fontSize:10,letterSpacing:1.3,color:"#748692",marginTop:4}}>{t}</div></div>}
