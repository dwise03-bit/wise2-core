# Device Testing

## Principle

Compile success is not device success. Verify the actual target requested by the user whenever it is accessible.

## Android

1. `adb devices -l`
2. Confirm the intended serial; do not assume the first device is correct when multiple are attached.
3. Build the intended variant.
4. Install/replace with the appropriate `adb install` command.
5. Launch the package/activity.
6. Capture targeted logs with package/process filtering.
7. Exercise the requested flow.
8. Verify permissions, networking, rotation/background behavior if relevant.

Do not factory reset, uninstall user data, revoke permissions globally, or wipe a device unless explicitly required and approved.

## iOS

1. Confirm the simulator or physical device is visible to Apple tooling.
2. Confirm bundle id, scheme and signing state.
3. Build for the actual destination.
4. Install/launch using the project's supported Xcode/devicectl/simctl workflow.
5. Capture app-specific logs/crash output.
6. Exercise the requested flow and permission prompts.

Do not delete provisioning profiles/certificates or reset the device/simulator as a first-line fix.

## Verification evidence

Record:
- device name/model/OS when available;
- app version/build;
- artifact installed;
- launch result;
- key flow tested;
- meaningful log result;
- remaining failure if any.
