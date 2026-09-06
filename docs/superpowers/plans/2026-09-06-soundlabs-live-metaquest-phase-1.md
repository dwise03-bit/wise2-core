# WISE² SoundLabs Live Meta Quest Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first customer-facing Meta Quest 3/3S client that authenticates to WISE², joins an authoritative SoundLabs Live session, renders creator/viewer roles in MR or VR, supports presence/chat/polls, and safely reconnects without corrupting session state.

**Architecture:** Add `apps/soundlabs-quest` as a Unity/OpenXR client of the existing SoundLabs Live service. Keep domain/networking code isolated from Unity scene behavior, use backend snapshots/events as authority, and treat MR and VR as two presentation modes over one shared session store.

**Tech Stack:** Unity LTS, C#, Meta XR SDK, OpenXR, Unity Test Framework, HTTPS REST, realtime WebSocket/Socket.IO-compatible gateway, Android/Meta Quest 3/3S.

**Spec:** `docs/superpowers/specs/2026-09-06-soundlabs-live-metaquest-design.md`

## Global Constraints

- Target Meta Quest 3 and Quest 3S.
- Use Unity + Meta XR/OpenXR; do not build a WebXR replacement.
- Existing WISE² LiveSession is authoritative; do not create a parallel XR session database.
- No JWT signing secret, OBS credentials, Discord bot token, AI provider key, or database credential may be included in the APK.
- Server-side permissions remain authoritative for every mutation.
- Viewer clients never receive functional creator controls.
- Audience influence never directly modifies creative track state.
- Reconnect always requests and applies a fresh authoritative session snapshot.
- No fake users, votes, stream state, generation state, audio meters, or telemetry.
- If realtime/media/broadcast/Discord is unavailable, show an explicit degraded/unavailable state.
- MR and VR must share the same session/domain state.
- Target 72 FPS minimum on Quest 3S before enabling higher refresh targets.

---

### Task 1: Create the Quest Domain Contract and EditMode Test Harness

**Files:**
- Create: `apps/soundlabs-quest/Assets/WISE2/Core/LiveRole.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Core/CrowdMode.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Core/SessionSnapshot.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Core/RoleCapabilities.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/EditMode/RoleCapabilitiesTests.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/WISE2.Core.asmdef`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/EditMode/WISE2.Tests.EditMode.asmdef`
- Create: `apps/soundlabs-quest/README.md`

**Interfaces:**
- Produces: `LiveRole`, `CrowdMode`, `SessionSnapshot`, `RoleCapabilities.CanVote`, `CanChat`, `CanCreateVersion`, `CanPromoteVersion`, `CanModerate`, `CanManageRoles`.

- [ ] **Step 1: Write the failing role-capability test**

```csharp
using NUnit.Framework;
using WISE2.SoundLabs.Core;

public class RoleCapabilitiesTests
{
    [Test]
    public void ViewerCanVoteButCannotPromote()
    {
        Assert.That(RoleCapabilities.CanVote(LiveRole.Viewer), Is.True);
        Assert.That(RoleCapabilities.CanPromoteVersion(LiveRole.Viewer), Is.False);
    }

    [Test]
    public void ModeratorCannotPromoteCreativeState()
    {
        Assert.That(RoleCapabilities.CanModerate(LiveRole.Moderator), Is.True);
        Assert.That(RoleCapabilities.CanPromoteVersion(LiveRole.Moderator), Is.False);
    }

    [Test]
    public void OwnerCanManageRoomAndCreativeState()
    {
        Assert.That(RoleCapabilities.CanManageRoles(LiveRole.Owner), Is.True);
        Assert.That(RoleCapabilities.CanPromoteVersion(LiveRole.Owner), Is.True);
    }
}
```

- [ ] **Step 2: Run EditMode tests and verify RED**

Run from Unity batch mode on a Unity-capable runner:

```bash
Unity -batchmode -projectPath apps/soundlabs-quest -runTests -testPlatform EditMode -testResults TestResults/editmode.xml -quit
```

Expected: FAIL because domain types/capability policy do not exist.

- [ ] **Step 3: Implement the minimal domain policy**

Use exact backend role names mapped to C# enum members:

```csharp
namespace WISE2.SoundLabs.Core
{
    public enum LiveRole { Owner, CoArtist, Producer, Guest, Moderator, Viewer }

