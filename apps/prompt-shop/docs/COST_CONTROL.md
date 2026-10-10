# Generation cost control

## Images: local-first, no per-image API fee

WISE TOUCH connects to an AUTOMATIC1111-compatible Stable Diffusion API through `LOCAL_IMAGE_API_URL`. Generated PNG files are stored in the persistent `generated_images` Docker volume and served from `/generated`.

For the NVIDIA P1000 4GB target, use a Stable Diffusion 1.5-class checkpoint and start the image service with its API and low-memory options. The website defaults to one image, 18 steps, and conservative dimensions. This avoids provider usage charges, but server electricity, storage, and administration are not literally free.

The image service should remain private to the VPS. Only the WISE TOUCH backend should reach it.

The `/image-studio` website screen supports text-to-image and direct photo upload for PNG, JPEG, and WebP files up to 10MB. Uploaded bytes are sent only to the private local `img2img` endpoint. Clicking a WISE TOUCH treatment immediately applies that System's prompt, displays the completed image on the same page, saves the PNG to the persistent generated-image volume, and adds its metadata to My Builds.

Every generation stores its clean original under the private `clean/` volume directory. Free delivery receives only a separate server-rendered PNG with the official W² signature repeated faintly across the composition and emphasized in the lower-right corner. Paid delivery uses an authenticated `/api/image/generations/:id/clean` route that checks both active entitlement and file ownership. A free response never contains the clean route.

Pro uses hosted Stripe subscription Checkout configured with `STRIPE_PRO_PRICE_ID`; the frontend cannot submit or replace the price. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_URL` must also be present before enrollment appears. Send Stripe webhooks to `/api/billing/webhook`. The route verifies the Stripe signature against the unparsed request body, then activates or revokes entitlement for checkout completion, paid/failed invoices, and subscription changes. Active customers manage cancellation and payment methods through a short-lived Stripe customer-portal link. Until all billing variables are configured, free watermarked delivery remains the safe default and no charge can occur.

## Videos: lowest configured cost

Video remains external because the P1000 is not appropriate for modern video inference. Each configured adapter supplies operator-maintained pricing metadata. Selecting `Auto · Lowest configured cost` makes the backend choose the cheapest configured adapter with a valid estimate at submission time.

`REPLICATE_VIDEO_COST_PER_SECOND_USD` must be checked against the official price for the exact configured model. The website does not hard-code a vendor rate because provider prices and billing units change. Every request also carries a maximum-spend limit; the backend rejects an estimate above that limit before contacting the provider.

Add future adapters with their current price metadata, then let the registry compare estimates. Production billing reconciliation should record actual provider cost after completion.

The production build includes real asynchronous adapters for Replicate and fal.ai. fal uses the durable queue flow (submit, status, result) and keeps `FAL_KEY` on the backend. Set either `FAL_VIDEO_COST_PER_SECOND_USD` or `FAL_VIDEO_FLAT_COST_USD` for the exact `FAL_VIDEO_MODEL`. Recheck the model's official pricing whenever that model changes.
