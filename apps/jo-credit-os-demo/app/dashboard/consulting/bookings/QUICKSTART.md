# Admin Bookings Dashboard - Quick Start

Get up and running with the admin bookings view in 5 minutes.

## Access the Dashboard

Navigate to your application dashboard:

```
http://localhost:3000/dashboard/consulting/bookings
```

## Default View

The page loads with:
- **Calendar view** showing the current month
- **Revenue report cards** at the top
- Mock booking data for testing

## Quick Actions

### View All Bookings in Calendar
1. Calendar automatically loads with current month
2. Bookings appear as color-coded time slots
3. Each color represents a different consultant
4. Click any booking to see details

### Switch to List View
1. Click the "List" button in the top right
2. See all bookings in a searchable table
3. Use filters to narrow down results

### Find a Specific Booking
1. Switch to list view
2. Enter search term (name, email, consultant)
3. Or use status/consultant dropdowns
4. Or select date range

### Update Booking Status
1. Click any booking (calendar or list view)
2. Detail modal opens
3. Click one of the status buttons:
   - **Mark Confirmed** (blue)
   - **Mark Completed** (emerald)
   - **Mark No Show** (red)
   - **Cancel** (gray)
4. Status updates immediately

### Export Bookings to CSV
1. Switch to list view
2. Apply any filters you want (optional)
3. Click "Export CSV" button
4. CSV file downloads with filtered results

### View Revenue Report
1. Look at the 5 cards at the top:
   - Total Bookings
   - Confirmed (awaiting completion)
   - Completed
   - Total Revenue
   - Average Price

2. Scroll down to see "Revenue by Consultant" cards
3. Each consultant shows total revenue and completed booking count

## Filter Options (List View)

**Search Box**: Type to filter by:
- User name
- User email
- Consultant name

**Consultant Dropdown**: Select to show bookings for one consultant

**Status Dropdown**: Select to show bookings with specific status:
- Pending (yellow)
- Confirmed (blue)
- Completed (emerald)
- No Show (red)
- Cancelled (gray)

**Date Picker**: Select "from" date to filter bookings from that date onwards

Filters can be combined. For example:
- Show all confirmed bookings for consultant "Alex Morgan"
- Show all bookings from this month in no-show status
- Show all bookings matching search term "sarah"

## Booking Detail Modal

When you click a booking, a modal appears showing:

**Left side:**
- Client name and email
- Consultant name
- Service type
- Price

**Right side:**
- Service name
- Booking ID
- Date, time, duration
- Timezone
- Creation timestamp

**Bottom section:**
- Consultant notes (editable text area)
- Status update buttons

## Navigation

### Calendar Navigation
- Left/right arrows at top to go to previous/next month
- Click on any booking to open detail modal

### List Pagination
- Pagination buttons appear if 10+ bookings
- Click page numbers to navigate
- List shows 10 bookings per page

### Month/Year Display
Calendar shows current month at top. Use arrows to navigate:
- Left arrow: Previous month
- Right arrow: Next month

## Status Legend

Colors used throughout the dashboard:

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | Yellow | Awaiting confirmation |
| Confirmed | Blue | Confirmed, not yet completed |
| Completed | Emerald | Successfully completed |
| No Show | Red | Client didn't attend |
| Cancelled | Gray | Booking was cancelled |

## Consultant Colors

Each consultant is assigned a color in the calendar view:
- Colors are auto-assigned based on consultant
- Same consultant always has same color
- Makes it easy to spot consultant's bookings

## Revenue Cards Explained

**Total Bookings**: All bookings in system (any status)

**Confirmed**: Bookings marked as confirmed but not yet completed

**Completed**: Successfully completed bookings (counts toward revenue)

**Total Revenue**: Sum of all completed booking prices

**Average Price**: Total revenue divided by completed bookings

## CSV Export

The export includes these columns:
```
ID, User, Email, Consultant, Service, Date, Time, Status, Price
```

Exported file is named:
```
bookings-YYYY-MM-DD.csv
```

Current date in filename shows when export was created.

## Tips & Tricks

1. **Bulk view**: Export to CSV and use Excel/Sheets for analysis
2. **Quick navigation**: Use search filter to find a user quickly
3. **Status tracking**: Use status dropdown to see bottleneck (e.g., many pending)
4. **Revenue analysis**: Check "Revenue by Consultant" to see top performers
5. **Month view**: Calendar shows at a glance which days are busy

## Mock Data

The dashboard includes 6 sample bookings:

1. **Sarah Chen** - Alex Morgan - Confirmed - Today
2. **Michael Rodriguez** - Jordan Lee - Pending - Tomorrow
3. **Emma Watson** - Alex Morgan - Completed - 2 days ago
4. **James Park** - Casey Chen - No Show - 4 days ago
5. **Lisa Johnson** - Jordan Lee - Confirmed - In 2 days
6. **David Kim** - Alex Morgan - Completed - 1 week ago

Use these for testing all features.

## Troubleshooting

**Calendar not loading?**
- Check browser console for errors
- Verify API endpoint: `/api/admin/bookings`
- Ensure you have admin access

**Filters not working?**
- Try clearing all filters and re-applying one at a time
- Refresh page (Ctrl+R or Cmd+R)
- Check that filter date is in valid format

**CSV export blank?**
- Apply filters first to narrow down results
- Ensure there are bookings matching your filters
- Check browser download folder

**Status update not working?**
- Verify internet connection
- Check API endpoint: `/api/admin/bookings/[id]`
- Look for error message in modal

## Next Steps

1. **Test filtering**: Try each filter option
2. **Update statuses**: Practice marking bookings as completed
3. **Export data**: Create CSV file and view in spreadsheet
4. **Review revenue**: Analyze revenue by consultant
5. **Check calendar**: Navigate through months and view bookings

## Need Help?

See full documentation in `README.md` for:
- Complete feature list
- Data model details
- API endpoint specifications
- Advanced usage
- Implementation notes
- Future enhancements

## Demo Scenario

To test all features end-to-end:

1. **View Calendar**: See bookings spread across month
2. **Switch to List**: View all bookings in table
3. **Filter Results**: Search for "Sarah" to find Sarah Chen's booking
4. **View Details**: Click "View" to open booking detail modal
5. **Update Status**: Click "Mark Completed" to change status
6. **Export Data**: Click "Export CSV" to download filtered results
7. **Check Revenue**: Scroll to bottom to see "Revenue by Consultant" cards

This tests every major feature of the dashboard!