    public static class RoleCapabilities
    {
        public static bool CanVote(LiveRole role) => true;
        public static bool CanChat(LiveRole role) => true;
        public static bool CanCreateVersion(LiveRole role) => role is LiveRole.Owner or LiveRole.CoArtist or LiveRole.Producer;
        public static bool CanPromoteVersion(LiveRole role) => role is LiveRole.Owner or LiveRole.CoArtist;
        public static bool CanModerate(LiveRole role) => role is LiveRole.Owner or LiveRole.Moderator;
        public static bool CanManageRoles(LiveRole role) => role == LiveRole.Owner;
    }
}
```

`SessionSnapshot` must contain session ID, project ID, title, crowd mode, participant list, current track/version identifiers, open poll state, and server timestamp. Do not add local authority fields.

- [ ] **Step 4: Run EditMode tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest
git commit -m "feat(quest): add SoundLabs Live domain contract"
```

### Task 2: Add Secure Configuration and WISE² Session Authentication Client

**Files:**
- Create: `apps/soundlabs-quest/Assets/WISE2/Auth/IAuthTokenStore.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Auth/QuestAuthTokenStore.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Auth/WiseAuthClient.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Networking/WiseApiConfig.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/EditMode/WiseApiConfigTests.cs`

**Interfaces:**
- Consumes: existing WISE² JWT access token issued server-side.
- Produces: `WiseApiConfig.BaseUrl`, `IAuthTokenStore.GetAccessTokenAsync()`, `SetAccessTokenAsync(string)`, `ClearAsync()`, `WiseAuthClient.HasSessionAsync()`.

- [ ] **Step 1: Write failing configuration tests**

Assert production configuration rejects HTTP and never exposes a signing secret property.

```csharp
[Test]
public void ProductionBaseUrlMustUseHttps()
{
    Assert.Throws<System.ArgumentException>(() => new WiseApiConfig("http://api.wise2.net", true));
}
```

- [ ] **Step 2: Run EditMode tests and verify RED**

Use the Task 1 Unity batch command. Expected: FAIL because `WiseApiConfig` is absent.

- [ ] **Step 3: Implement configuration and token-store boundaries**

`WiseApiConfig` validates HTTPS in production. `QuestAuthTokenStore` wraps platform-secure storage behind `IAuthTokenStore`; it must not write raw tokens to PlayerPrefs. `WiseAuthClient` reads an access token and reports only whether a usable session exists. No JWT signing or local role elevation exists.

- [ ] **Step 4: Run EditMode tests and verify GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest/Assets/WISE2/Auth apps/soundlabs-quest/Assets/WISE2/Networking apps/soundlabs-quest/Assets/WISE2/Tests/EditMode
git commit -m "feat(quest): add secure WISE2 auth boundary"
```

### Task 3: Build the Authoritative Session Snapshot Client

**Files:**
- Create: `apps/soundlabs-quest/Assets/WISE2/Sessions/ISessionApi.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Sessions/SoundLabsSessionApi.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Sessions/LiveSessionStore.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/EditMode/LiveSessionStoreTests.cs`

**Interfaces:**
- Produces: `Task<SessionSnapshot> GetSnapshotAsync(string sessionId, CancellationToken)`, `LiveSessionStore.ApplySnapshot(SessionSnapshot)` and immutable current state events.

- [ ] **Step 1: Write a failing stale-state reconciliation test**

Create a store with local version `v1`, apply a newer server snapshot with `v2`, and assert `v2` becomes current while the server role/crowd mode replace local values.

- [ ] **Step 2: Run tests and verify RED**

Expected: FAIL because store/API do not exist.

- [ ] **Step 3: Implement snapshot API and store**

`SoundLabsSessionApi` sends `Authorization: Bearer <token>` to the existing SoundLabs Live snapshot endpoint. `LiveSessionStore` never merges local authority over server authority; `ApplySnapshot` replaces session/participant/version/poll authority atomically.

- [ ] **Step 4: Run tests and verify GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest/Assets/WISE2/Sessions apps/soundlabs-quest/Assets/WISE2/Tests/EditMode
git commit -m "feat(quest): add authoritative session snapshots"
```

### Task 4: Add Realtime Presence, Chat, Poll Events and Reconnect Recovery

**Files:**
- Create: `apps/soundlabs-quest/Assets/WISE2/Realtime/ILiveRealtimeClient.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Realtime/LiveRealtimeClient.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Realtime/RealtimeEvent.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Realtime/ReconnectCoordinator.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/EditMode/ReconnectCoordinatorTests.cs`

