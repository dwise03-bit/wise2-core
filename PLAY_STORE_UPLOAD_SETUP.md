# Google Play Console Upload - Setup Guide

## Option B: Programmatic Upload

This guide walks you through uploading your app icon and screenshots to Google Play Console using the automated Python script.

### Step 1: Get Google Play Service Account Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Enable **Google Play Android Developer API**
4. Go to **Service Accounts** (APIs & Services > Credentials)
5. Click **Create Service Account**
   - Name: `wise2-play-store-upload`
   - Grant **Editor** role
6. Create a **JSON key** for the service account
7. Download the JSON key file

### Step 2: Set Environment Variable

Save the JSON key somewhere safe (e.g., `~/.secrets/google-play-key.json`):

```bash
export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=~/.secrets/google-play-key.json
```

Add to your shell config (`~/.bashrc`, `~/.zshrc`) to persist:

```bash
echo 'export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=~/.secrets/google-play-key.json' >> ~/.zshrc
```

### Step 3: Install Python Dependencies

```bash
pip install google-auth google-auth-httplib2 google-auth-oauthlib google-api-python-client
```

Or using Poetry (if your project uses it):

```bash
poetry add google-auth google-api-python-client
```

### Step 4: Organize Your Assets

The script expects files in `play-store/`:

```
play-store/
├── icon_512x512.png              ✅ App icon (required)
├── feature_graphic_1024x500.png  ✅ Feature graphic (required)
└── screenshots/                  ⚙️  Optional screenshots
    ├── screenshot_1.png
    ├── screenshot_2.png
    └── ...
```

### Step 5: Run the Upload

```bash
cd /home/user/wise2-core
python3 scripts/upload_to_play_store.py
```

### Expected Output

```
============================================================
  WISE² App - Google Play Store Asset Upload
============================================================

📁 Asset directory: /home/user/wise2-core/play-store
📦 Package name: com.wise2.app

🔐 Authenticating with Google Play API...
✅ Authentication successful

📤 Uploading app icon: icon_512x512.png
✅ Icon uploaded successfully
📤 Uploading feature graphic: feature_graphic_1024x500.png
✅ Feature graphic uploaded successfully
📤 Uploading 0 screenshot(s)...

============================================================
  Upload Summary
============================================================
Icon: ✅ Success
Feature Graphic: ✅ Success
Screenshots: ✅ Success
============================================================
```

---

## Troubleshooting

### "Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON environment variable"

**Solution**: Make sure you set the environment variable:
```bash
export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/key.json
python3 scripts/upload_to_play_store.py
```

### "Service account file not found"

**Solution**: Check that the path is correct:
```bash
ls -la ~/.secrets/google-play-key.json
```

### "Permission denied" errors

**Solution**: Make sure the service account has:
- **Editor** role on the Google Cloud project
- Access granted in Google Play Console (Settings > Users & Permissions > Add service account email)

### API Not Enabled

**Solution**: Enable Google Play Android Developer API:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com)
2. Click **Enable**

---

## Next Steps

After uploading:

1. Log into [Google Play Console](https://play.google.com/console)
2. Navigate to your app
3. Check **Store Listing** to verify uploads
4. Add more screenshots if needed
5. Submit for review

---

## Security Notes

⚠️ **Never commit your service account JSON key!**

- Add to `.gitignore`:
  ```
  ~/.secrets/
  **/service-account-*.json
  **/google-play-key.json
  ```
- Store the key in a secure location outside your repo
- Rotate keys periodically
- Use different service accounts for different projects

