# Setting Up Google Drive Sync for WISE² Agentic OS Guide

Access your Agentic OS guide from any device by syncing to Google Drive.

---

## Option 1: Google Drive for Desktop (Easiest) ✅

**Official Google syncing tool. Automatic, reliable, zero setup headaches.**

### Setup (5 minutes)

1. Download from: https://www.google.com/drive/download/
2. Install and sign in with: wisedefensellc@gmail.com
3. Create folder in Google Drive: `WISE2-Agentic-OS-Guide`
4. In Drive for Desktop settings:
   - Add folder to sync
   - Local path: `~/Desktop/wise2-agentic-os-guide/`
   - Click sync
5. Done! Access from browser, phone, or desktop

### Access Your Files

- **Browser**: https://drive.google.com
- **Mobile**: Google Drive app
- **Desktop**: Auto-synced folder
- **Offline**: Enable offline access in Drive settings

---

## Option 2: rclone (Command-Line)

**Powerful cloud sync tool for advanced users.**

### Setup (10 minutes)

```bash
# Install
sudo apt-get install rclone

# Configure (follow OAuth login)
rclone config
# Choose: n) New remote
# Name: google-drive
# Storage: drive
# Follow browser login

# Create folder
rclone mkdir google-drive:WISE2-Agentic-OS-Guide

# Sync files
rclone sync ~/Desktop/wise2-agentic-os-guide/ google-drive:WISE2-Agentic-OS-Guide/

# Auto-sync (add to crontab)
# 0 * * * * rclone sync ~/Desktop/wise2-agentic-os-guide/ google-drive:WISE2-Agentic-OS-Guide/ --verbose
```

---

## Option 3: Python Script (Custom)

**For custom workflows or if you prefer Python.**

```python
#!/usr/bin/env python3
"""Sync WISE² Agentic OS to Google Drive"""
import os
import pickle
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.api_python_client.discovery import build
from google.api_python_client.http import MediaFileUpload

FOLDER_NAME = "WISE2-Agentic-OS-Guide"
LOCAL_FOLDER = Path.home() / "Desktop" / "wise2-agentic-os-guide"
SCOPES = ['https://www.googleapis.com/auth/drive']

def get_credentials():
    creds = None
    token_file = Path.home() / ".cache" / "drive_token.pickle"
    
    if token_file.exists():
        with open(token_file, 'rb') as f:
            creds = pickle.load(f)
    
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(
            'client_secrets.json', SCOPES)
        creds = flow.run_local_server(port=0)
        with open(token_file, 'wb') as f:
            pickle.dump(creds, f)
    
    return creds

def main():
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    # Get or create folder
    query = f"name='{FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'"
    results = service.files().list(q=query, pageSize=1).execute()
    items = results.get('files', [])
    
    if items:
        folder_id = items[0]['id']
    else:
        file_metadata = {
            'name': FOLDER_NAME,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        folder = service.files().create(body=file_metadata).execute()
        folder_id = folder['id']
        print(f"✓ Created folder: {FOLDER_NAME}")
    
    # Upload files
    for file_path in LOCAL_FOLDER.glob('*'):
        if file_path.is_file():
            media = MediaFileUpload(file_path)
            file_metadata = {'name': file_path.name, 'parents': [folder_id]}
            service.files().create(body=file_metadata, media_body=media).execute()
            print(f"✓ Uploaded: {file_path.name}")
    
    print(f"\n✅ Access: https://drive.google.com/drive/folders/{folder_id}")

if __name__ == '__main__':
    main()
```

### Install dependencies:
```bash
pip install google-auth-oauthlib google-api-python-client
```

---

## Comparison

| Method | Time | Ease | Auto-Sync |
|--------|------|------|-----------|
| **Google Drive for Desktop** | 5 min | ⭐⭐⭐ | Yes |
| **rclone** | 10 min | ⭐⭐ | With cron |
| **Python Script** | 15 min | ⭐⭐⭐ | With cron |

---

## 🎯 Recommended: Use Google Drive for Desktop

It's official, automatic, and requires no terminal. Just download, sign in, and sync.

---

Email: wisedefensellc@gmail.com
Local folder: ~/Desktop/wise2-agentic-os-guide/
