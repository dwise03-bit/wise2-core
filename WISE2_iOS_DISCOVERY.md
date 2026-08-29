# WISE² iOS Command Center - Discovery Report

## Existing Infrastructure

### Design System ✅
- **Package**: `packages/design-system`
- **Colors**: Dark theme (carbon black #050505, electric blue #0094FF)
- **Typography**: Inter + SF Mono
- **Tokens**: Complete design tokens (spacing, shadows, animations)
- **Exports**: Tailwind config, CSS variables, TypeScript tokens

### Backend API ✅
- **Framework**: NestJS
- **Location**: `packages/api/src`
- **Controllers Available**:
  - `auth.controller.ts` - Signup/Login/Password Reset/Refresh
  - `projects.controller.ts`
  - `fieldtech.controller.ts`
  - `analytics.controller.ts`
  - `cjays.controller.ts`
  - `hermes.controller.ts`
  - `admin.controller.ts`
  - `config/api-status.controller.ts`

### Database Schema ✅
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Models**: Users, Sessions, Projects, Subscriptions, Accounts, etc.
- **Location**: `packages/db/prisma/schema.prisma`

### Existing Web Command Center ✅
- **Framework**: Next.js
- **Location**: `apps/command-center`
- **Type**: Admin/operations dashboard (web)

### Brand Assets ✅
- **Strategy**: Documented in `.claude/brand-assets/`
- **Guidelines**: Comprehensive brand guidelines
- **Voice**: Brand voice and messaging defined

## Existing iOS App (To Replace)
- **Current**: Simple HVAC Field Tech app (apps/wise2-ios)
- **Status**: Incomplete, needs replacement with full Command Center
- **Decision**: Scrap current simple app, build comprehensive Command Center instead

## Architecture Decision

### What Already Exists (Reuse)
1. ✅ Design tokens and design system
2. ✅ API backend with JWT authentication
3. ✅ Database schema with user models
4. ✅ Brand identity and guidelines
5. ✅ Existing NestJS API structure

### What We're Building (New)
1. 🆕 Native iOS Command Center using SwiftUI
2. 🆕 Five-tab navigation (HOME, AI, WORK, SYSTEMS, MORE)
3. 🆕 Role-based access control (6 roles)
4. 🆕 AI integration layer
5. 🆕 Premium design system adapted for iOS
6. 🆕 Security architecture (Face ID, Keychain, etc.)

## Next Steps

1. ✅ **Architecture Design** - Complete screen map, service contracts, data flow
2. ✅ **Xcode Project Structure** - Create proper folder organization
3. ✅ **Phase 1 Implementation** - Foundation, design system, navigation, auth
4. ✅ **API Integration** - Build service layer for existing endpoints
5. ✅ **Design System Adaptation** - Convert web tokens to iOS/SwiftUI

## Technical Stack

- **Language**: Swift
- **UI Framework**: SwiftUI
- **Architecture**: MVVM + Clean Architecture
- **Async**: async/await
- **Networking**: URLSession
- **Security**: Keychain, LocalAuthentication (Face ID)
- **Storage**: SwiftData (where appropriate)
- **Notifications**: APNs
- **Deep Links**: Universal Links support
- **Testing**: XCTest + preview-driven development

## API Endpoints to Integrate

From existing backend:
- `/v1/auth/signup` - Registration
- `/v1/auth/login` - Authentication
- `/v1/auth/refresh` - Token refresh
- `/v1/projects/*` - Project management
- `/v1/fieldtech/*` - Field operations
- `/v1/analytics/*` - Analytics & reporting
- `/v1/config/status` - System health

## Design System Adaptation

Web tokens → iOS SwiftUI:
- Colors: Direct mapping
- Typography: Scale to iOS safe defaults (system fonts + Inter)
- Spacing: Convert to CGFloat
- Shadows: Map to SwiftUI View modifiers
- Animations: Convert to SwiftUI animation system

## Security Architecture

1. **Authentication**: JWT via Bearer tokens
2. **Storage**: Keychain for tokens/secrets
3. **Biometric**: Face ID integration
4. **Network**: HTTPS only, certificate pinning (optional)
5. **Session**: Automatic token refresh before expiry
6. **Permissions**: Role-based access control enforced server-side

## Database/Data Layer Strategy

- SwiftData for offline caching (read-only)
- API-first for mutations
- Sync queue for offline operations
- Conflict resolution with server source-of-truth

## Files to Create/Modify

Create new:
- `WISE2_Command_Center_Architecture.md`
- `WISE2_iOS_ScreenMap.md`
- `WISE2_iOS_DataContracts.md`
- `WISE2_iOS_Implementation_Plan.md`
- Fresh Xcode project structure

Reuse:
- Keep existing WISE² API
- Keep existing design tokens
- Keep existing database schema
- Adapt web Command Center logic for iOS

---

**Status**: Ready to proceed with architecture design and Xcode project creation.
