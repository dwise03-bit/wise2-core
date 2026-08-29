# WISE2 iOS Wireless Distribution

This project uses Xcode automatic signing with a free Apple ID and SideStore for wireless installs and refreshes. It does not require the paid Apple Developer Program.

## Current Project Settings

- Project: `apps/wise2-ios/WISE2.xcodeproj`
- Scheme: `WISE2`
- Target: `WISE2`
- Build configuration: `Release`
- Bundle identifier: `com.dwise954.wise2.app`
- Deployment target: iOS `15.0`
- Signing style: Automatic
- Development team currently configured locally: `9N5L62DHKJ`

## Build The IPA

From the repository root:

```bash
bash scripts/ios-distribute.sh
```

The script builds a signed Release device app and packages it as:

```text
apps/wise2-ios/build/distribution/WISE2-YYYYMMDD-HHMMSS.ipa
```

Do not commit `.ipa`, `.xcarchive`, `.mobileprovision`, `.provisionprofile`, `.p12`, certificates, private keys, or Xcode result bundles.

## Daniel's One-Time Xcode Setup

1. Open `apps/wise2-ios/WISE2.xcodeproj` in Xcode.
2. Open Xcode Settings, then Accounts.
3. Add Daniel's Apple ID if it is not already present.
4. Select the `WISE2` target, then Signing & Capabilities.
5. Keep Automatically manage signing enabled.
6. Select Daniel's Personal Team.
7. Keep the bundle identifier as `com.dwise954.wise2.app` unless Xcode says that identifier is unavailable for the selected free team.
8. Build once to a connected iPhone if Xcode requires device registration or account confirmation.

Never put an Apple ID password, app-specific password, token, certificate password, or private signing asset in this repository.

## SideStore Setup

SideStore needs a one-time setup and pairing file. After that, normal app refreshes happen wirelessly when the phone can reach the required VPN/Wi-Fi path. Current SideStore setup details are maintained at:

- `https://sidestore.io/`
- `https://docs.sidestore.io/docs/installation/install`
- `https://docs.sidestore.io/docs/advanced/pairing-file`

1. Install SideStore on the iPhone using the official SideStore instructions.
2. Install and use `iLoader` as described by SideStore to install SideStore and place the pairing file.
3. Generate the SideStore pairing file during SideStore setup. This usually requires connecting the iPhone to the Mac once.
4. Import the pairing file into SideStore on the iPhone. SideStore commonly stores/selects `ALTPairingFile.mobiledevicepairing`.
5. On iOS 16 or newer, enable Developer Mode when iOS asks: Settings -> Privacy & Security -> Developer Mode.
6. Trust the developer profile if iOS asks: Settings -> General -> VPN & Device Management.
7. Open `LocalDevVPN` on the iPhone and connect it before refresh/install operations.
8. Sign in inside SideStore with the same Apple Account used during SideStore setup. Use normal SideStore prompts only; do not store credentials in this repo.
9. In SideStore, go to My Apps and tap the `7 DAYS` counter beside SideStore once to complete refresh setup.
10. Transfer the generated `WISE2-*.ipa` to the iPhone using AirDrop, Files, iCloud Drive, or another private channel.
11. Open SideStore, tap `+`, choose the WISE2 IPA, and install it.

If the pairing file expires or refresh starts failing after an iOS update/reset, replace the pairing file using SideStore's current pairing-file guide.

## Adding Another WISE2 Team Member

Each person using free provisioning needs their own Apple ID setup through SideStore.

1. Build a fresh IPA:

   ```bash
   bash scripts/ios-distribute.sh
   ```

2. Send that IPA to the team member privately.
3. The team member installs SideStore and completes SideStore pairing on their own iPhone with `iLoader`.
4. The team member enables Developer Mode, trusts the developer profile, and connects `LocalDevVPN`.
5. The team member signs into SideStore with their own Apple Account.
6. The team member opens the WISE2 IPA in SideStore and installs it.
7. The team member enables SideStore refresh automation or manually taps the `7 DAYS` counter before expiration.

If their Apple ID cannot install the IPA because the embedded provisioning profile is tied to Daniel's device/team, they must either:

- build/sign the same WISE2 source from their Mac with their own free Apple ID, or
- have Daniel physically add their device to the local Xcode-managed provisioning flow if Xcode permits it for the personal team.

Free Apple ID provisioning is intentionally limited by Apple, so this is not the same as TestFlight or enterprise distribution.

## The 7-Day Limitation

Apps signed with a free Apple ID usually expire after 7 days. SideStore handles this by re-signing and refreshing the installed app before it expires. The iPhone must periodically run SideStore refresh with its VPN/pairing setup working. If refresh is missed and the app expires, reinstall or refresh it again through SideStore.

## What Requires Human Interaction

- Apple ID login in Xcode or SideStore.
- Any Apple account two-factor authentication prompt.
- Trusting the developer profile on the iPhone.
- The one-time SideStore pairing step.
- Physical iPhone confirmation prompts during first provisioning.
