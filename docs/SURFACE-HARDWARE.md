# WISE² Surface — Hardware Validation

**Device:** Microsoft Surface Laptop 4
**Hostname:** Wise2-surface
**OS:** Ubuntu 24.04.5 LTS (noble)
**Kernel:** 6.19.8-surface-3 (linux-surface) — **GRUB default, working, DO NOT REMOVE generic fallback kernels**
**Firmware:** 33.108.143 (2026-06-30)
**CPU:** Intel Core i7-1185G7 (Tiger Lake, 4C/4T, VT-x)
**RAM:** 16 GB (15 GiB usable) + 4 GiB swap
**GPU:** Intel Iris Xe (TigerLake-LP GT2)
**Storage:** KIOXIA BG4 NVMe, 233 GB (ext4 `/`, ~208 GB free); 1 GB EFI
**Secure Boot:** disabled (as per build policy)
**Validated:** 2026-10-02

> Source of truth: `/opt/wise2/logs/setup-audit-20261002-122926.txt`. This file
> records validation **by inspection** of a running system — it does not re-test
> by reconfiguring hardware. Items marked NEEDS MANUAL TEST require a human at the
> device (audio playback, camera capture, suspend/resume, external display).

## Status matrix

| Subsystem | Device / Driver | Status | Notes |
|---|---|---|---|
| Kernel | 6.19.8-surface-3 | ✅ WORKING | Surface kernel booted; running. Generic Ubuntu kernels retained as fallback. |
| Touchscreen | Intel Touch Host Controller + iptsd 3.1.0 | ✅ WORKING | `iptsd@dev-hidraw0.service` active/running. Physically tested per build spec. |
| Stylus | Intel Touch Host Controller Stylus | ✅ PRESENT | Stylus input node enumerated (libwacom-surface installed). |
| Keyboard | Surface type cover + 2.4G wireless kbd | ✅ WORKING | Internal + USB wireless keyboard both enumerated. |
| Trackpad | Microsoft Surface 045E:09AF Touchpad | ✅ WORKING | Enumerated as touchpad + mouse nodes. |
| Wi-Fi | Intel Wi-Fi 6 AX201 (`wlp0s20f3`) | ✅ WORKING | Associated, 192.168.1.14/24, IPv4+IPv6, default route. |
| Bluetooth | Intel AX201 BT (`8087:0026`) | ✅ ACTIVE | `bluetooth.service` active; bluetoothctl 5.72. Pairing NEEDS MANUAL TEST. |
| Audio (HW) | Intel Tiger Lake SST / HDA Intel PCH | ✅ PRESENT | Card 0 `PCH` enumerated. Playback/mic NEEDS MANUAL TEST (no pactl in audit shell). |
| Camera | Microsoft Surface Camera Front (`045e:0990`) | ✅ PRESENT | USB-enumerated. Capture NEEDS MANUAL TEST (IPU6 cameras often need extra stack). |
| Battery | BAT1 | ⚠️ PRESENT | Reports 100%. Showed "Discharging" while ADP1 online=1 — benign full-charge reporting quirk. |
| AC adapter | ADP1 | ✅ WORKING | `online=1` detected. |
| Thermal | x86_pkg_temp, iwlwifi | ✅ WORKING | Pkg ~56 °C, Wi-Fi ~48 °C at audit (idle/light). |
| Microcode | Intel | ✅ LOADED | revision 0xbe. |
| Graphics | Iris Xe (i915) | ✅ WORKING | Wayland session running. |
| Display session | GNOME / Wayland | ✅ WORKING | `loginctl` session Type=wayland. |
| Suspend | s2idle | ℹ️ CONFIG | `/sys/power/mem_sleep = [s2idle]` (modern standby; no deep S3). Resume NEEDS MANUAL TEST. |
| USB / Thunderbolt | TigerLake xHCI + TB4 | ✅ WORKING | Root hubs + Genesys hubs + peripherals enumerated. |
| Card reader | Elecom MR-K013 multicard | ✅ PRESENT | USB-enumerated. |
| NVMe | KIOXIA BG4 (DRAM-less) | ✅ WORKING | Mounted ext4 `/`, healthy, 7% used. |

## Known limitations / watch items

- **Modern standby (s2idle) only** — no classic S3 deep sleep. Expected on Surface
  Laptop 4; battery drain in suspend is higher than S3. **No power-management changes
  will be made without Daniel's approval.**
- **Front camera** enumerates over USB; Tiger Lake Surface devices sometimes need an
  additional userspace camera stack for capture. Marked NEEDS MANUAL TEST.
- **Battery "Discharging" at 100% on AC** — cosmetic reporting quirk at full charge;
  ADP1 reports online. Not an action item.
- **Audio** — hardware present; actual playback/mic capture not verifiable from the
  audit shell. Test from the desktop session.

## Do NOT (hardware safety boundaries)

- Do **not** reinstall or remove the `6.19.8-surface-3` kernel — it works.
- Do **not** remove the generic Ubuntu kernels — they are recovery/fallback.
- Do **not** make risky power-management / firmware changes without approval.
- Do **not** re-enable Secure Boot without planning (unsigned Surface modules).

## Manual test checklist (for Daniel at the device)

- [ ] Speaker playback + internal mic record
- [ ] Front camera capture (e.g. Cheese / browser)
- [ ] Bluetooth pair a device
- [ ] Suspend → resume (lid close / `systemctl suspend`)
- [ ] External display via USB-C / Thunderbolt
- [ ] Touch + stylus pressure in a drawing app