**Interfaces:**
- Consumes realtime events `participant.joined`, `participant.left`, `participant.role.updated`, `poll.opened`, `poll.vote.updated`, `poll.closed`, `chat.message.created`.
- Produces `ConnectionState` and triggers `ISessionApi.GetSnapshotAsync()` after every successful reconnect.

- [ ] **Step 1: Write failing reconnect test**

Use fake realtime and fake session API. Simulate disconnect/reconnect. Assert the coordinator requests exactly one fresh snapshot and applies it before mutations are re-enabled.

- [ ] **Step 2: Run tests and verify RED**

Expected: FAIL.

- [ ] **Step 3: Implement realtime boundary and coordinator**

Do not make the socket itself authoritative. On reconnect, set state to `Recovering`, fetch snapshot, apply it, then transition to `Connected`. If snapshot recovery fails, remain degraded and keep unsafe mutations disabled.

- [ ] **Step 4: Run tests and verify GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest/Assets/WISE2/Realtime apps/soundlabs-quest/Assets/WISE2/Tests/EditMode
git commit -m "feat(quest): add realtime recovery contract"
```

### Task 5: Build Shared Spatial Room Shell for MR and VR

**Files:**
- Create: `apps/soundlabs-quest/Assets/WISE2/SpatialUI/LiveRoomPresenter.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/SpatialUI/RoleSurfacePolicy.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/SpatialUI/ParticipantStagePresenter.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/SpatialUI/ConnectionBannerPresenter.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/PlayMode/RoleSurfacePolicyTests.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/PlayMode/WISE2.Tests.PlayMode.asmdef`
- Create: `apps/soundlabs-quest/Assets/WISE2/Scenes/SoundLabsLiveMR.unity`
- Create: `apps/soundlabs-quest/Assets/WISE2/Scenes/SoundLabsLiveVR.unity`

**Interfaces:**
- Consumes `LiveSessionStore`.
- Produces role-gated creator/viewer surfaces and common connection-state presentation.

- [ ] **Step 1: Write failing role-surface PlayMode tests**

Assert Viewer hides/does not instantiate creator mutation controls; Owner shows them; Moderator sees moderation but not version promotion.

- [ ] **Step 2: Run PlayMode tests and verify RED**

```bash
Unity -batchmode -projectPath apps/soundlabs-quest -runTests -testPlatform PlayMode -testResults TestResults/playmode.xml -quit
```

Expected: FAIL.

- [ ] **Step 3: Implement shared room presenter**

MR and VR scenes reference the same `LiveRoomPresenter` prefab/state bindings. Scene-specific code only changes environment/passthrough presentation. Role hiding is UX only; backend permission enforcement remains mandatory.

- [ ] **Step 4: Run PlayMode tests and verify GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest/Assets/WISE2/SpatialUI apps/soundlabs-quest/Assets/WISE2/Scenes apps/soundlabs-quest/Assets/WISE2/Tests/PlayMode
git commit -m "feat(quest): add shared MR and VR live room shell"
```

### Task 6: Add Participant Presence, Live Chat and Guided Influence Polls

**Files:**
- Create: `apps/soundlabs-quest/Assets/WISE2/Crowd/CrowdPanelPresenter.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Crowd/PollCommandClient.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Chat/LiveChatPresenter.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Chat/ChatCommandClient.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/EditMode/CrowdModeTests.cs`

**Interfaces:**
- Consumes server crowd mode and poll/chat state.
- Produces authenticated vote/chat commands; no direct local poll aggregate mutation.

- [ ] **Step 1: Write failing Crowd Mode tests**

Assert WATCH_ONLY blocks vote/suggestion commands, GUIDED permits open-poll votes, and Viewer cannot open/close a poll.

- [ ] **Step 2: Run tests and verify RED**

Expected: FAIL.

- [ ] **Step 3: Implement chat/poll command boundaries**

Commands are sent to backend and UI waits for authoritative event/snapshot reconciliation. Sanitize displayed user text and bound in-memory history.

