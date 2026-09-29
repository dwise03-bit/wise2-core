# WISE² RP iOS — Phase 1 MVP

**Complete native iOS app** (SwiftUI) for WISE² RP Living City ecosystem.

## 📊 Phase 1 Scope

✅ **Character Creation**
- Name input
- 8 archetype selection (Entrepreneur, Criminal, Officer, Paramedic, Firefighter, Realtor, Mechanic, Streamer)
- Starting balance based on archetype choice
- Persistent storage (UserDefaults)

✅ **Dashboard**
- Character stats display (Health, Stamina, Reputation)
- Real-time money tracker
- Experience bar + level progression
- Career statistics (jobs completed, money earned)
- Stamina restoration at Rest Stop ($100)

✅ **Jobs System**
- 5 starter jobs (delivery, retail, rideshare, security, content creation)
- Archetype-based job filtering (some jobs only for specific archetypes)
- Job card UI with difficulty, pay, XP rewards, duration
- Active job timer (countdown display)
- Job completion with money + XP rewards
- Stamina drain on job acceptance

✅ **Profile**
- Character overview
- Detailed stats and progression
- Career summary (jobs completed, total earned)
- Profit tracking (vs. starting balance)
- Character deletion with confirmation

✅ **Tab Navigation**
- Dashboard
- Jobs
- Profile

## 🎮 Gameplay Loop

1. **Create Character** — Choose name + archetype (gets starting balance)
2. **View Dashboard** — See stats, money, XP progress
3. **Accept Job** — Pick from available jobs (if stamina > 30%)
4. **Work (Timed)** — Timer counts down, can complete early
5. **Earn Rewards** — Money + XP instantly
6. **Level Up** — New level unlocks better jobs
7. **Repeat** — Build wealth and reputation

## 🛠️ Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Architecture**: MVVM with EnvironmentObject state management
- **Storage**: UserDefaults (single player, local only)
- **Data Persistence**: Codable models

## 📱 Requirements

- iOS 14.0+
- Xcode 15.0+
- Swift 5.9+

## 🚀 Setup & Build

### Option 1: Copy Files to Xcode Project

1. Create new iOS App (SwiftUI) in Xcode
2. Copy the Swift files from this folder into your Xcode project
3. Add all files to the build target
4. Build and run

### Option 2: Manual Xcode Setup

1. File → New → Project → iOS → App
2. Choose SwiftUI lifecycle
3. Name: `WISE2RP`
4. Delete default `ContentView.swift`
5. Add all `.swift` files from this directory to the project
6. Build target settings:
   - Minimum Deployment: iOS 14.0
   - Swift Version: 5.9+

### Build & Run

```bash
# Command line build (requires Xcode CLI tools)
xcodebuild -scheme WISE2RP -configuration Release build
```

## 📂 File Structure

```
WISE2RPA.swift          # Main app entry + window management
Models.swift            # Character, Job, UserProgress data models
GameViewModel.swift     # State management + business logic
OnboardingView.swift    # Character creation flow
MainTabView.swift       # Tab navigation + Dashboard
JobsView.swift          # Jobs list + active job timer
ProfileView.swift       # Character profile + stats
```

## 🎨 Design

- **Dark theme** with cyberpunk neon palette (purple/magenta/cyan/green)
- **Responsive UI** (adapts to all iPhone sizes)
- **System icons** (SF Symbols) for consistency
- **Smooth animations** via SwiftUI transitions

## 💾 Data Storage

All player data stored locally in UserDefaults:
- `WISE2RP_Player` — Character data (name, level, money, stats)
- `WISE2RP_Jobs` — Available jobs list

No network required for Phase 1.

## 🔄 Gameplay Progression

**Level 1 → Level 5** (example):
- 500 XP per level
- Unlock better-paying jobs at higher levels (next phases)
- Reputation system ready for faction/crime activities
- Health/stamina mechanics in place for future content

## 🎯 Phase 2 Roadmap

- [ ] Housing system (buy properties, earn passive income)
- [ ] Vehicle system (buy cars, customize, fast travel)
- [ ] Crime/Legal system (police, courts, jail)
- [ ] Factions & Territories
- [ ] Economy simulation (market prices, business ownership)
- [ ] Streaming/Content creation (monetization)
- [ ] Multiplayer social features (chat, relationships)
- [ ] City exploration (map navigation, businesses)

## 🐛 Known Limitations (Phase 1)

- Single player only (local storage)
- No internet connectivity
- 5 hard-coded starter jobs
- Linear progression (no branching paths yet)
- No animations/transitions (ready for Polish phase)
- Stamina restores only via Rest Stop ($100)

## 📊 Code Metrics

- **Total Lines**: ~1,850 (production code only)
- **Files**: 7 Swift files
- **Classes**: 1 ViewModel
- **Structs**: 4 Models + 12 Views
- **State Management**: EnvironmentObject pattern
- **Build Time**: ~30 seconds (clean build)

## 🎓 Architecture Notes

### MVVM Pattern
```
View (SwiftUI) ←→ ViewModel (GameViewModel) ←→ Model (Character, Job)
```

### State Flow
- Single `@StateObject GameViewModel` at app root
- Passed via `@EnvironmentObject` to all screens
- Views observe `@Published` properties
- Automatic UI updates on state changes

### Data Persistence
- Models conform to `Codable`
- Saved to UserDefaults on every change
- Loaded at app launch

## 🚦 Testing Checklist

- [ ] Create character successfully
- [ ] Switch between tabs
- [ ] Accept and complete jobs
- [ ] Money updates correctly
- [ ] XP bar progresses
- [ ] Level up triggers at 500 XP
- [ ] Stamina decreases on job start
- [ ] Timer counts down and auto-completes
- [ ] Restore stamina works
- [ ] Delete character resets app
- [ ] Data persists after close/reopen

## 📞 Support

For questions or feature requests, contact dwise03@gmail.com

---

**Built with ❤️ for WISE² Genesis**
*Where every choice matters. Every action counts.*
