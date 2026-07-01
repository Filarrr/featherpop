 # Stripe go-live runbook

The app's code is ready. To turn on live payments you need to set **4
environment variables in Vercel** and create **2 things in Stripe** (a price
and a webhook). ~10 minutes.

> ⚠️ **Security:** the live secret key (`sk_live_…`) was shared in a chat.
> After this setup works, **roll it**: Stripe → Developers → API keys →
> "Roll key" on the secret key, then update `STRIPE_SECRET_KEY` in Vercel with
> the new value. Never paste a secret key into chat, code, or git again.
> (The publishable key `pk_live_…` is not secret and isn't even used by this
> app — it uses Stripe Checkout redirect, so you can ignore it.)

---

## 1) Create the $9.99/month price in Stripe

**Dashboard way:** Stripe → **Products** → **Add product**
- Name: `Ms. Feather Pop Membership`
- Price: **9.99**, **Recurring**, **Monthly**, currency **USD**
- Save, then open the price and copy its **API ID** — it looks like
  `price_1AbC…`.

**Or one command** (run it yourself so the key stays on your side — replace
`SK` with the secret key):
```bash
curl https://api.stripe.com/v1/prices \
  -u SK: \
  -d unit_amount=999 \
  -d currency=usd \
  -d "recurring[interval]=month" \
  -d "product_data[name]=Ms. Feather Pop Membership"
```
The response's `"id": "price_…"` is your price ID.

## 2) Create the webhook in Stripe

Stripe → **Developers** → **Webhooks** → **Add endpoint**
- **Endpoint URL:** `https://play.msfeatherpop.com/api/stripe/webhook`
  (use the app's real live URL once the domain is pointed — see the client
  handoff)
- **Events to send** — select these:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
- Save, then click **Reveal** on the **Signing secret** — it looks like
  `whsec_…`.

## 3) Set the environment variables in Vercel

Vercel → your project → **Settings → Environment Variables** (Production).
Add these four, then **Redeploy**:

| Name | Value |
| --- | --- |
| `STRIPE_SECRET_KEY` | the `sk_live_…` secret key (roll it after — see above) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | the `price_…` from step 1 |
| `STRIPE_WEBHOOK_SECRET` | the `whsec_…` from step 2 |
| `NEXT_PUBLIC_APP_URL` | `https://play.msfeatherpop.com` (the live URL) |

> These already exist in the code — you're just filling in the values.
> Clerk keys and `OWNER_EMAILS` are already set up.

## 4) Test it

1. On the live site, sign in and go to **/membership** → **Subscribe**.
2. Complete Stripe Checkout (use a real card, or a Stripe **test** card only if
   you're on test keys). It's $9.99 live, so a small real charge — you can
   refund it in Stripe afterward.
3. You should land back on **/account** showing **Active**.
4. In Stripe → Webhooks → your endpoint, confirm recent deliveries are
   **200 OK**. If they fail, the `STRIPE_WEBHOOK_SECRET` is wrong.

That's it — memberships are live. 🎉

---

### Notes
- No free trial: billing starts immediately on checkout (per the current
  spec). If you want the 3-day trial back, tell us — it's a one-line change.
- Currency is set to **USD** above to match the "$9.99" shown in the app. If
  your Stripe account should charge a different currency, change it in step 1
  and tell us so the label matches.
