# Black Hail Store — Owner Handoff

## Live system

- Storefront: https://blackhail.store
- Brand: Blakk Hail
- Business: SenCere Creative LLC
- Product route pattern: `/products/{slug}`
- Checkout: Stripe-hosted Checkout

## Owner setup required

1. Create or confirm the Stripe account that will receive payments.
2. Add production values to the server environment (never commit them):
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `DATABASE_URL=...`
3. Register the Stripe webhook endpoint:
   - `https://blackhail.store/api/webhooks/stripe`
   - Enable successful checkout/payment events used by the shared billing backend.
4. Confirm fulfillment details: shipping rates, tax jurisdiction, return policy, and support email.
5. Transfer registrar/DNS, Stripe ownership, repository access, and server credentials to the owner.

## Operational notes

- Product pricing is validated server-side from the catalog before a Stripe session is created.
- Customer cart state is currently browser session storage.
- Orders become operationally trackable after the production Stripe webhook and database credentials are configured.
- Test with a Stripe test key before switching to live keys.

## Deployment

From the repository root on the production server:

```bash
bash scripts/deploy-blackhail-store.sh
```
