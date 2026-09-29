# Concealed Carry VR Training Academy — MVP Specification

**Project**: WISE² Women's 1-on-1 Concealed Carry Coaching (VR)  
**Platform**: Meta Quest 3/3S  
**Timeline**: 16 weeks (4 months)  
**Team**: 1 VR Engineer + 2 Female Firearms Instructors (SME) + 1 Backend Engineer  
**Budget**: $150K–$200K  
**Target Market**: Women 18–65, concealed-carry permit holders, seeking personalized training  

---

## Executive Summary

**Women's 1-on-1 VR coaching platform** specializing in personalized concealed-carry training. Unlike generic drill systems (ACE VR), this MVP focuses on **coached progression** where actual female firearms instructors provide real-time feedback, body-specific guidance, and customized drill sequences based on individual learning style, body type, and carry method.

**Positioning**: "Your personal concealed-carry coach in VR"

**Launch Goal**: Closed beta (50–100 women) → paid coaching model (Q1 2027) → expand instructor network (Q2 2027)

---

## Market Differentiation: Why Women's 1-on-1?

### **Market Gap**
- Concealed-carry training is **male-dominated** (~85% male instructors)
- Women report feeling uncomfortable in group range settings
- Online CCW communities show high demand for **female-only training spaces**
- Existing VR platforms (ACE VR) ignore body-specific considerations (holster position, draw technique for different body types)

