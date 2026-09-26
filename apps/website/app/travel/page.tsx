import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE² Travel | Search. Compare. Book. Travel.',
  description: 'WISE² Travel helps travelers compare flights, hotels, cars, cruises, tours and activities in one place.',
  alternates: { canonical: 'https://wise2.net/travel' },
};

const partners = ['Travelpayouts', 'CheapOair', 'Expedia', 'Booking.com', 'Priceline', 'Agoda', 'Viator', 'Trip.com', 'Rentalcars.com', 'GetYourGuide'];

const categories = [
  { icon: '✈', title: 'Flights', text: 'Compare top airlines and find the best deals.' },
  { icon: '▦', title: 'Hotels', text: 'Top-rated stays for every budget.' },
  { icon: '🚙', title: 'Rental Cars', text: 'Great rates and flexible options.' },
  { icon: '🛳', title: 'Cruises', text: 'Sail to unforgettable destinations.' },
  { icon: '📍', title: 'Tours & Activities', text: 'Explore more with top experiences worldwide.' },
];

export default function TravelPage() {
  return (
    <main style={{minHeight:'100vh',background:'#020914',color:'#fff',fontFamily:'Inter,Arial,sans-serif'}}>
      <section style={{position:'relative',overflow:'hidden',borderBottom:'1px solid rgba(34,211,238,.25)',backgroundImage:"linear-gradient(90deg,rgba(2,8,20,.96) 0%,rgba(2,8,20,.70) 48%,rgba(2,8,20,.32) 100%),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 65% 20%,rgba(0,140,255,.26),transparent 28%),radial-gradient(circle at 35% 70%,rgba(0,255,157,.12),transparent 30%)'}} />
        <div style={{position:'relative',maxWidth:1500,margin:'0 auto',padding:'18px 28px 30px'}}>
          <header style={{display:'flex',gap:24,alignItems:'center',justifyContent:'space-between',paddingBottom:20}}>
            <a href="/travel" aria-label="WISE² Travel home" style={{display:'block',textDecoration:'none'}}>
  <img src="/travel/wise2-travel-logo.svg" alt="WISE² Travel" style={{display:'block',width:250,maxWidth:'42vw',height:'auto'}} />
</a>
            <nav style={{display:'flex',gap:22,alignItems:'center',fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:.7,flexWrap:'wrap',justifyContent:'flex-end'}}>
              <a href="#search" style={{color:'#fff',textDecoration:'none'}}>Search & Book</a><a href="#categories" style={{color:'#fff',textDecoration:'none'}}>Flights</a><a href="#categories" style={{color:'#fff',textDecoration:'none'}}>Hotels</a><a href="#categories" style={{color:'#fff',textDecoration:'none'}}>Cars</a><a href="#categories" style={{color:'#fff',textDecoration:'none'}}>Cruises</a><a href="#planner" style={{color:'#fff',textDecoration:'none'}}>AI Trip Planner</a><a href="#partners" style={{padding:'11px 18px',border:'1px solid #149cff',borderRadius:8,color:'#fff',background:'#0b75ff',boxShadow:'0 0 28px rgba(0,136,255,.28)',textDecoration:'none'}}>Plan My Trip</a>
            </nav>
          </header>
          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.05fr) minmax(300px,.95fr)',gap:28,alignItems:'end',gridAutoFlow:'row'}}>
            <div style={{padding:'34px 0 18px'}}>
              <div style={{fontSize:14,letterSpacing:5,color:'#77d7ff',fontWeight:800,marginBottom:12}}>POWERED BY WISE²</div>
              <h1 style={{fontSize:'clamp(46px,6vw,92px)',lineHeight:.87,margin:0,fontWeight:950,letterSpacing:-3}}>DREAM IT.<br/>WE <span style={{color:'#159cff'}}>PLAN IT.</span></h1>
              <div style={{fontSize:'clamp(40px,5vw,78px)',fontFamily:'cursive',fontStyle:'italic',color:'#37ff9b',transform:'rotate(-2deg)',marginTop:4,textShadow:'0 0 24px rgba(55,255,155,.28)'}}>You Live It.</div>
              <p style={{fontSize:21,fontWeight:700,marginTop:14,color:'#dbeafe'}}>Search. Compare. Book. Travel.</p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:24}}>
                {['Best Prices Worldwide','Trusted Travel Partners','Exclusive Deals & Rewards','AI-Powered Trip Planning','Real People. Real Support.'].map((x)=><span key={x} style={{padding:'10px 12px',border:'1px solid rgba(56,189,248,.25)',borderRadius:10,background:'rgba(2,15,32,.58)',fontSize:12,color:'#d7f1ff'}}>{x}</span>)}
              </div>
            </div>
            <div style={{alignSelf:'end',minHeight:280}}>
              <img
                src="/travel/wise2-travel-team.svg"
                alt="WISE² Travel team: Daniel, Darrin, Paige, and Capital Jay"
                loading="eager"
                style={{display:'block',width:'100%',height:'auto',borderRadius:18,border:'1px solid rgba(56,189,248,.28)',boxShadow:'0 18px 54px rgba(0,0,0,.48)',objectFit:'cover'}}
              />
            </div>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1500,margin:'0 auto',padding:'18px 28px 50px'}}>
        <section id="search" style={{display:'grid',gridTemplateColumns:'minmax(0,2.2fr) minmax(360px,.9fr)',gap:16,marginTop:8}}>
          <div style={{border:'1px solid #0d87d8',borderRadius:14,background:'linear-gradient(180deg,#071a2a,#030b14)',boxShadow:'0 0 32px rgba(0,137,255,.10)',overflow:'hidden'}}>
            <div style={{padding:'16px 18px 10px',fontWeight:900,fontSize:21,letterSpacing:.5}}>✈ SEARCH & BOOK YOUR NEXT <span style={{color:'#2bd3ff'}}>ADVENTURE</span></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,padding:'0 12px 12px'}}>{['Flights','Hotels','Cars','Cruises','Tours & Activities'].map((x,i)=><button key={x} style={{padding:'13px 8px',border:'1px solid rgba(56,189,248,.25)',borderRadius:8,background:i===0?'#0d8cff':'#071320',color:'#fff',fontWeight:800}}>{x}</button>)}</div>
            <form action="https://www.google.com/travel/flights" method="get" target="_blank" rel="noreferrer" style={{display:'grid',gridTemplateColumns:'1.1fr 1.1fr .8fr .8fr .7fr 1fr',gap:8,padding:'0 12px 16px'}}>
              {['From','To','Depart','Return','Travelers'].map((x)=><label key={x} style={{fontSize:11,fontWeight:800,color:'#cde7f8'}}>{x}<input placeholder={x==='Travelers'?'1 Traveler':x} style={{display:'block',width:'100%',marginTop:6,padding:'13px 10px',borderRadius:7,border:'1px solid #b9cad8',background:'#fff',color:'#111'}} /></label>)}
              <button type="submit" style={{alignSelf:'end',padding:'14px',border:0,borderRadius:8,background:'#0d8cff',color:'#fff',fontWeight:900,fontSize:15}}>Search Deals</button>
            </form>
          </div>
          <aside id="planner" style={{border:'1px solid #0d87d8',borderRadius:14,background:'linear-gradient(145deg,#08101b,#03070d)',padding:18,display:'grid',gridTemplateColumns:'92px 1fr',gap:16,alignItems:'center'}}>
            <img src="/travel/wise2-travel-bot.svg" alt="" aria-hidden="true" style={{display:'block',width:98,height:'auto',filter:'drop-shadow(0 0 18px rgba(0,174,255,.28))'}} />
            <div><h2 style={{margin:'0 0 2px',fontSize:25}}>AI TRIP PLANNER</h2><div style={{color:'#36ff9c',fontWeight:800,marginBottom:10}}>Your Personal Travel Assistant</div><p style={{margin:'0 0 10px',fontSize:13,color:'#d6e7f3'}}>Tell us where you want to go and we’ll help organize the best trip for you.</p><a href="mailto:travel@wise2.net?subject=Plan%20My%20Trip" style={{display:'block',textAlign:'center',padding:'12px',borderRadius:8,background:'#0d8cff',color:'#fff',fontWeight:900,textDecoration:'none'}}>PLAN MY TRIP →</a></div>
          </aside>
        </section>

        <section id="categories" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginTop:12}}>
          {categories.map((c,i)=><article key={c.title} style={{minHeight:190,padding:16,border:'1px solid rgba(56,189,248,.28)',borderRadius:12,background:`linear-gradient(180deg,rgba(2,10,22,.20),rgba(2,10,22,.94)),url('https://images.unsplash.com/${['photo-1436491865332-7a61a109cc05','photo-1566073771259-6a8506099945','photo-1549317661-bd32c8ce0db2','photo-1548574505-5e239809ee19','photo-1503220317375-aaad61436b1b'][i]}?auto=format&fit=crop&w=900&q=70')`,backgroundSize:'cover',backgroundPosition:'center',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
            <div style={{fontSize:28}}>{c.icon}</div><h3 style={{fontSize:20,margin:'4px 0'}}>{c.title.toUpperCase()}</h3><p style={{fontSize:13,margin:0,color:'#d7e8f5'}}>{c.text}</p>
          </article>)}
        </section>

        <section style={{display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr',gap:12,marginTop:12}}>
          <div id="partners" style={{background:'#f8fbff',color:'#07131f',borderRadius:10,padding:18}}>
            <h3 style={{margin:'0 0 12px'}}>TRUSTED TRAVEL PARTNERS</h3>
            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>{partners.map(p=><span key={p} style={{fontWeight:900,color:'#0b5dbb'}}>{p}</span>)}</div>
            <div style={{marginTop:18,fontSize:12,fontWeight:800}}>TRAVEL AFFILIATE NETWORK &nbsp; | &nbsp; PARTNER DEALS &nbsp; | &nbsp; COMMISSION-READY</div>
          </div>
          <div style={{background:'#f8fbff',color:'#07131f',borderRadius:10,padding:18}}>
            <h3 style={{margin:'0 0 12px'}}>HOW IT WORKS</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,textAlign:'center'}}>{[['1','Search'],['2','Compare'],['3','Book'],['4','Travel']].map(x=><div key={x[0]}><div style={{width:34,height:34,borderRadius:'50%',margin:'0 auto 7px',display:'grid',placeItems:'center',background:'#0d8cff',color:'#fff',fontWeight:900}}>{x[0]}</div><b>{x[1]}</b></div>)}</div>
          </div>
          <div style={{background:'#f8fbff',color:'#07131f',borderRadius:10,padding:18}}>
            <h3 style={{margin:'0 0 10px'}}>WHY BOOK WITH WISE² TRAVEL</h3>
            <div style={{display:'grid',gap:7,fontSize:13}}><span>✓ Real-time deals from top providers</span><span>✓ AI-powered trip planning</span><span>✓ Same trusted booking sites</span><span>✓ Support & travel guidance</span><span>✓ Rewards & exclusive deals</span></div>
          </div>
        </section>

        <section style={{marginTop:16,padding:'16px 18px',borderRadius:12,border:'1px solid rgba(61,255,158,.25)',background:'rgba(4,20,21,.75)',display:'flex',justifyContent:'space-between',gap:18,alignItems:'center',flexWrap:'wrap'}}>
          <div><div style={{fontSize:12,letterSpacing:2,color:'#34ff9c',fontWeight:900}}>WISE² TRAVEL STATUS</div><div style={{fontSize:18,fontWeight:900,marginTop:4}}>Affiliate-first launch • Low overhead • Revenue focused</div></div>
          <div style={{fontSize:12,color:'#b8d8e7'}}>WISE² Travel is currently affiliate-first. Bookings are fulfilled by third-party travel partners; partner terms, pricing, availability and eligibility apply.</div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1050px){
          #search{grid-template-columns:1fr !important}
          #categories{grid-template-columns:repeat(2,1fr) !important}
        }
        @media (max-width: 900px){
          div[style*="gridTemplateColumns: minmax(0, 1.05fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 720px){
          header{align-items:flex-start !important;flex-direction:column !important}
          nav{justify-content:flex-start !important;gap:12px !important}
          form{grid-template-columns:1fr 1fr !important}
          #categories{grid-template-columns:1fr !important}
          div[style*="gridTemplateColumns: minmax(0, 1.05fr)"] {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