- [ ] **Step 4: Run tests and verify GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest/Assets/WISE2/Crowd apps/soundlabs-quest/Assets/WISE2/Chat apps/soundlabs-quest/Assets/WISE2/Tests/EditMode
git commit -m "feat(quest): add spatial crowd and chat controls"
```

### Task 7: Configure Meta Quest Build, OpenXR, Passthrough and Controller/Hand Input

**Files:**
- Create/Modify through Unity project settings: `apps/soundlabs-quest/ProjectSettings/ProjectSettings.asset`
- Create/Modify: `apps/soundlabs-quest/Packages/manifest.json`
- Create: `apps/soundlabs-quest/Assets/WISE2/MR/PresentationModeController.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/MR/InputModePresenter.cs`
- Create: `apps/soundlabs-quest/Assets/WISE2/Tests/PlayMode/PresentationModeTests.cs`

**Interfaces:**
- Produces `PresentationMode.MR` and `PresentationMode.VR`, controller and hand-tracking interaction modes.

- [ ] **Step 1: Write failing presentation-mode test**

Assert changing MR/VR presentation does not replace or reset the active `LiveSessionStore`.

- [ ] **Step 2: Run PlayMode tests and verify RED**

Expected: FAIL.

- [ ] **Step 3: Configure Quest runtime**

Enable Android Quest target, OpenXR/Meta XR, controller input, hand tracking, and passthrough permissions. `PresentationModeController` toggles environment/passthrough layers only and keeps shared session state intact.

- [ ] **Step 4: Run PlayMode tests and verify GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/soundlabs-quest/Packages apps/soundlabs-quest/ProjectSettings apps/soundlabs-quest/Assets/WISE2/MR apps/soundlabs-quest/Assets/WISE2/Tests/PlayMode
git commit -m "feat(quest): configure Meta XR MR and VR runtime"
```

### Task 8: Add Quest CI and Customer Device Smoke Checklist

**Files:**
- Create: `.github/workflows/soundlabs-quest-ci.yml`
- Create: `apps/soundlabs-quest/docs/QUEST_3S_SMOKE_TEST.md`

**Interfaces:**
- Produces repeatable EditMode/PlayMode/build validation and manual device acceptance checklist.

- [ ] **Step 1: Add CI that runs Unity tests when Unity license credentials are configured**

Use GameCI or the repository-approved Unity runner. CI must run EditMode tests, PlayMode tests, and Android build. Do not silently skip failures. Document required repository secrets for Unity licensing rather than committing credentials.

- [ ] **Step 2: Add exact Quest 3S smoke test**

Checklist must verify:
1. cold launch
2. WISE² authentication
3. join existing session
4. MR passthrough
5. VR switch without state reset
6. real participant roles
7. chat
8. Guided Influence vote
9. Viewer creator-control denial
10. network disconnect/recovery
11. controller fallback
12. hand tracking
13. 30-minute stability at 72 FPS target
14. clean exit

- [ ] **Step 3: Run CI/build verification**

Expected: all configured Unity tests/build jobs green. If Unity licensing is unavailable, mark device/build verification BLOCKED rather than PASS.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/soundlabs-quest-ci.yml apps/soundlabs-quest/docs/QUEST_3S_SMOKE_TEST.md
git commit -m "ci(quest): add Meta Quest verification gate"
```

## Completion Gate

Phase 1 is complete only when:

- Quest project opens in the selected Unity LTS version without package errors.
- EditMode tests pass.
- PlayMode tests pass.
- Android/Quest build succeeds.
- No production secret is present in project or APK configuration.
- WISE² authentication is required before joining private sessions.
- Quest joins an authoritative existing LiveSession.
- Owner/Co-Artist/Producer/Guest/Moderator/Viewer presentation matches server role.
- Viewer cannot invoke creator mutations even with a forged client request because server rejects them.
- Presence/chat/polls update from real backend state.
- WATCH_ONLY blocks audience influence.
- GUIDED accepts permitted votes.
- Reconnect requests a fresh authoritative snapshot before mutations resume.
- MR/VR switch preserves the same LiveSession state.
- No fake meters, stream state, AI jobs, Discord state, users, or votes are displayed.
- Quest 3S manual smoke test passes.

## Deferred to Later XR Phases

- AI generation UI and provider job integration.
- waveform/stem production surfaces beyond basic current-track state.
- spatial mixer and real audio telemetry.
- Studio Broadcast Bridge controls.
- WebRTC collaborator voice/video and spatial audio.
- Discord spatial surfaces.
- fan monetization/perks.
- Meta Store launch/entitlement hardening.
