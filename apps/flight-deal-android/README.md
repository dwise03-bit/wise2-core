# WISE² Flight Deal Hunter Android

Android MVP inside wise2-core.

## Product rules
- Search multiple origin and destination airports in one request.
- Compare total trip cost, not misleading teaser/from fares.
- A fare is VERIFIED only when returned for the exact route/date/passenger query with availability.
- Never claim a fare is booked; BOOK hands off to provider checkout.
- Default NYC preset: GSO/RDU/CLT → LGA/JFK/EWR.
- Planned: baggage normalization, flexible dates, price history, Discord/push alerts, provider adapters.

## Backend contract
`GET /api/v1/flights/search?origins=GSO,RDU,CLT&destinations=LGA,JFK,EWR&date=YYYY-MM-DD&adults=1`

The provider adapter must supply exact-query inventory and provider booking URLs. Do not scrape or hardcode teaser fares.
