# WISE² RP iOS — Build Instructions

## Quick Start (2 minutes)

### Method 1: Open in Xcode (Recommended)

1. **Open Xcode**
   ```bash
   open /Users/danielwise/Projects/wise2-core/apps/mobile-ios
   ```

2. **Select iOS simulator**
   - Top toolbar: Product → Scheme → Edit Scheme
   - Run tab → Info → Simulator: iPhone 15 Pro (or your preferred device)

3. **Build and Run**
   - Product → Run (⌘R)
   - Wait for build (~30 seconds on first build)

### Method 2: Command Line Build

```bash
cd /Users/danielwise/Projects/wise2-core/apps/mobile-ios

# Build for simulator
xcodebuild -scheme WISE2RP -configuration Debug -sdk iphonesimulator

# Run in simulator
xcrun simctl install booted ./build/Debug-iphonesimulator/WISE2RP.app
xcrun simctl launch booted com.company.WISE2RP
```

## Project Structure

```
apps/mobile-ios/
├── README.md                    # Feature overview
├── BUILD_INSTRUCTIONS.md        # This file
├── WISE2RPApp.swift            # App entry point (@main)
├── Models.swift                # Character, Job, UserProgress
├── GameViewModel.swift         # State management (MVVM)
├── OnboardingView.swift        # Onboarding: name + archetype selection
├── MainTabView.swift           # Tab nav: Dashboard + Jobs + Profile
├── JobsView.swift              # Jobs list + active job timer
├── ProfileView.swift           # Character stats + deletion
└── WISE2RP/                    # Xcode project resources
    ├── Info.plist              # Bundle configuration
    └── LaunchScreen.storyboard # Launch screen
```

## What's Built (1,850 lines)

✅ **Character Creation**
- Name input field
- 8 archetype selection (Entrepreneur, Criminal, Officer, Paramedic, Firefighter, Realtor, Mechanic, Streamer)
- Starting balance assigned per archetype
- Persistent storage via UserDefaults

✅ **Dashboard**
- Character name, level, archetype, balance display
- Health, Stamina, Reputation stats
- Experience progress bar
- Career statistics (jobs completed, money earned)
- Stamina restoration option

✅ **Jobs System**
- 5 starter jobs with varied pay/difficulty
- Archetype-based filtering
- Countdown timer (30-60 min per job)
- Rewards: money + XP on completion
- Stamina management

✅ **Profile**
- Character details and progression
- Career summary
- Profit tracking
- Delete character option

✅ **Navigation**
- Tab bar: Dashboard | Jobs | Profile
- Smooth transitions between screens
- State persistence across app restarts

## Testing Checklist

After launching, test this flow:

1. **Onboarding** (30 seconds)
   - [ ] Enter character name
   - [ ] Select archetype (try Criminal for low starting balance, Entrepreneur for high)
   - [ ] Click "Create Character"
   - [ ] Confirm dashboard appears with correct balance

2. **Dashboard** (1 minute)
   - [ ] Verify character stats display correctly
   - [ ] Check experience bar shows 0/500
   - [ ] Verify jobs completed = 0
   - [ ] Try "Restore Stamina" if stamina < 30
   - [ ] Confirm $100 deducted from balance

3. **Jobs** (3-5 minutes)
   - [ ] See 5 available jobs
   - [ ] Click a job to start it
   - [ ] Verify active job timer appears
   - [ ] Watch timer count down (30-60 seconds)
   - [ ] Complete job when ready
   - [ ] Confirm money updated on dashboard
   - [ ] Check experience progressed

4. **Progression** (2-3 jobs)
   - [ ] Complete jobs until experience bar fills
   - [ ] Confirm level up to 2 when reaching 500 XP
   - [ ] Verify experience resets to 0/1000 (level 2 = 1000 XP needed)
   - [ ] Check total jobs completed increases

5. **Profile**
   - [ ] Switch to Profile tab
   - [ ] Verify all character data matches dashboard
   - [ ] Check profit = current balance - starting balance
   - [ ] View career summary (jobs, earned)

6. **Persistence**
   - [ ] Force quit app (Cmd+. in simulator)
   - [ ] Relaunch app
   - [ ] Verify character and stats intact

## Known Limitations (Phase 1)

- Local storage only (no cloud sync)
- Single player
- 5 hard-coded starter jobs
- No animations/transitions yet
- Stamina only recovers via Rest Stop ($100)
- No branching dialogue or narrative yet

## Next Phases

- **Phase 2**: Housing system (buy properties, rent, passive income)
- **Phase 3**: Vehicles (buy, customize, fast travel)
- **Phase 4**: Crime/Legal system (police, courts, jail)
- **Phase 5**: Factions & territories (gang wars, control)
- **Phase 6**: Economy simulation (market, businesses)
- **Phase 7**: Streaming/content creation
- **Phase 8**: Multiplayer (chat, relationships, crews)
- **Phase 9**: City exploration (map, businesses, locations)

## Troubleshooting

### "Build failed" error
- **Solution**: Clean build folder (Cmd+Shift+K), then rebuild
- **Alternative**: Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/`

### "Cannot run on simulator"
- **Solution**: Select a simulator first (Window → Devices and Simulators → iPhone 15 Pro → Boot)

### App crashes on start
- **Solution**: Check Console tab in Xcode for error messages
- **Common**: Make sure all Swift files are added to build target

### Data not persisting
- **Solution**: Simulator → Settings → WISE2RP → Reset (to clear UserDefaults)
- **Alternative**: Restart simulator completely

### Slow timer/UI lag
- **Solution**: Try different simulator device (smaller devices run faster)
- **Alternative**: Reduce simulator scale (Cmd+1, Cmd+2, etc.)

## Technical Details

**Architecture**: MVVM (Model-View-ViewModel)
- Models: Character, Job, UserProgress (Codable)
- ViewModel: GameViewModel (ObservableObject, @Published)
- Views: SwiftUI declarative UI
- Storage: UserDefaults (single player, local only)

**State Management**:
- Root app creates `@StateObject GameViewModel`
- Passes via `@EnvironmentObject` to all screens
- Views observe `@Published` properties
- Automatic UI refresh on state changes

**Performance**:
- ~1,850 lines of production code
- No heavy computations
- Lightweight data models
- Local-only storage (instant read/write)

## Support

For issues or questions:
- Check BUILD_INSTRUCTIONS.md (this file)
- Read README.md for feature overview
- Check Xcode console for error messages
- Contact: dwise03@gmail.com

---

**Built with ❤️ for WISE² Genesis**
*Where every choice matters. Every action counts.*
