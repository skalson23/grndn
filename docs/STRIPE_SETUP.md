# Stripe setup for GRNDN

Payments are **fully implemented** but **disabled by default** during beta via `ENABLE_PAYMENTS=false`.

## Environment variables

Add to `.env.local` (and Vercel project settings):

```env
# Beta: keep false — all payment checks are bypassed
ENABLE_PAYMENTS=false

# Stripe (test mode keys during development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription price IDs from Stripe Dashboard → Products
STRIPE_PRICE_ID_MONTHLY=price_...   # $9.99 / month
STRIPE_PRICE_ID_QUARTERLY=price_... # $25.99 every 3 months
# Optional legacy alias for monthly
STRIPE_PRICE_ID=price_...

# Optional: admin endpoint to grandfather beta users when payments are enabled
BILLING_ADMIN_SECRET=your-long-random-secret
```

| Variable | Required when | Description |
|----------|---------------|-------------|
| `ENABLE_PAYMENTS` | Always | `false` = beta bypass (default). `true` = enforce subscriptions |
| `STRIPE_SECRET_KEY` | Payments enabled | Server-side Stripe API key |
| `STRIPE_PUBLISHABLE_KEY` | Future client use | Publishable key (reserved for Elements) |
| `STRIPE_WEBHOOK_SECRET` | Webhooks | Signing secret from Stripe webhook endpoint |
| `STRIPE_PRICE_ID_MONTHLY` | Checkout | Recurring price ID — Pro Monthly ($9.99/mo) |
| `STRIPE_PRICE_ID_QUARTERLY` | Checkout | Recurring price ID — Pro Quarterly ($25.99/3mo) |
| `STRIPE_PRICE_ID` | Checkout | Optional legacy alias for monthly price |
| `BILLING_ADMIN_SECRET` | Admin grant | Protects `POST /api/billing/grant-beta` |

## Database migration

Run in Supabase SQL Editor (or via CLI):

```bash
# File: supabase/migrations/20250530120000_user_subscriptions.sql
```

Creates `public.user_subscriptions` with:

- `billing_status`: `beta` | `active` | `cancelled` | `expired`
- `stripe_customer_id`, `stripe_subscription_id`
- `is_beta_grandfathered` for closed-beta users

## Stripe test mode configuration

1. Create a [Stripe account](https://dashboard.stripe.com/register) and stay in **Test mode**.
2. **Products** → Create product “GRNDN Pro” with two recurring prices:
   - **Monthly:** $9.99/month → `STRIPE_PRICE_ID_MONTHLY`
   - **Quarterly:** $25.99 every 3 months → `STRIPE_PRICE_ID_QUARTERLY`
3. Copy each **Price ID** to the matching env var.
4. **Developers** → **API keys** → copy test secret + publishable keys.
5. **Developers** → **Webhooks** → Add endpoint:
   - **Local:** use [Stripe CLI](#local-webhook-forwarding)
   - **Production:** `https://grndn.app/api/stripe/webhook`
6. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`.

### Local webhook forwarding

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the webhook signing secret printed by `stripe listen` as `STRIPE_WEBHOOK_SECRET` locally.

### Test cards

| Scenario | Card number |
|----------|-------------|
| Success | `4242 4242 4242 4242` |
| Decline | `4000 0000 0000 0002` |

Use any future expiry, any CVC, any postal code.

## Architecture

| Route | Purpose |
|-------|---------|
| `POST /api/stripe/checkout` | Creates Checkout Session + Stripe Customer |
| `GET /api/stripe/checkout/verify` | Verifies success redirect + activates subscription |
| `POST /api/stripe/portal` | Billing portal for manage/cancel |
| `POST /api/stripe/webhook` | Syncs subscription state to Supabase |
| `GET /api/billing/status` | Current access + subscription row |
| `POST /api/billing/grant-beta` | Admin: mark user as beta grandfathered |

| Page | Purpose |
|------|---------|
| `/[locale]/pricing` | Pricing UI (not linked from nav yet) |
| `/[locale]/billing/success` | Post-checkout success |
| `/[locale]/billing/cancel` | Checkout cancelled |

## Access logic

### `ENABLE_PAYMENTS=false` (current beta)

- All payment checks skipped
- Beta access code works exactly as today (localStorage + cookie)
- No paywall, no checkout requirement
- Middleware premium guard is inactive

### `ENABLE_PAYMENTS=true`

Access granted if **any** of:

1. Beta access cookie (`grndn_closed_beta_access=true`) — set when valid beta code entered
2. `user_subscriptions.billing_status = 'beta'` or `is_beta_grandfathered = true`
3. `user_subscriptions.billing_status = 'active'`

Protected when enabled:

- Pages: `/results`, `/my-programs` (middleware)
- API: `POST /api/workout-plan` (403 without access)

Unauthenticated users with beta cookie can still generate plans (cookie sent with fetch).

## Grandfather beta users (when payments enabled)

When a user signs in after entering a beta code, auth callback syncs their account to `billing_status=beta`.

Manual admin grant:

```bash
curl -X POST https://grndn.app/api/billing/grant-beta \
  -H "Authorization: Bearer $BILLING_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<supabase-user-uuid>","email":"user@example.com"}'
```

## Enabling payments in production

1. Run migration `20250530120000_user_subscriptions.sql`
2. Create live Stripe product + price
3. Set live API keys and webhook endpoint on production URL
4. Set `ENABLE_PAYMENTS=true`
5. Verify beta cookie + grandfathered users retain access
6. Test checkout → success → `/results` flow

## Billing portal

Stripe Dashboard → **Settings** → **Billing** → **Customer portal** → Enable cancellation and payment method updates.

Users with an active Stripe customer can open the portal via `POST /api/stripe/portal` (wire to UI when ready).
