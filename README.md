# Ms. Feather Pop Word Quest

Mobile-first Next.js MVP for the Ms. Feather Pop Word Quest web app.

Target production domain: `https://play.msfeatherpop.com`

## Current MVP

- Branded welcome screen using the supplied product logo and Ms. Feather Pop portraits.
- Player pass form collecting child name, age group, parent name, parent email, optional event code, and supervision consent.
- QR scanner route with camera support and manual code fallback.
- Sample challenge pages with letter reveal, word builder, hints, validation, and FeatherPop wallet updates.
- Rewards page with unlock state based on the player wallet.
- Printable parent QR pack using live quest URLs.
- Static admin shell for challenges and rewards, ready to connect to Supabase Auth and database tables.
- Intro video placeholder for the future toon/video asset.

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful demo routes:

- `/scan`
- `/quest/book`
- `/print`
- `/wallet`
- `/admin`

## Verification

```bash
npm run lint
npm run build
```

Both commands currently pass.

## Next Implementation Steps

1. Add Supabase project settings and database schema.
2. Replace local-storage player progress with Supabase-backed sessions.
3. Protect `/admin` with Supabase Auth.
4. Add CRUD forms for QR challenges and reward tiers.
5. Drop in final intro video and voice-over clips when the media files are ready.
6. Deploy to Vercel and map `play.msfeatherpop.com`.
