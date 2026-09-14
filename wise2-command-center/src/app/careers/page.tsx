import Link from 'next/link';
import { ArrowRight, Bot, BriefcaseBusiness, CheckCircle2, FileText, GraduationCap, Mic2, Rocket, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import './careers.css';

const tools = [
  ['AI Job Match','Find high-fit roles ranked by skills, goals, and experience.',Search],
  ['Resume Intelligence','Tune every resume for ATS relevance and the exact opportunity.',FileText],
  ['Skill Builder','Turn career gaps into guided learning missions and proof of skill.',GraduationCap],
  ['Portfolio Builder','Convert real work into a polished, employer-ready portfolio.',Rocket],
  ['Interview Coach','Practice answers, STAR stories, and role-specific interviews.',Mic2],
  ['Salary Intelligence','Understand your market value and prepare to negotiate.',TrendingUp],
];
const jobs = [
  ['Senior AI Product Specialist','Google','Remote / US','$145k–$190k','96%'],
  ['AI Solutions Engineer','NVIDIA','Hybrid','$150k–$205k','94%'],
  ['Automation Program Manager','Microsoft','Remote / US','$135k–$180k','91%'],
];

export default function CareersPage(){
  return <main className="careers-shell">
    <header className="careers-nav"><Link href="/" className="brand">WISE² <span>CAREERS</span></Link><nav><a href="#tools">Career OS</a><a href="#matches">Jobs</a><a href="#coach">AI Coach</a><a href="#skills">Skills</a></nav><a className="nav-cta" href="#start">Get Started</a></header>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow"><Sparkles size={15}/> AI-POWERED JOB SEARCH & CAREER OPERATING SYSTEM</p><h1>WISE² <span>CAREERS</span></h1><h2>MORE THAN A JOB SEARCH.<br/><em>IT’S A LAUNCH PAD.</em></h2><p className="lede">Find the right work, build the missing skills, create proof, prepare for interviews, and move from opportunity to offer with one intelligent career command center.</p><div className="actions"><a className="primary" href="#start">Start Free Today <ArrowRight size={18}/></a><a className="secondary" href="#matches">Explore Job Matches</a></div><div className="trust"><span><CheckCircle2/> Free to start</span><span><CheckCircle2/> AI career guidance</span><span><CheckCircle2/> Built for real outcomes</span></div></div>
      <aside className="score-card"><div className="score-head"><span>YOUR CAREER COMMAND</span><Bot/></div><div className="score-ring"><strong>92%</strong><small>AI Career Score</small></div><div className="meter"><span>Resume strength</span><b>98%</b></div><div className="meter"><span>Interview readiness</span><b>89%</b></div><div className="meter"><span>Portfolio strength</span><b>95%</b></div><div className="status">CAREER AGENT ONLINE <i/></div></aside>
    </section>
    <section className="tool-section" id="tools"><p className="section-kicker">ONE SYSTEM. YOUR ENTIRE CAREER.</p><h3>Build the candidate employers <span>want to hire.</span></h3><div className="tool-grid">{tools.map(([name,desc,Icon]) => { const I=Icon as typeof Search; return <article className="tool-card" key={name as string}><I/><h4>{name as string}</h4><p>{desc as string}</p><a href="#start">Launch tool <ArrowRight size={14}/></a></article>})}</div></section>
    <section className="matches" id="matches"><div className="section-title"><div><p className="section-kicker">LIVE JOB MATCHES</p><h3>Opportunities ranked for <span>you.</span></h3></div><Target/></div><div className="job-list">{jobs.map(([role,company,place,pay,match]) => <article className="job" key={role}><div className="job-icon"><BriefcaseBusiness/></div><div><h4>{role}</h4><p>{company} · {place}</p></div><strong>{pay}</strong><span className="match">{match} MATCH</span><button aria-label={`View ${role}`}><ArrowRight/></button></article>)}</div></section>
    <section className="coach" id="coach"><div><p className="section-kicker">WISE² AI COACH</p><h3>Your next move is never a guess.</h3><p>Get an adaptive action plan for applications, skills, portfolio projects, interviews, salary conversations, and follow-up.</p></div><div className="coach-chat"><div className="bot-dot"><Bot/></div><p><b>Career Agent</b><br/>You have 3 strong matches today. I’d prioritize the AI Solutions Engineer role, then tailor your resume around automation, client delivery, and AI implementation.</p></div></section>
    <section className="start" id="start"><p className="section-kicker">BUILD A BETTER YOU</p><h3>Skills today. <span>Opportunities tomorrow.</span></h3><p>Start your WISE² Careers profile and turn the job hunt into an intelligent system.</p><a className="primary" href="mailto:careers@wise2.net?subject=WISE2%20Careers%20Early%20Access">Start Free Today <ArrowRight size={18}/></a></section>
  </main>
}
