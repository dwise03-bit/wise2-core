# WISE² Website Troubleshooting Guide

Having issues with the new WISE² website? This guide helps you solve common problems.

---

## Common Issues & Solutions

### "I still see the old design"

This is the most common issue. Your browser has cached the old website.

#### Quick Fix: Hard Refresh

**Windows:**
- Chrome, Edge, Firefox: Press `Ctrl + F5`
- Or: Press `Ctrl + Shift + Delete` to open cache clearing

**Mac:**
- Chrome, Safari, Firefox: Press `Cmd + Shift + R`
- Or: Press `Cmd + Shift + Delete` to open cache clearing

**All browsers:**
- Incognito/Private mode: Open new incognito tab, visit https://wise2.net
  - Private mode bypasses all caches by default

#### Advanced: Clear All Browser Data

**Chrome & Edge:**
1. Click menu (three dots) → Settings
2. Click "Privacy and security" → "Clear browsing data"
3. Select "All time"
4. Check: Cookies, Cached images and files
5. Click "Clear data"
6. Refresh the page

**Firefox:**
1. Menu (three lines) → Settings
2. Click "Privacy & Security"
3. Under "Cookies and Site Data" → "Clear Data"
4. Check all options
5. Click "Clear"
6. Refresh the page

**Safari:**
1. Menu → Settings → Privacy
2. Click "Manage Website Data"
3. Find "wise2.net" → Click "Remove"
4. Safari menu → "Clear History"
5. Select "All history" → Click "Clear History"
6. Refresh the page

### "The page loads but elements are missing"

The page partially loaded but some components didn't render.

**Try these:**
1. **Wait and refresh:** Sometimes content takes a moment to load—refresh after 5 seconds
2. **Hard refresh:** Use the hard refresh steps above (`Ctrl+F5` or `Cmd+Shift+R`)
3. **Check internet:** Make sure you have stable internet connection
4. **Disable extensions:** Browser extensions can block content—try disabling them
5. **Try different browser:** Test in a different browser to confirm if it's browser-specific

### "The site is loading slowly"

The page takes too long to appear.

**Immediate steps:**
- Wait a full 10 seconds (initial load can be slower)
- Check your internet speed (try speedtest.net)
- Try refreshing

**If still slow:**
1. Open browser DevTools (`F12` or `Cmd+Option+I` on Mac)
2. Go to "Network" tab
3. Refresh the page
4. Look for red lines (failed requests) or times over 5 seconds
5. Screenshot any slow items and report them

**Common fixes:**
- Disable browser extensions (they can slow things down)
- Close other browser tabs
- Restart your browser
- Try a different network (WiFi vs cellular data)

### "Forms or buttons don't work"

Interactive elements aren't responding when you click them.

**Try these:**
1. **Hard refresh:** Clear cache and reload
2. **Wait for page load:** Make sure the page fully loaded before clicking
3. **Check JavaScript:** Open DevTools (`F12`), go to Console tab
   - Look for red error messages
   - If you see errors, take a screenshot and report
4. **Disable extensions:** Some extensions block JavaScript
5. **Try different browser:** See if the issue is browser-specific
6. **Disable VPN:** If you're using a VPN, try turning it off

### "Mobile version looks wrong"

The site doesn't display properly on your phone or tablet.

**Try these:**
1. **Rotate screen:** Turn phone sideways if in portrait
2. **Refresh:** Pull down to refresh (mobile) or `Cmd+R` (Mac) / `F5` (Windows)
3. **Close other apps:** Some phones need memory—close other apps first
4. **Update browser:** Make sure your mobile browser is up to date
5. **Zoom out:** Pinch to zoom out if content is too large
6. **Try different browser:** Try Chrome, Safari, Firefox to see if specific to one browser

### "The intake form isn't submitting"

You filled out the form but it won't send.

**Try these:**
1. **Fill all required fields:** Make sure every field is complete
2. **Check for red errors:** The form shows which fields are invalid in red
3. **Refresh and retry:** Close the page and come back
4. **Clear browser data:** Follow cache clearing steps above
5. **Use email instead:** If form still fails, email your project details to support

**What happens after submission:**
- You should see a "Thank you" message
- You'll get a confirmation email within 5 minutes
- Our team will review and contact you within 24 hours

### "Images aren't loading"

You see broken image icons instead of pictures.

