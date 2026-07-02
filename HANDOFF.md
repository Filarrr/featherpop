# Ms. Feather Pop — Technical Handoff

Everything a developer or operator needs to run, deploy, and maintain the
Ms. Feather Pop web app. Pair this with the two audience-specific docs:
- **[CLIENT_HANDOFF.md](CLIENT_HANDOFF.md)** — plain-language note for the client.
- **[STRIPE_SETUP.md](STRIPE_SETUP.md)** — turning on live payments.

---

## 1. What it is
A bright literacy + adventure web app for kids (ages ~3–11). Three linked
games — **Feather Match** (sort), **Park Hunt** (scan real-world QR stations),
**Letter Pop** (spell words) — plus eggs, rewards, story/music, and a paid
membership. Mobile-first, installable-feeling PWA-style experience.

## 2. Where everything lives

| Thing | Location |
| --- | --- |
| Source code | GitHub: `Starboymunir/featherpop` (branch `main`) |
| Hosting / CI | Vercel (auto-deploys every push to `main`) |
| Live URL | set via `NEXT_PUBLIC_APP_URL` (target: `play.msfeatherpop.com`) |
| Main website | `msfeatherpop.com` (Wix) — app runs on a subdomain |
| Auth | Clerk (dashboard.clerk.com) |
| Payments | Stripe (dashboard.stripe.com) |
| Database | **None** — state lives in Clerk user metadata (see §8) |

## 3. Tech stack
- **Next.js 16.2.6** (App Router). ⚠️ This is a newer Next than most docs
  assume — see `AGENTS.md`. Notably it uses **`src/proxy.ts`**/`middleware.ts`
  conventions and the bundled docs in `node_modules/next/dist/docs/` are the
  source of truth.
- **React 19.2.4** with the React Compiler enabled.
- **Clerk 7** (`@clerk/nextjs`) for auth + user metadata storage.
- **Stripe** subscriptions (Checkout + webhook).
- **Tailwind CSS 4** + a large hand-written `src/app/globals.css`.
- Misc: `@dnd-kit` (drag-sort), `@zxing/browser` (QR scan), `qrcode.react`
  (QR print), `an-array-of-english-words` (dictionary), `lucide-react` (icons).
- **Node 20+** (developed on Node 24). No database, no Redis.

## 4. Repo layout
```
src/
  app/            # routes (App Router). Notable: /admin, /park-hunt, /scan,
                  # /sort, /play, /rewards, /membership, /api/stripe/*
  components/     # UI + game components (admin/, eggs/, park-hunt/, sort/, …)
  lib/            # server actions + domain logic
    owner.ts               # OWNER_EMAILS gate (who can see /admin)
    membership.ts          # read Stripe membership from Clerk metadata
    stripe.ts              # Stripe client + price label
    global-content*.ts     # owner-editable words / rewards / videos / songs
    park-hunt*.ts          # station model + hunt flow
    play-limits*.ts        # free-tier 3-plays/day gating
    child-*.ts             # per-child progress (feathers, eggs, etc.)
public/media/     # images, audio, coloring pages, avatars
scripts/build-dict.mjs     # regenerates the word dictionary
```

## 5. Run locally
```bash
# prerequisites: Node 20+ and npm
npm install
cp .env.example .env.local      # then fill in the values (see §6)
npm run dev                     # http://localhost:3000
```
Build / lint:
```bash
npm run build      # production build (also the pre-push sanity check)
npm run lint
```
> Use **Clerk + Stripe *test* keys** locally. Only Vercel Production should
> hold live keys.

## 6. Environment variables
Set these in **Vercel → Settings → Environment Variables** (and `.env.local`
for dev). `NEXT_PUBLIC_*` are exposed to the browser; the rest are server-only.

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public base URL. Used for QR codes + Stripe redirects. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/account` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…` in prod) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Price ID of the $9.99/mo plan |
| `OWNER_EMAILS` | Comma-separated owner emails (admin access). Defaults to `theanglroom@gmail.com`. |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Legacy password gate — unused by the current owner-email admin; safe to ignore. |

## 7. Deployment
- Push to **`main`** → Vercel builds and deploys automatically.
- No migrations, no build secrets beyond the env vars above.
- If a build fails on fonts in a restricted network, that's environmental;
  Vercel has network access and builds fine.

