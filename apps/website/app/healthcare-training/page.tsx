export const metadata = { title: 'Healthcare Training | WISE² Preview', robots: { index: false, follow: false } };
export default function HealthcareTraining() {
 const services = [['01','EHR education','Role-based learning for healthcare teams.'],['02','Virtual instruction','Instructor-led sessions and practical learning.'],['03','Go-live readiness','Prepare teams for workflow transitions.'],['04','Workflow education','Build confidence in everyday clinical systems.']];
 return <main style={{minHeight:'100vh',background:'radial-gradient(ellipse at 85% 20%, #073b75, #07111f 45%, #03070e 80%)',color:'#f4f8ff',fontFamily:'Arial,sans-serif',padding:'clamp(24px,6vw,96px)'}}>
 <header style={{display:'flex',justifyContent:'space-between',gap:20,flexWrap:'wrap',alignItems:'center'}}><strong style={{letterSpacing:3}}>HEALTHCARE / TRAINING</strong><a href="#programs" style={{color:'#55caff'}}>Explore programs ↓</a></header>
 <section style={{padding:'clamp(60px,12vw,150px) 0',maxWidth:1100}}>
 <p style={{color:'#55caff',letterSpacing:4}}>INDEPENDENT EHR EDUCATION · CONCEPT PREVIEW</p>
 <h1 style={{fontSize:'clamp(48px,9vw,132px)',lineHeight:0.95,letterSpacing:'-.06em',margin:'28px 0'}}>TRAIN WITH<br/><span style={{color:'#35baff'}}>CONFIDENCE.</span></h1>
 <p style={{fontSize:'clamp(18px,2vw,26px)',maxWidth:680,lineHeight:1.6}}>Professional healthcare technology education. Empower teams to navigate electronic health records and clinical workflows with confidence.</p>
 <a href="#programs" style={{display:'inline-block',background:'#0878df',color:'white',padding:'18px 28px',borderRadius:8,textDecoration:'none',marginTop:20}}>Explore training programs →</a>
 </section>
 <section id="programs" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>{services.map(([n,title,desc])=><article key={n} style={{padding:28,border:'1px solid #23649b',borderRadius:16,background:'#0b1b2d'}}><span style={{color:'#55caff'}}>{n}</span><h2>{title}</h2><p style={{lineHeight:1.6,color:'#b7cce0'}}>{desc}</p></article>)}</section>
 <section style={{padding:'64px 0'}}><h2>Training inquiries</h2><p>Booking and contact details will be enabled after client approval.</p></section>
 <footer style={{color:'#b7cce0',fontSize:14}}>WISE² concept preview. Proposed services and credentials pending confirmation. No affiliation with Epic Systems is implied. No patient data collected.</footer>
 </main>;
}
