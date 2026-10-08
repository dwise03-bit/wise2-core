import {spawnSync} from 'node:child_process';

// Read-only check. Does not install applications or copy room data.
const result = spawnSync('adb', ['devices', '-l'], {encoding: 'utf8', shell: false});
if (result.error || result.status !== 0) {
  console.error('ADB unavailable. Install Android SDK Platform Tools and add adb to PATH.');
  process.exit(1);
}
console.log(result.stdout.trim());
const lines = result.stdout.split(/\r?\n/).slice(1).filter(x => x.trim());
const ready = lines.filter(x => /^\S+\s+device\b/.test(x));
if (!ready.length) {
  console.error('No authorized device. Connect Quest 3 by USB, enable Developer Mode and accept USB debugging in the headset.');
  process.exit(2);
}
console.log('ADB device available. Confirm it is your Quest 3 before using Unity Build and Run.');