### **Your Advantage**
| Feature | ACE VR (Generic) | Your Platform (Women's 1-on-1) |
|---------|------------------|------------------------------|
| Coaching | AI feedback only | **Live female instructor feedback** |
| Customization | One-size-fits-all | **Body type, draw position, carry method customization** |
| Community | Global leaderboard | **Accountability partners, cohort-based learning** |
| Drills | Sport-focused | **Defensive + confidence-building focus** |
| Carry Positions | AIWB, OWB, shoulder | **AIWB, IWB, purse/bag carry, bra carry, appendix variations** |

### **Pricing Leverage**
- ACE VR: $199 handset + app (no coaching)
- Your platform: $199 handset + **$199/month coached training** (12-week program) or $49/month ongoing

---

---

## Drill Library (Women-Focused)

### **Tier 1: Draw Drills** (Speed + Technique)

| Drill | Carry Position | Body Customization | Metrics |
|-------|----------------|-------------------|---------|
| **Draw to First Shot** | Appendix (AIWB) | Varies by body type (petite, athletic, curvy) | Draw time, comfort rating |
| **Draw to First Shot** | IWB (Inside Waistband) | Side position, comfort-optimized for different body shapes | Draw time, accuracy |
| **Draw to First Shot** | Purse/Bag Carry | Pocket draw, purse-mounted, crossbody bag | Draw time, access speed |
| **Draw to First Shot** | Bra Carry* | Horizontal or vertical (women-specific) | Draw time, retention safety |
| **Draw to First Shot** | Thigh/Garter Carry | Seated, standing positions | Draw time, concealment |
| **Failure Drill** | Primary position | Double-tap → reload (coached recovery) | Reload time, accuracy post-malfunction |
| **Transition Drill** | Primary → Alternate | Draw from primary, transition to backup carry | Transition time, accuracy |

**Coaching Note**: Each position has video tutorials by female instructors explaining body-specific considerations, retention safety, and comfort optimization.

*\*Bra carry drills include safety messaging about proper holster selection and unintentional discharge prevention.*

**Scoring**: Draw time (ms), shot placement (ring score 1–10), accuracy (% hits)

---

### **Tier 2: Accuracy Drills** (Precision + Distance)

| Distance | Target Type | Drill | Metrics |
|----------|-------------|-------|---------|
| **7 yards** | Stationary silhouette | Timed rapid fire (3 rounds) | Draw + fire time, grouping |
| **7 yards** | Pop-up (sudden threat) | Unannounced target appearance | Reaction time, accuracy |
| **15 yards** | Stationary silhouette | Controlled pairs (2 rounds, pause, assess) | Shot spacing, accuracy |
| **15 yards** | Moving target | Target slides left/right while shooting | Tracking accuracy, lead calculation |
| **25 yards** | Stationary silhouette | Precision shots (headshots, COM) | Grouping, precision score |
| **25 yards** | Moving target | Dynamic threat (approaching/retreating) | Distance compensation, accuracy |

**Scoring**: Accuracy ring (1–10 per shot), grouping size (inches), time-to-hit (ms)

---

### **Tier 3: Scenario Drills** (Stress + Decision-Making)

| Scenario | Elements | Difficulty | Metrics |
|----------|----------|-----------|---------|
| **Multiple Threats** | 3–5 pop-up targets, randomized | Beginner: sequential; Advanced: simultaneous | Target prioritization, speed, accuracy |
| **Time Pressure** | Countdown timer (30s to clear range) | Beginner: 60s; Advanced: 20s | Accuracy under stress, completion % |
| **Audio Stress** | Ambient threat sounds (voices, gunshots, sirens) | Beginner: low volume; Advanced: high intensity | Decision-making speed, accuracy variance |
| **Reload Under Fire** | Target reappears after reload | Beginner: 5s reload window; Advanced: 2s | Reload speed, accuracy recovery |
| **Positional Transitions** | Move between cover positions while engaging | Beginner: static cover; Advanced: moving targets | Movement speed, accuracy maintenance |

**Scoring**: Accuracy, speed, stress-response degradation %, completion %

---

## Progression System (Belt Ranking)

Progressive difficulty gates harder drills. Users unlock by demonstrating competency.

### **White Belt (Beginner)**
- Draw speed: <3 seconds to first shot
- Accuracy: >60% hits
- Drills: Slow draws (AIWB/OWB only), 7-yard stationary targets
- Time to complete: 1–2 weeks

### **Blue Belt (Intermediate)**
- Draw speed: 1.5–2.5 seconds
- Accuracy: >75% hits
- Drills: All draw positions, 7–15 yard targets, intro scenario (sequential threats)
- Time to complete: 2–4 weeks

### **Purple Belt (Advanced)**
- Draw speed: <1.5 seconds
- Accuracy: >85% hits
- Drills: All draw + accuracy drills, moving targets, time pressure scenarios
- Time to complete: 4–8 weeks

### **Black Belt (Expert)**
- Draw speed: <1.0 second
- Accuracy: >90% hits
- Drills: All drills unlocked, simultaneous multi-threat scenarios, full stress mechanics
- Time to complete: 8+ weeks (maintenance-focused)

---

## Coaching Model (The Differentiator)

### **How It Works**

1. **Initial Assessment** (Live with instructor, 30 min)
   - Instructor meets student in VR
   - Assess current skill level, body type, preferred carry method
   - Design personalized 12-week training plan
   - Establish comfort baseline (fear/anxiety levels)

2. **Coached Sessions** (3x/week, 30 min each)
   - Student runs assigned drills in VR
   - **Instructor observes in real-time** (instructor view shows student's hand tracking, trigger data, target hits)
   - Instructor provides live feedback via audio
   - Student can ask questions in real-time (using Quest microphone)
   - Session ends with instructor writing notes in student's coaching journal

3. **Between-Session Practice** (Self-directed)
   - Student runs practice drills (uncoached)
   - App records all metrics
   - AI analyzes weak points, recommends specific drills
   - Student updates coach with questions via messaging

4. **Weekly Check-in** (5 min voice message)
   - Coach reviews weekly progress
   - Adjusts next week's plan based on performance
   - Sends encouragement + specific goals for next week

5. **Monthly Assessment** (Live, 15 min)
   - Formal skill evaluation
   - Belt progression advancement or plan adjustment
   - Celebrate wins, troubleshoot blockers

### **Instructor Interface (VR)**

- **Student View**: See student's hand position, gun orientation, target accuracy in real-time
- **Annotation Tools**: Draw on VR screen (point to holster position, target, etc.)
- **Voice Coaching**: Built-in audio (no external tools needed)
- **Performance Overlay**: Instant replay of last draw (frame-by-frame analysis)
- **Student Journal**: Write session notes, track milestones
- **Scheduling**: Built-in calendar, automatic reminders to students

### **Instructor Compensation**

- **Revenue Share**: Platform takes 30%, instructor takes 70% of subscription fees
- **Example**: $199/month subscription → instructor earns $140/month per student
- **Typical Load**: 1 instructor serves 5–10 students (earns $700–$1,400/month passive income)

### **Instructor Onboarding**

1. Application review (background check, firearms cert verification)
2. Platform training (2 hours on instructor VR interface)
3. Certification program (30-day trial period, feedback from students)
4. Launch: Instructor profile goes live on platform

---

## Technical Architecture

### **Hardware**

- **Headset**: Meta Quest 3S (or Quest 3/Pro)
- **Handset**: Arctus ($199) OR custom (see below)
- **Input**: 
  - Hand tracking (Meta hand-tracking APIs)
  - Trigger sensor (via Arctus or custom haptic controller)
  - Body tracking (optional: future expansion)

### **Software Stack**

```
┌─────────────────────────────────────────────┐
│  Meta Quest 3S (Runtime)                     │
├─────────────────────────────────────────────┤
│  Unity Engine (2022 LTS)                     │
│  ├─ Meta XR Plugin (hand tracking)           │
│  ├─ VR Physics (ragdoll, ballistics)         │
│  ├─ Audio Engine (spatial, stress cues)      │
│  └─ UI / UX (VR menus, scoring displays)     │
├─────────────────────────────────────────────┤
│  Game Logic Layer                            │
│  ├─ Drill State Machine                      │
│  ├─ Scoring Engine                           │
│  ├─ Progression Manager                      │
│  └─ Analytics Collector                      │
├─────────────────────────────────────────────┤
│  Backend Services (Node.js / Python)         │
│  ├─ User Authentication (OAuth / email)      │
│  ├─ Performance Analytics (PostgreSQL)       │
│  ├─ Leaderboards                             │
│  └─ Progression Sync                         │
└─────────────────────────────────────────────┘
```

### **Key Tech Decisions**

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Engine** | Unity 2022 LTS | Battle-tested for Quest, Meta SDK optimization, performance |
| **Hand Tracking** | Meta XR Hand Tracking | Native, low-latency (<50ms), no third-party SDK |
| **Trigger Detection** | Arctus haptic sensor OR custom BLE | Arctus proven; custom requires ~8 weeks R&D |
| **Ballistics** | Unity Physics + projectile script | Simplified but realistic for close-range training |
| **Audio** | Wwise or FMOD | Spatial audio for stress scenarios, threat positioning |
| **Backend** | Node.js + Express + PostgreSQL | Fast iteration, REST APIs, player analytics |
| **Deployment** | Meta App Lab (beta) → Quest Store | Sideload for testing; App Lab for closed beta; Store for 1.0 |

---

## Core Features (MVP)

### **1. Student-Facing Features**

#### **1a. Draw Drill System**
- [ ] Hand tracking captures hand position relative to holster
- [ ] Holster zones (AIWB, IWB, purse, bra carry, thigh) mapped to body position
- [ ] Body-type customization (petite, athletic, curvy) affects holster positioning
- [ ] Trigger detection via Arctus sensor
- [ ] Draw time measured from hand-in-holster to trigger-press
- [ ] Visual feedback: trajectory preview, hit marker, grouping visualization
- [ ] **Coaching Layer**: Instructor voice guidance overlaid during coached sessions

#### **1b. Target System**
- [ ] Static silhouette targets (A-zone, C-zone scoring)
- [ ] Pop-up targets (sudden appearance with time-to-hit window)
- [ ] Moving targets (linear or curved paths)
- [ ] Distance rendering: 7 / 15 / 25 yards (scale-accurate)

#### **1c. Scoring Engine**
- [ ] Draw Time (ms precision)
- [ ] Accuracy Ring (1–10 scale)
- [ ] Grouping (inches)
- [ ] Comfort Rating (1–5 scale for holster comfort)
- [ ] Stress Variance tracking

#### **1d. Progression & Belt System**
- [ ] White → Black belt ranking
- [ ] Coach-customized skill gates (not auto-unlocked)
- [ ] Achievement badges
- [ ] Private leaderboard (only against own personal bests)

#### **1e. Stress Mechanics**
- [ ] Audio overlays (adjustable intensity, body-appropriate threat scenarios)
- [ ] Time pressure (coach-controlled difficulty)
- [ ] Confidence-building progression (stress increased gradually)

#### **1f. Student Dashboard**
- [ ] Session calendar (upcoming coached sessions)
- [ ] Progress tracker (belt advancement, drill completion %)
- [ ] Coaching journal (instructor notes, feedback history)
- [ ] Practice log (uncoached drill attempts)
- [ ] Weekly goals (set by coach)

#### **1g. Onboarding**
- [ ] Body-type assessment (affects holster positioning)
- [ ] Carry-method selection (AIWB, IWB, purse, etc.)
- [ ] Fear/comfort baseline survey (personalize stress progression)
- [ ] First coached session scheduling

### **2. Instructor-Facing Features**

#### **2a. Instructor Dashboard**
- [ ] Student list (active, paused, graduated)
- [ ] Weekly schedule (coached session calendar)
- [ ] Student progress overview (belt, trending accuracy, engagement)

#### **2b. Coached Session Interface (In VR)**
- [ ] **Real-time Student View**: See student's hand position, gun angle, target accuracy live
- [ ] **Instructor Observation Mode**: Spectate in student's VR space
- [ ] **Voice Coaching**: Integrated audio (no external tools)
- [ ] **Annotation Tools**: Draw on VR screen to highlight form issues
- [ ] **Instant Replay**: Frame-by-frame review of last draw
- [ ] **Performance Overlay**: Metrics displayed side-by-side (draw time, accuracy, grouping)

#### **2c. Coaching Tools**
- [ ] Drill assignment (customize drills for individual student)
- [ ] Session notes (write feedback after each session)
- [ ] Performance analytics (track student trends over weeks)
- [ ] Video library (pre-recorded coaching tips to send to students)
- [ ] Messaging (async communication with students)

#### **2d. Student Profile**
- [ ] Body type, carry method, preferred positions
- [ ] Fear/comfort baseline, progressions over time
- [ ] Training history (all sessions, metrics, feedback)
- [ ] Goals (student-defined + coach-refined)

### **3. Backend/Admin Features**

#### **3a. Instructor Management**
- [ ] Application/approval workflow
- [ ] Verification (background check, firearms cert)
- [ ] Earnings dashboard (revenue share tracking)
- [ ] Student capacity management (max 10 per instructor)

#### **3b. Analytics & Reporting**
- [ ] Platform-wide metrics (DAU, retention, avg session length)
- [ ] Instructor performance (student completion rate, satisfaction, earnings)
- [ ] Student cohort analysis (belt progression rates, skill variance)

---

## Development Timeline (16 Weeks)

### **Week 1–2: Foundation**
- [ ] Set up Unity project, Meta XR plugin, hand-tracking integration
- [ ] Design VR space (range environment, target area, UI anchors)
- [ ] Implement holster detection (hand position tracking)
- [ ] **Deliverable**: Basic hand tracking + holster interaction

### **Week 3–4: Draw Mechanics**
- [ ] Implement draw-time measurement (holster → trigger press)
- [ ] Build 4 holster position variants (AIWB, OWB, shoulder, ankle)
- [ ] Create trigger detection system (Arctus sensor integration or controller input mapping)
- [ ] **Deliverable**: Full draw-speed drills with timing

### **Week 5–6: Accuracy & Targeting**
- [ ] Build target system (stationary, pop-up, moving)
- [ ] Implement ballistics (projectile spawn, physics, hit detection)
- [ ] Create scoring rings (1–10 accuracy scale)
- [ ] Distance scaling (7/15/25 yard rendering)
- [ ] **Deliverable**: Accuracy drills at all distances

### **Week 7–8: Scenario Drills & Stress**
- [ ] Build multiple-threat system (3–5 simultaneous targets)
- [ ] Implement time-pressure mechanics (countdown timer)
- [ ] Add audio stress layer (spatial sound, threat cues)
- [ ] Create difficulty progression (Beginner → Advanced variants)
- [ ] **Deliverable**: Full scenario drill suite

### **Week 9–10: Progression System**
- [ ] Design belt-ranking logic (thresholds, unlock criteria)
- [ ] Build progression UI (belt display, next-level goals)
- [ ] Implement achievement badges
- [ ] Create leaderboard infrastructure (local + cloud)
- [ ] **Deliverable**: Complete progression system

### **Week 11–12: Backend & Analytics**
- [ ] Build Node.js API (user auth, performance tracking, leaderboards)
- [ ] Design PostgreSQL schema (users, sessions, drill scores)
- [ ] Implement analytics collection (every shot logged)
- [ ] Create dashboard UI (historical graphs, weak-point detection)
- [ ] **Deliverable**: Backend + analytics functional

### **Week 13–14: Polish & QA**
- [ ] UI/UX refinement (menu navigation, visual hierarchy, accessibility)
- [ ] Performance optimization (90 FPS target on Quest 3S)
- [ ] Bug fixes, stability testing
- [ ] Internal playtesting (SME review for firearms accuracy)
- [ ] **Deliverable**: Stable, polished build

### **Week 15–16: Launch Prep**
- [ ] Safety & legal review (liability waivers, age gating)
- [ ] App Lab submission (Meta review cycle: 1–2 weeks)
- [ ] Documentation (user manual, coach guide)
- [ ] Marketing materials (demo video, social posts, influencer outreach)
- [ ] **Deliverable**: Ready for beta launch

---

## Minimum Viable Handset Hardware

### **Option A: Partner with Arctus**
- **Cost**: $199 (direct) or negotiate bulk licensing
- **Advantages**: Proven trigger, holster compatibility, SIG replicas available
- **Disadvantages**: Revenue share, limited customization
- **Timeline**: Immediate (no R&D)

### **Option B: Custom Handset** (If differentiating on haptics)
- **Components**: 
  - 3D-printed P365-compatible grip + slide
  - Commercial trigger mechanism ($20)
  - Haptic motor (DRV2605, $5) + BLE controller (nRF52840, $15)
  - Total BOM: ~$100–$150 per unit
- **Development**: 4–6 weeks (firmware + CAD)
- **Timeline**: Weeks 1–6 parallel development
- **Advantage**: Full IP control, custom feedback profiles

**Recommendation for MVP**: Use Arctus to launch faster; retrofit custom hardware for v1.1 (Q2 2027).

---

## Monetization Strategy (Women's 1-on-1 Coaching)

### **Pricing Model**

#### **For Students**
- **Hardware**: Arctus handset ($199) — one-time
- **Coaching Subscription**: 
  - **Intro Program (12 weeks, 3x/week coached sessions)**: $199/month × 3 = $597 total (or $199/month pay-as-you-go)
  - **Ongoing Maintenance (1–2x/week coached)**: $99/month
  - **Practice Pass (uncoached self-study only)**: $29/month (no coach interaction)

#### **For Instructors**
- **Instructor Revenue Share**: 70% of student subscription fees
  - Example: 1 student on $199/month intro → instructor earns $140/month
  - Typical load: 5–10 active students → $700–$1,400/month income (passive-ish)
- **Instructor Commission**: Platform takes 30% (hosting, payment processing, customer support)
- **Instructor Onboarding**: Free (platform incentivizes sign-up)

### **Launch Pricing (Year 1)**

**Student Bundles:**
- **Full Starter**: Quest 3S (user provides) + Arctus handset ($199) + Intro Program (12 weeks, $597) = **$796** total commitment
- **Coach-Only** (existing Arctus users): $199/month intro or $99/month ongoing

**Instructor Tiers:**
- **Tier 1 (New)**: 0–3 students, earn standard 70/30 split
- **Tier 2 (Established, 10+ graduates)**: 0% platform fee (earn 100% of subscription)
- **Tier 3 (Elite, high student satisfaction)**: Revenue share + $X bonus per student graduation

### **Revenue Model**
- **Year 1 Target**: 50 students × $597 (avg) = $29,850 / 3 months = platform revenue ~$8,955
- **Year 2 Target**: 200 students × $1,188/year (blended) = platform revenue ~$71,280
- **Year 3 Target**: 500+ students, 20+ instructors, platform revenue $200K+

---

## Success Metrics

| KPI | Target (6 months post-launch) |
|-----|-----|
| **Active Students** | 50–100 (closed beta) |
| **Active Instructors** | 5–10 (female coaches) |
| **Student Retention (12-week program)** | >85% (completion of intro program) |
| **Coach Satisfaction** | >4.5/5 (instructor NPS) |
| **Student Satisfaction** | >4.7/5 (student NPS) |
| **Accuracy Improvement** | +20% average over first 12 weeks (tracked systematically) |
| **Draw Time Improvement** | -0.5 to -1.0 seconds average (1.5s → 0.5–1.0s) |
| **Coach Utilization** | 70% (avg 7 of 10 students per coach) |
| **Monthly Cohort Revenue** | $9,900 (50 students × $198 avg monthly) |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Meta Quest hand-tracking latency too high for precise draws | Medium | High | Early prototyping; fallback to controller-based input |
| Arctus handset supply chain delays | Medium | High | Order 500 units immediately; negotiate lead-time guarantees |
| Simulator sickness during moving-target drills | Low | Medium | Design gradual difficulty progression; user comfort warnings |
| Regulatory scrutiny (firearms training) | Low | High | Consult legal counsel by Week 2; include disclaimers |
| Poor market adoption (niche audience) | Medium | High | Pre-launch survey of CCW subreddits; iterate on user feedback |

---

## Resource Allocation

### **Team Structure**

| Role | FTE | Weeks 1–16 |
|------|-----|-----------|
| VR Engineer (Lead) | 1.0 | All weeks (architecture, hand tracking, VR mechanics) |
| Backend Engineer | 0.5 | Weeks 9–16 (API, database, analytics) |
| Firearms SME (Consultant) | 0.2 | Weeks 1, 3, 7, 14 (drill design, safety review, beta testing) |
| QA / Playtester | 0.3 | Weeks 8–16 (bug hunting, UX validation) |

### **Budget Breakdown**

| Category | Cost |
|----------|------|
| **Personnel** | $100K (4 months engineering + SME) |
| **Hardware** (dev kits, testing) | $8K (Quest 3S, Arctus samples, etc.) |
| **Software Licenses** | $4K (Unity Pro, Wwise, hosting) |
| **Handset Inventory** (500 units @ $100 COGS) | $50K |
| **Infrastructure** (servers, database, CDN) | $8K |
| **Marketing / Launch** | $10K |
| **Contingency** | $10K |
| **TOTAL** | **$190K** |

---

## Post-MVP Roadmap (Year 2)

### **Phase 4: Enterprise Features (Q2 2027)**
- [ ] Multi-player scenarios (peer vs. peer drills)
- [ ] Instructor dashboard (manage student progression, group training)
- [ ] Custom scenario builder (trainers design custom drills)
- [ ] Force-feedback gloves integration (BHaptics, HaptX)

### **Phase 5: Expanded Content (Q3 2027)**
- [ ] Rifle/shotgun training modules
- [ ] Tactical movement (room clearing, corner work)
- [ ] Low-light scenarios (weapon-mounted flashlight interaction)
- [ ] De-escalation progression (decision-making branching scenarios)

### **Phase 6: Regulation & Certification (Q4 2027)**
- [ ] Partnership with firearms training organizations (IADCFT, etc.)
- [ ] Certified training programs (VR as prerequisite to live-fire)
- [ ] State-by-state compliance (local CCW requirements)

---

## Next Steps

1. **Lock handset decision** (Arctus partnership vs. custom?)
2. **Recruit VR engineer** (Unity expertise, Quest platform experience)
3. **Secure SME consultant** (concealed-carry trainer, drill design)
4. **Order dev hardware** (Quest 3S, Arctus samples)
5. **Begin prototype** (Week 1: hand tracking + holster detection)

---

**Questions before kickoff?**
- Hardware partnership timeline (Arctus)?
- Target launch date (beta vs. public)?
- Marketing channel strategy (subreddits, YouTube influencers, Facebook)?