**Try these:**
1. **Refresh:** Simple refresh often fixes temporary issues
2. **Hard refresh:** Use `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check internet:** Make sure you have working internet
4. **Wait:** Sometimes images take a moment to load—wait 10 seconds
5. **Try different network:** Try WiFi instead of data or vice versa

### "I get an error page (404, 500, etc.)"

You see an error code instead of the website.

| Error | Meaning | What to do |
|-------|---------|-----------|
| **404** | Page not found | Check the URL spelling, try homepage at https://wise2.net |
| **500** | Server error | Wait 5 minutes and refresh—server may be updating |
| **503** | Service unavailable | Server is temporarily down—wait and try again |
| **Connection refused** | Can't reach server | Check your internet, try incognito mode |

**For any error:**
1. Wait 5 minutes (server may be updating)
2. Refresh the page
3. Try incognito/private mode
4. Try different browser
5. Check your internet connection
6. Report the error with the code to support

---

## Performance & Optimization

### The site is still slow even after refreshing

**Check these:**

1. **Your internet speed:**
   - Visit https://speedtest.net
   - If under 5 Mbps, that's your bottleneck
   - Try connecting to a faster WiFi

2. **Browser performance:**
   - Open DevTools (`F12`)
   - Go to "Lighthouse" tab
   - Click "Generate report"
   - Look at the scores—anything under 70 means issues

3. **Too many browser tabs:**
   - Close unused tabs (they use memory)
   - Close background apps
   - Restart browser

4. **Browser extensions:**
   - Disable all extensions
   - Refresh the page
   - If faster, re-enable extensions one by one to find the culprit

5. **Outdated browser:**
   - Update your browser to the latest version
   - Clear cache after updating

### Mobile is slow

**For phones:**
1. **Close other apps** taking memory
2. **Restart your phone** (fixes most issues)
3. **Update your browser** app
4. **Try WiFi** instead of cellular data
5. **Zoom out** a bit if page feels sluggish

---

## Still Having Issues?

If none of these steps work:

### Provide Details When Reporting

Include these when you report a problem:

1. **What were you trying to do?** (e.g., "visit homepage", "submit intake form")
2. **What happened?** (e.g., "page didn't load", "button didn't work")
3. **Your browser:** Chrome/Firefox/Safari/Edge + version
4. **Your device:** Windows/Mac/iPhone/Android
5. **Screenshot:** Take a screenshot of the error
6. **What you tried:** Which steps above did you already attempt?

### How to Report an Issue

**Email:** support@wise2.net  
**Subject:** "WISE² Website Issue - [Brief description]"

**In the email include:**
- Steps to reproduce the issue
- Screenshot of the problem
- Your browser and device
- When it started (always, sometimes, after clicking X)

**Example:**
> Subject: Project gallery images not loading
> 
> When I visit the projects page and click "all projects", the images don't load—I see broken image icons instead. This happens on Chrome on my Mac. I've tried refreshing and hard refreshing but nothing works. Screenshot attached.

### Chat or Call

For urgent issues:
- **Slack:** #website-support channel
- **Call:** Available during business hours
- **Live chat:** (Coming soon) On website footer

---

## Tips to Prevent Issues

### Keep Things Running Smoothly

1. **Update your browser regularly** (monthly or more often)
2. **Clear cache monthly** (helps with outdated data)
3. **Restart browser weekly** (resets memory)
4. **Use latest OS** (security + compatibility)
5. **Disable unnecessary extensions** (they slow you down)
6. **Keep antivirus updated** (blocks malware)
7. **Use stable internet** (avoid public WiFi for sensitive forms)

### Best Practices

- **Don't fill long forms on slow internet** (use WiFi)
- **Use incognito mode** when troubleshooting (bypasses caches)
- **Test in different browsers** (helps narrow down issues)
- **Report problems immediately** (we can fix faster)
- **Check back after an hour** (we may fix server issues)

---

## Technical Info (For Nerds)

### Site Details

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS + custom glassmorphism effects
- **Server:** Custom Docker deployment
- **Location:** USA (East Coast)
- **CDN:** Cloudflare (caching edge nodes worldwide)

### Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| iOS Safari | 14+ | ✅ Mobile optimized |
| Chrome Android | 90+ | ✅ Mobile optimized |

**Older browsers:** The site may not display correctly on Internet Explorer, old Android browsers, or outdated Safari versions.

### Network Debugging

If you're technically savvy, here's what to check:

1. **DevTools Network tab:**
   - Look for failed requests (red)
   - Check response times (>5s is slow)
   - Verify status codes (200 is good, 404/500 is bad)

2. **Console errors:**
   - Press `F12`
   - Go to "Console" tab
   - Look for red error messages
   - Screenshot and share with technical support

3. **Check DNS:**
   ```bash
   nslookup wise2.net
   # Should return IP address 173.208.147.165
   ```

4. **Test connectivity:**
   ```bash
   ping wise2.net
   # Should get responses (not timeout)
   ```

---

## FAQ

**Q: Why do I need to clear my cache?**  
A: Browsers save old website files to load faster. After updates, old files cause conflicts. Clearing cache forces your browser to download the latest version.

**Q: Is my data safe?**  
A: Yes. We use HTTPS (secure connection) and follow security best practices. Check the lock icon in your address bar.

**Q: How long does the form submission take?**  
A: Usually instant—you see the thank you message right away. Confirmation email arrives within 5 minutes.

**Q: What's "hard refresh"?**  
A: It forces your browser to download fresh copies of all files instead of using cached versions. Use `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac).

**Q: Can I use my phone to fill out the form?**  
A: Absolutely! The form is optimized for mobile. Use landscape mode if needed for easier typing.

**Q: What if I submitted the form twice by accident?**  
A: No problem—we'll notice duplicates and follow up just once.

---

## Getting Help

**Before contacting support:**
- [ ] Tried hard refresh (Ctrl+F5 or Cmd+Shift+R)
- [ ] Cleared cache/cookies
- [ ] Tried incognito/private mode
- [ ] Tried different browser
- [ ] Checked your internet connection
- [ ] Waited at least 5 minutes

**Then contact support with:**
- [ ] Description of what happened
- [ ] Screenshot of the issue
- [ ] Your browser and device
- [ ] Steps you already tried

**Support contacts:**
- Email: support@wise2.net
- Slack: #website-support
- Website: https://wise2.net (footer has contact options)

---

**Last updated:** July 19, 2026  
**Questions?** Email support@wise2.net or visit the website footer for more options.
