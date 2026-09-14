# WISE2 React Native / Expo

Prefer Expo for fast WISE2 customer apps unless required native hardware APIs make a native module or bare workflow materially better. Inspect `package.json`, Expo config, EAS config, native folders, plugins, and lockfile first.

## Verification
```bash
npx expo-doctor
npx expo start
npx expo export
```

Use the repository package manager rather than silently changing lockfiles. Validate iOS and Android independently. If custom native modules exist, test a development build rather than assuming Expo Go represents production behavior.

For release, verify EAS/native build configuration, application IDs, permissions, deep links, icons/splash assets, environment handling, update strategy, and store metadata. BLE/HVAC integrations require real iOS and Android hardware verification.