## 8. Data model (no database)
All persistent state is stored in **Clerk user metadata**:
- **Membership** → `publicMetadata.membership` on each user, written by the
  Stripe webhook (`/api/stripe/webhook`). Read by `lib/membership.ts`.
- **Per-child progress** (feathers, eggs, words, daily play counts) →
  `privateMetadata.childProgress[childId]`.
- **Child profiles** → `privateMetadata` on the parent's account.
- **Global content** (Park Hunt word bank, rewards, videos, songs) and the
  **VIP mailing list** → stored on the **owner account's** metadata, so one
  edit applies to every family. See `lib/global-content.ts` and
  `lib/mailing-list.ts`.

Park Hunt station word lists are **deterministic from the week** (no storage) —
they rotate every Monday automatically.

## 9. Third-party setup
**Clerk** — auth is already configured. The owner logs in with an email in
`OWNER_EMAILS`. If password login is needed for an inbox-less admin address,
enable Password in Clerk → User & Authentication.

**Stripe** — follow **[STRIPE_SETUP.md](STRIPE_SETUP.md)**: create the
$9.99/mo price, add the 4 env vars, and create a webhook to
`/api/stripe/webhook` for events `checkout.session.completed` and
`customer.subscription.created|updated|deleted|trial_will_end`.

## 10. Owner / admin guide
Sign in with an `OWNER_EMAILS` account → you're routed straight to **`/admin`**
(owners never create a child). From there:
- **Print station QRs** (`/print/park-hunt-qrs`) — print the 5 QR signs.
- **Park Hunt words** (`/admin/park-hunt`) — edit the weekly word bank.
- **Rewards** (`/admin/rewards`) — add/edit prizes.
- **Videos & Songs** (`/admin/media`) — paste TikTok/YouTube links kids see on
  Story Time / Music.
- **VIP wishlist** — Premium interest signups, with Copy/CSV export.
- Family + progress overview across all accounts.

## 11. Pricing & gating (current rules)
- **Free:** play each game up to **3×/day**; browse prizes (can't claim).
- **Membership $9.99/mo:** unlimited play, claim rewards, unlimited Park Hunt.
- **Premium $23.99/mo (Coming Soon):** meet & greet, photos, live events,
  prizes — interest list only, not yet chargeable.
- Enforced in `lib/play-limits.ts` (per-game daily caps) and
  `claimRewardAction` (rewards require membership). No free trial currently.

## 12. Common tasks (cheat sheet)
| I want to… | Do this |
| --- | --- |
| Change the price | Update the Stripe price + `NEXT_PUBLIC_STRIPE_PRICE_ID`; label in `lib/stripe.ts` |
| Add a new owner | Add their email to `OWNER_EMAILS` in Vercel, redeploy |
| Change Park Hunt words | `/admin/park-hunt` |
| Add videos/songs | `/admin/media` |
| Reprint QR codes | You don't need to — words rotate behind the same QR. Print once from `/admin`. |
| Regenerate the dictionary | `node scripts/build-dict.mjs` |
| Add the 3-day free trial back | one-line change in `/api/stripe/checkout/route.ts` |

## 13. Known caveats
- **Next 16 is non-standard** — always check `node_modules/next/dist/docs/`
  before using an API from memory (see `AGENTS.md`).
- **No database** by design; if usage grows, migrating global content and
  progress to a real DB (e.g. Postgres/Supabase) is the natural next step.
- **Video watch-tracking** is honor-system (daily +5 bonus) — TikTok/YouTube
  can't report real watch completion.

## 14. Security
- **Roll the Stripe secret key** — it was shared in chat during setup. Stripe →
  Developers → API keys → roll, then update `STRIPE_SECRET_KEY` in Vercel.
- Never commit `.env*` files (they're git-ignored) or paste secrets in chat.
- Secrets live only in Vercel env vars.

## 15. Related docs in this repo
- `CLIENT_HANDOFF.md` — client-facing summary + their to-dos.
- `STRIPE_SETUP.md` — go-live payment runbook.
- `AGENTS.md` / `CLAUDE.md` — Next 16 working notes for AI/dev assistants.
- `README.md` — original Next.js scaffold readme.
