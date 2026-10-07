# WISE² — Darrin Workstation Onboarding

Owner: WISE²
User: Darrin (GitHub: wisevillain86)
Target: Windows 11 workstation
Purpose: Join Darrin's computer to the shared WISE² development and remote-management workflow.

## Security rule

This repository does NOT contain Tailscale auth keys, Desktop Commander device credentials, GitHub tokens, SSH private keys, passwords, or other secrets. Authentication must be completed interactively on Darrin's computer.

## 1. Prerequisites

Open PowerShell as Darrin and verify:

```powershell
git --version
node --version
```

If Git or Node.js is missing, install the current supported release from the official vendor before continuing.

## 2. GitHub

Authenticate Darrin's own GitHub account (`wisevillain86`) using GitHub's normal browser/device login. Then clone the shared repo:

```powershell
New-Item -ItemType Directory -Force C:\WISE2\repos | Out-Null
Set-Location C:\WISE2\repos
git clone https://github.com/dwise03-bit/wise2-core.git
Set-Location .\wise2-core
git pull
```

Do not copy Daniel's GitHub credentials to this machine.

## 3. Tailscale

Install Tailscale for Windows from the official Tailscale client. Sign in using the WISE²-approved account/invite flow. After approval:

```powershell
tailscale status
tailscale ip -4
```

Record the assigned machine name and confirm the WISE² nodes that Darrin is authorized to reach are visible.

## 4. Desktop Commander remote client

Create a dedicated local folder:

```powershell
New-Item -ItemType Directory -Force C:\WISE2\desktop-commander | Out-Null
Set-Location C:\WISE2\desktop-commander
npm init -y
npm install @wonderwhy-er/desktop-commander
```

Start the remote enrollment:

```powershell
npx @wonderwhy-er/desktop-commander remote
```

Complete any browser/device authorization shown by Desktop Commander. Do not paste enrollment secrets into GitHub.

After the first successful enrollment, verify the new machine appears as a distinct Desktop Commander device before enabling automatic startup.

## 5. Persistent startup

After enrollment is verified, use Windows Task Scheduler to run the enrolled Desktop Commander remote command at Darrin's sign-in with the working directory set to:

```text
C:\WISE2\desktop-commander
```

Configure it to restart on failure and run without opening an interactive terminal window where supported. Keep one startup entry only; remove duplicates after verifying the replacement works.

## 6. Verification

Run:

```powershell
tailscale status
git -C C:\WISE2\repos\wise2-core status
```

Then verify from the WISE² admin side that Darrin's computer:
- appears as its own Desktop Commander device;
- is reachable only through the approved WISE² remote path;
- can access the shared repository;
- survives sign-out/reboot and reconnects automatically.

## Naming

Use a clear hostname/device label such as `wise2-darrin` so it cannot be confused with Daniel's MacBook, Surface, Pi, or VPS.

## Do not commit

Never commit `.env`, auth keys, tokens, cookies, private SSH keys, Desktop Commander enrollment credentials, or Tailscale reusable auth keys.
