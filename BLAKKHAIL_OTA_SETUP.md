# BLAKKHAIL iOS - OTA Updates & Hosting Setup

**Status**: Ready for deployment  
**Last Updated**: 2026-09-24  
**Version**: 1.0.0

## Overview

Blakkhail iOS app is configured for Over-The-Air (OTA) updates via AltStore and wise2.net/apps hosting.

## Files Created

- `altstore.json` - AltStore app manifest (app-specific configuration)
- `public/apps/altstore-apps.json` - AltStore source index (master app list)
- `BLAKKHAIL_OTA_SETUP.md` - This setup guide

## Step 1: Export IPA File

### Via Xcode (Manual)
1. Open Blakkhail.xcodeproj in Xcode
2. Select Product → Archive
3. In Organizer, select the latest archive
4. Click "Distribute App"
5. Choose "Ad Hoc" signing method
6. Export the IPA file to: `~/Projects/wise2-core/releases/blakkhail/1.0.0/`

### Via Command Line (Recommended)
```bash
cd ~/Projects/wise2-core/apps/blakkhail-ios

# Build archive
xcodebuild -scheme Blakkhail -configuration Release \
  -sdk iphoneos -archivePath build/Blakkhail.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/Blakkhail.xcarchive \
  -exportPath releases/blakkhail/1.0.0 \
  -exportOptionsPlist ExportOptions.plist
```

## Step 2: Host on wise2.net/apps

### Directory Structure
```
wise2.net/apps/
├── blakkhail/
│   ├── icon.png               (1024x1024 app icon)
│   ├── icon-180.png          (180x180 home screen icon)
│   ├── icon-120.png          (120x120 notification icon)
│   ├── screenshots/
│   │   ├── 1.png             (App shop view)
│   │   ├── 2.png             (Product catalog)
│   │   └── 3.png             (Cart/checkout)
│   ├── releases/
│   │   ├── 1.0.0/
│   │   │   └── Blakkhail-1.0.0.ipa
│   │   └── latest → 1.0.0    (symlink to latest)
│   └── index.json            (Version metadata)
```

### Upload Process
1. **via SFTP**:
   ```bash
   sftp dwise@173.208.147.165
   cd /var/www/wise2.net/apps/blakkhail/
   put Blakkhail-1.0.0.ipa releases/1.0.0/
   ```

2. **via SCP**:
   ```bash
   scp -r releases/blakkhail/1.0.0 dwise@173.208.147.165:/var/www/wise2.net/apps/blakkhail/
   ```

3. **Update symlink**:
   ```bash
   ssh dwise@173.208.147.165
   cd /var/www/wise2.net/apps/blakkhail
   ln -sf 1.0.0 latest
   chmod -R 755 releases/1.0.0
   ```

## Step 3: AltStore Configuration

### Add AltStore Source
Users can add the source in AltStore:
1. Open AltStore app
2. Go to "Browse"
3. Add custom source: `https://wise2.net/apps/altstore-apps.json`
4. The BLAKKHAIL app will appear in available apps

### Direct Installation via QR Code
Generate a QR code pointing to: `altstore://source?url=https://wise2.net/apps/altstore-apps.json`

## Step 4: Update Management

### Adding New Versions
1. Increment version in: 
   - `BlakkhailApp.swift` (Bundle version build property)
   - `altstore.json` (version field)
   - `public/apps/altstore-apps.json` (version field)

2. Build and export new IPA:
   ```bash
   # Same build process as Step 1
   ```

3. Upload to wise2.net/apps:
   ```bash
   scp -r releases/blakkhail/1.1.0 dwise@173.208.147.165:/var/www/wise2.net/apps/blakkhail/
   ssh dwise@173.208.147.165 'cd /var/www/wise2.net/apps/blakkhail && ln -sf 1.1.0 latest'
   ```

4. Update `altstore-apps.json`:
   ```json
   {
     "version": "1.1.0",
     "versionDate": "2026-09-25T19:00:00Z",
     "downloadURL": "https://wise2.net/apps/blakkhail/releases/1.1.0/Blakkhail-1.1.0.ipa"
   }
   ```

## Step 5: Configure Web Server

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name wise2.net;

    location /apps/blakkhail/ {
        alias /var/www/wise2.net/apps/blakkhail/;
        
        # Enable directory listings
        autoindex on;
        
        # IPA file mime type
        types {
            application/octet-stream ipa;
        }
        
        # Allow downloads
        add_header Content-Disposition "attachment" always;
        add_header Content-Type "application/octet-stream" always;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    }
}
```

### Test Configuration
```bash
# Verify JSON is served correctly
curl https://wise2.net/apps/altstore-apps.json

# Verify IPA download works
curl -I https://wise2.net/apps/blakkhail/releases/1.0.0/Blakkhail-1.0.0.ipa
```

## Deployment Checklist

- [ ] IPA file built and tested on device
- [ ] App icon exported at all required sizes
- [ ] Screenshots captured at 1242x2208px (5.8" display)
- [ ] Directories created on wise2.net (via SSH)
- [ ] IPA uploaded to wise2.net/apps/blakkhail/releases/1.0.0/
- [ ] altstore-apps.json uploaded to wise2.net/apps/
- [ ] Web server configured with proper MIME types
- [ ] Download URL tested in browser
- [ ] AltStore source added and verified on device
- [ ] App installed via AltStore
- [ ] OTA update tested

## Monitoring & Updates

### App Update Process (User Perspective)
1. User adds AltStore source
2. AltStore checks `altstore-apps.json` daily
3. When new version available, user sees "UPDATE" badge
4. User taps to download and install new IPA
5. No re-jailbreaking or additional signing required

### Analytics
Track app usage via:
- Server logs: `/var/log/nginx/wise2.net-access.log`
- Download count: Count IPA file accesses
- Crash reports: Integrate with Sentry or Rollbar (optional)

## Troubleshooting

### Issue: IPA fails to install via AltStore
**Solution**: 
1. Verify IPA signature: `codesign -d -v ~/path/to/Blakkhail.ipa`
2. Check provisioning profile is current
3. Ensure App ID matches bundle identifier in code

### Issue: altstore-apps.json returns 404
**Solution**:
1. Verify file is in `/var/www/wise2.net/apps/`
2. Check file permissions: `chmod 644 altstore-apps.json`
3. Restart nginx: `sudo systemctl restart nginx`

### Issue: Download URL returns wrong content-type
**Solution**:
1. Add IPA MIME type to nginx config:
   ```
   types {
       application/octet-stream ipa;
   }
   ```
2. Restart nginx

## References

- [AltStore Documentation](https://altstore.io/docs/)
- [AltStore Source Format](https://altstore.io/docs/guides/source/)
- [Apple App Distribution Guide](https://developer.apple.com/documentation/xcode/distributing_your_app_for_beta_testing)
- [SenCere Deployment Infrastructure](https://wise2.net)

---

**Deployed by**: Claude Haiku 4.5  
**Deployment Date**: 2026-09-24  
**Status**: READY FOR PRODUCTION
