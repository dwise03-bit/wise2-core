# Fergie's Table — App Store listing

Do not upload until the paid Apple Developer Program is active on team `9N5L62DHKJ`.

**Bundle ID:** `com.wise2.fergiestable`  
**Version:** 1.0.0 (build 1)  
**SKU:** `FERGIES-TABLE-IOS`  
**Primary category:** Food & Drink  
**Devices:** iPhone only

## URLs

| Field | Value |
| --- | --- |
| Privacy Policy | https://wise2.net/fergies-table/privacy |
| Support | https://wise2.net/fergies-table/support |
| Marketing | https://wise2.net/fergies-table |

## Listing copy

**Name:** Fergie's Table  
**Subtitle:** Catering command for chefs

**Description:**

Fergie's Table is Chef Fergie's command for a luxury catering house. Run the kitchen, hold the calendar, close leads, and keep the guest table in one place.

We cook. You connect.

• Command dashboard for revenue, tickets, and open leads
• Kitchen board: confirmed to completed
• Bookings and Chef's Table nights
• Quotes and payments
• Menu board with sold-out control
• Guest ordering and table requests

Powered by the WISE² Business Platform.

**Keywords:** catering,chef,kitchen,booking,restaurant,menu,quotes,private dining,atlanta,savory

**Promotional text:** Real Food. Real Love. Real Results. Run Fergie's Table from your phone.

## Age rating

Answer **No** to all age-rating questionnaires except:

- Alcohol, Tobacco, or Drug Use or References: **Infrequent/Mild** (catering copy mentions cocktail soirées; the app does not sell alcohol)

Expected rating: **4+** or **12+** if Apple weights the cocktail copy.

## App Privacy (App Store Connect)

- Data Not Collected
- Tracking: No
- Used for Tracking: No

## Review notes

This is a chef companion for Fergie's Table & Savôré, a home-based catering house in Atlanta. No login is required. Sample kitchen data is on-device so review can tap Command, Kitchen, Calendar, Leads, Quotes, and Payments. The live website is https://wise2.net/fergies-table. Contact: fergie@fergiestable.com

Demo account: none.

## Archive and upload

After membership is active:

```bash
cd apps/fergies-table
pnpm ios:icon
pnpm ios:archive
```

Then in Xcode: **Window → Organizer → Distribute App → App Store Connect**.

Or create the App Store Connect record first (New App → iOS → bundle `com.wise2.fergiestable`) and drag the IPA.
