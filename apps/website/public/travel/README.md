# WISE² Travel Assets

This directory contains visual assets for the WISE² Travel landing page.

## Expected Assets

When the WISE2_Travel_Visual_Assets.zip is extracted, place the following files here:

### Hero & Background Images
- `hero-web.jpg` - Web-optimized hero background (from 06_WISE2_Travel_Hero_Web.jpg)
- `hero-full.jpg` - Full-resolution hero image (from 07_WISE2_Travel_Hero_Full.jpg)
- `four-heroes.png` - Character reference image (from 04_WISE2_Travel_Four_Heroes.png)

### Concept & Reference
- `concept.png` - Design system reference (from 02_WISE2_Travel_Concept.png)
- `dashboard.png` - UI reference (from 05_WISE2_Travel_Dashboard.png)

## Image Optimization

For production, ensure images are:
- Compressed and optimized for web
- WEBP format where supported
- Responsive sizes for mobile/tablet/desktop

## Integration Points

### Character Cards (Hero Section)
Current implementation uses initials (DW, DR, PG, CJ).
When four-heroes.png is available, update:
- `/app/travel/page.tsx` hero card rendering
- Use Next.js Image component with `four-heroes.png`
- Consider responsive image layout for mobile

### Hero Background
Current hero uses Unsplash fallback gradient + unsplash image.
When hero-web.jpg is ready:
- Replace backgroundImage in hero section
- Ensure proper gradient overlay remains
- Test on mobile for performance

## Deployment Status

- ✅ Travel page structure: Complete
- ✅ Responsive design: Implemented
- ⏳ Visual assets: Awaiting WISE2_Travel_Visual_Assets.zip
- ✅ Navigation: Fully functional
- ✅ Search/booking interface: Live
- ✅ AI Trip Planner CTA: Connected to mailto
- ✅ Partner showcase: Active
- ✅ Affiliate disclosure: Present

## Next Steps

1. Extract WISE2_Travel_Visual_Assets.zip
2. Copy optimized images to this directory
3. Update page.tsx to use local image assets
4. Test on all breakpoints (mobile, tablet, desktop)
5. Redeploy website service
6. Verify at https://wise2.net/travel
