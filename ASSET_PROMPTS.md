c# Ms. Feather Pop — AI Asset Prompt Pack

Copy-paste these prompts into **ChatGPT (GPT-4o image generation)** or DALL-E 3.
For best Ms. Feather Pop likeness, **upload one of her actual portrait photos**
(e.g. `public/media/hero-portrait-1.jpeg`) as a reference image with the
prompt — ChatGPT will respect it.

---

## 0. How to use this pack

1. Open ChatGPT, switch to a model with image generation (GPT-4o).
2. **Pin the Style Bible** at the top of a new chat (Section 1 below). Tell
   ChatGPT: *"Remember this style bible. Apply it to every image I ask for
   in this thread."*
3. For Ms. Feather Pop prompts → upload her real photo first, then send the
   prompt.
4. For each generated image, ask for a **transparent PNG download**. Save
   to the file path noted under each prompt.
5. Where you see `<pose>` in the file path, the app auto-loads it. No code
   changes needed.

> **Sizes:** Use 1024×1024 for portraits/characters. Use 1792×1024 (landscape)
> for scenes/backgrounds. Always request *transparent background* for
> characters; *full bleed* for scenes.

---

## 1. Style Bible (paste at the start of every chat)

```
STYLE BIBLE — apply to every image in this thread:

Art style: A vibrant 2D cartoon illustration in a modern children's app
style — friendly like Cocomelon, with the bold confident linework of
Disney's Encanto and the soft cel-shading of a Pixar short. Slightly
chibi-stylized proportions (big head, expressive features). No realism,
no AI photo look — keep it clearly illustrated.

Linework: Bold dark outlines (1.5-2x weight on silhouettes, thinner on
inner details). Smooth, confident, never sketchy.

Color palette (must use these brand colors): magenta pink #ff2d8e,
royal purple #6a2dff, sky cyan #4cc4ff, sunshine gold #ffd14a, mint
green #34e3a4, soft cream #fff7e6, deep ink #1a0f3a. Saturated and joyful,
never washed out.

Faces: Large almond eyes with sparkle highlights, long lashes, rosy
cheek blush, big confident smiles unless the pose calls for another
expression.

Lighting: Soft top-down light, gentle cel-shading, optional bloom on
sparkles. No harsh shadows.

Output: Transparent PNG background unless I explicitly ask for a scene.
Centered subject with at least 10% padding around the figure. 1024×1024
unless I say otherwise. No text, no watermarks, no signature.
```

---

## 2. Ms. Feather Pop — character sheet (the headline asset)

**Upload her real photo first**, then send:

```
Using the uploaded photo as the likeness reference, design a cartoon
mascot version of "Ms. Feather Pop" in the style bible above.

CHARACTER LOCK (always keep these traits across every Ms. Feather Pop
image I ask for):
- Joyful Black woman, warm medium-deep brown skin.
- Hair: straight with full thick bangs, falling just past the
  shoulders, dark base with DRAMATIC neon-blue and magenta-pink
  streaks woven throughout — the streaks are her signature.
- Face: large almond eyes with long curled lashes, full smile showing
  white teeth, soft rounded cheeks with subtle pink blush, small gold
  hoop or stud earrings.
- Outfit: classic denim pinafore / overalls dress with visible stitching
  and a buckle at the chest, over a simple white or cream top.
- WINGS: enormous fluffy angel wings, predominantly white with bold
  pink, magenta, and sky-blue accent feathers throughout — these are
  her hallmark and must be visible in every full-body shot.
- Vibe: part fairy godmother, part rockstar teacher, warm and
  approachable — never scary, never sultry, never overly mature.

DELIVERABLE — Character turnaround sheet:
On a single transparent canvas, present SIX full-body poses of Ms.
Feather Pop in a 3×2 grid. Each pose is labeled with a small caption
in playful sans-serif:

  1. IDLE   — standing, hands relaxed, gentle smile.
  2. WAVE   — one hand raised mid-wave, big welcoming grin.
  3. CHEER  — both arms thrown up in the air, eyes squinting with
              joy, mouth open mid-cheer.
  4. THINK  — finger to chin, eyes glancing up, curious half-smile.
  5. HINT   — pointing forward with an index finger, eyes wide and
              encouraging, holding a tiny glowing feather.
  6. OOPS   — slight cringe, one hand on cheek, kind apologetic
              smile (no sadness — still warm).

Each pose ~1024×1024 with full body and wings visible. Transparent
background. Consistent face, hair, outfit, and wing palette across all
six poses.
```

**Save the 6 cropped poses as:**
```
public/media/avatars/feather-pop-idle.png
public/media/avatars/feather-pop-wave.png
public/media/avatars/feather-pop-cheer.png
public/media/avatars/feather-pop-think.png
public/media/avatars/feather-pop-hint.png
public/media/avatars/feather-pop-oops.png
```

> The app already probes these paths. As soon as the PNG is in the folder,
> the inline-SVG fallback disappears and your real avatar shows.

### 2a. Bonus pose for big wins

```
Same Ms. Feather Pop character lock as above. Pose: WOW — flying mid-
air with both wings flared dramatically wide, holding a giant golden
"FeatherPop" coin above her head, mouth open in a delighted "OOO!",
gold sparkles trailing behind her. Transparent PNG, 1024×1024, centered.
```
**Save:** `public/media/avatars/feather-pop-wow.png`

### 2b. Talking-head close-up (for the mascot bubble)

```
Tight head-and-shoulders portrait of Ms. Feather Pop (same character
lock). Looking directly at the viewer, big warm grin, eyes sparkling.
Hair fills the frame with its blue-and-magenta streaks. Subtle wing
tips visible behind shoulders. Transparent PNG, 1024×1024 square,
centered.
```
**Save:** `public/media/avatars/feather-pop-head.png`

### 2c. Talking mouth sprites (for true lip-sync)

```
Same Ms. Feather Pop head-and-shoulders portrait. Generate FOUR
identical portraits in a 2×2 grid that differ ONLY in mouth shape — the
rest of the face must be pixel-stable:
  1. Mouth closed, neutral smile.
  2. Mouth slightly open (vowel "ee" / "i").
  3. Mouth open mid-wide (vowel "ah" / "a").
  4. Mouth open round (vowel "oh" / "u").
Same head angle, same eye direction, same hair, same lighting. Each
panel 512×512, transparent background. Crop margins identical.
```
**Save:** `public/media/avatars/feather-pop-mouth-1.png` … `feather-pop-mouth-4.png`

> With these four mouth sprites I can wire true syllable-driven lip
> sync (cycling 1→2→3→4 while she speaks) instead of the simple
> open/close I have now. Tell me when they exist.

---

## 3. Kid avatar roster (6 diverse kids, 5 poses each)

The app uses 6 named kids: **Ari, Bee, Kai, Lila, Mo, Zara**. Each gets a
single multi-pose sheet.

### 3.1 Universal kid prompt (template)

For each kid below, send this template, swapping the bracketed bits:

```
Style bible above. Generate a 5-pose character sheet for a single child
mascot named "[NAME]" in a chibi cartoon kid style:
- Age 6-8, big head proportions, joyful expression.
- Skin tone: [SKIN].
- Hair: [HAIR DESCRIPTION].
- Outfit: bright [SHIRT COLOR] T-shirt with a fun graphic, sturdy
  comfortable shorts/leggings in a darker complementary tone, sneakers.
- Personality cue: [PERSONALITY].

On one transparent canvas, present 5 full-body poses in a 5×1 row,
each ~512 wide × 768 tall. Same character, same outfit, same colors
throughout. Each pose labeled in playful sans-serif:

  1. IDLE  — standing, friendly resting smile.
  2. WAVE  — hand raised, mid-wave grin.
  3. CHEER — both arms up, jumping with joy, mouth open laughing.
  4. READ  — sitting cross-legged holding an open colorful storybook,
             eyes focused on the page, soft happy smile.
  5. JUMP  — mid-jump, both feet off the ground, arms thrown up,
             confetti dots around them.

Transparent background. No scenery. Keep all 5 poses pixel-consistent
in face, outfit, and palette.
```

### 3.2 The roster (paste the template, swap these)

**Ari** — `[SKIN]`: light-tan; `[HAIR]`: long dark-brown ponytail with side-swept bangs and a magenta-pink scrunchie; `[SHIRT COLOR]`: hot pink; `[PERSONALITY]`: enthusiastic show-off, big toothy grin

**Bee** — `[SKIN]`: deep brown; `[HAIR]`: short black natural curls in a puff, two tiny gold beaded clips; `[SHIRT COLOR]`: mint green; `[PERSONALITY]`: curious and quietly delighted, small upturned smile

**Kai** — `[SKIN]`: medium tan; `[HAIR]`: short tousled jet-black with a streak of purple on one side; `[SHIRT COLOR]`: sky cyan; `[PERSONALITY]`: chill skater-kid, easy half-smile

**Lila** — `[SKIN]`: fair peach; `[HAIR]`: long lavender-purple hair in two braided pigtails with golden ribbons; `[SHIRT COLOR]`: sunshine gold; `[PERSONALITY]`: bubbly sparkle-lover, eyes wide with wonder

**Mo** — `[SKIN]`: warm brown; `[HAIR]`: low fade with short coily curls on top, a tiny gold hoop earring; `[SHIRT COLOR]`: royal purple; `[PERSONALITY]`: confident leader, dimpled grin

**Zara** — `[SKIN]`: deep brown; `[HAIR]`: long box braids past her shoulders, a few wrapped in pink and blue thread, sparkly hair beads; `[SHIRT COLOR]`: bubblegum pink; `[PERSONALITY]`: playful diva, hand-on-hip pose energy

**Save each pose as:**
```
public/media/avatars/kid-<name>-<pose>.png
e.g. kid-ari-cheer.png, kid-bee-read.png, kid-zara-jump.png …
```

### 3.3 Group hero shot (optional but recommended)

```
Style bible above. All six kids — Ari, Bee, Kai, Lila, Mo, Zara — and
Ms. Feather Pop floating slightly above them with wings spread,
arranged in a wide cheerful group portrait. They are all mid-cheer,
arms up, laughing together. Confetti and floating glitter letters
(A, B, C, ★) drift through the air. Soft sunny outdoor park
background with a hint of a playground in the distance. 1792×1024
landscape. Full bleed (no transparent background here — paint the
scene). Bright joyful palette using the brand colors.
```
**Save:** `public/media/scenes/group-cheer.png`

---

## 4. Celebration / reward visuals

### 4.1 Big-win reward burst

```
Style bible above. A celebratory reward illustration with NO character
— pure prop composition:
- Large golden FeatherPop coin in the center, embossed with a stylized
  feather icon and the letters "FP".
- Streamers, confetti pieces, and stars exploding outward from the
  coin in the brand palette.
- A glowing magenta-to-cyan radial halo behind the coin.
- Tiny floating letters (random A, B, C, R, T, K) scattered through
  the burst.
Transparent PNG, 1024×1024, centered, with the burst extending almost
to the edges.
```
**Save:** `public/media/scenes/reward-burst.png`

### 4.2 Animated reward GIF (optional)

ChatGPT can't generate GIFs directly. Two routes:

- **Route A** — Generate 6-8 frame variants of the burst above (smaller
  → bigger → fade out), then upload all frames to **ezgif.com → "Animated
  GIF Maker"** at ~120ms per frame.
- **Route B** — Use **Runway / Pika / Sora** with this prompt:
  > *A short 2-second looping animation: a giant golden FeatherPop coin
  > with embossed feather icon pops out from the center as multicolored
  > confetti, stars, and tiny letter tiles explode outward in a radial
  > burst. Magenta-and-cyan glow halo pulses behind it. Children's app
  > illustration style, vibrant brand colors (magenta pink, royal purple,
  > sky cyan, sunshine gold). Transparent background.*

**Save:** `public/media/scenes/reward-burst.gif`

### 4.3 Trophy moment

```
Style bible above. A chunky cartoon golden trophy with a tall handle on
each side, engraved with a feather icon and a star. Floating slightly
off the ground inside a magenta-to-purple glow ring, with confetti pieces
and 3-4 sparkle stars around it. Transparent PNG, 1024×1024.
```
**Save:** `public/media/scenes/trophy.png`

### 4.4 Confetti pieces (sprite sheet for animation)

```
Style bible above. A sprite sheet on one transparent canvas: 12 small
confetti pieces in different shapes — rectangles, ribbons, stars,
spirals, hearts, dots — in the brand palette. Each piece roughly
80×120px, arranged on a 4×3 grid with gaps. Transparent background.
```
**Save:** `public/media/scenes/confetti-sprites.png`

---

## 5. Quest zone backgrounds (6 zones)

These are scenes — full bleed 1792×1024, not transparent.

```
Style bible above. A full-bleed background scene illustration for a
kids' word-quest game zone called "[ZONE NAME]". [DESCRIPTION]. No
characters in the scene — leave a clear focal area in the center-left
where a character will be composited later. Bright daytime lighting,
brand color palette, soft fluffy clouds where applicable. 1792×1024
landscape, no text.
```

Swap `[ZONE NAME]` and `[DESCRIPTION]` per zone:

| Zone | Description |
|---|---|
| **Feather Forest** | A whimsical pastel forest with tall purple-and-pink trees, oversized soft white feathers drifting through the air, glowing magenta mushrooms, and a sun-dappled path winding through. |
| **Sky Stage** | A floating cloud platform with a rainbow arching overhead, sparkly stars, and shimmering hot-air balloons in pink/cyan/gold drifting at different heights against a bright sky-blue gradient. |
| **Adventure Trail** | A friendly hilltop trail with a winding dirt path, cute flat-topped mountains in the distance, scattered wildflowers, and a small wooden directional signpost shaped like a feather. |
| **Pop Park** | A sunny playground/park with a colorful slide, swings, scattered balloons floating up, neat green grass, and a small cartoon fountain spurting cyan water in the background. |
| **Star Stage** | A magical night-meets-twilight scene with a velvet purple sky, an enormous low golden moon, falling glitter stars, and a sparkly stage platform front-and-center. |
| **Reading Nest** | A cozy indoor nook with a giant cushion, an oversized open storybook, fairy lights strung overhead, plush feather pillows in the brand palette, and warm golden light. |

**Save:**
```
public/media/scenes/zone-feather-forest.png
public/media/scenes/zone-sky-stage.png
public/media/scenes/zone-adventure-trail.png
public/media/scenes/zone-pop-park.png
public/media/scenes/zone-star-stage.png
public/media/scenes/zone-reading-nest.png
```

---

## 6. UI iconography

### 6.1 FeatherPop coin (single icon)

```
Style bible above. A single iconic "FeatherPop" currency coin: a chunky
3/4-view golden coin with a glossy bevelled edge, embossed with a
stylized feather and the letters "FP" in playful bold sans-serif.
Subtle pink sparkle highlight. Transparent PNG, 512×512, centered.
```
**Save:** `public/media/ui/coin.png`

### 6.2 Achievement badges (5 tiers)

```
Style bible above. A row of FIVE collectible achievement badges in a
single transparent canvas. Each badge is shield-shaped with a fluffy
feather laurel wreath around it, a stylized number, and a ribbon banner
below labeled with its title:
  1. "FIRST WORD"  — bronze, small star.
  2. "FIVE WORDS"  — silver, three stars.
  3. "WORD HUNTER" — gold, feather + magnifying-glass icon.
  4. "WORD CHAMP"  — magenta-and-gold, crown icon.
  5. "WORD LEGEND" — rainbow-shimmer, glowing trophy icon.
Each badge ~512×600. Transparent background, 5×1 grid layout.
```
**Save:** `public/media/ui/badges.png` (then slice the row, or generate one badge per prompt)

### 6.3 Alphabet letter tiles (sticker style)

```
Style bible above. A sticker-style display of all 26 uppercase English
letters A-Z on one transparent canvas. Each letter is a chunky 3D
puffy tile, randomly colored from the brand palette (magenta, purple,
cyan, gold, mint, pink), with a soft drop shadow and a glossy
highlight. Letters arranged in a 6-wide grid, evenly spaced.
Transparent background. 2048×2048.
```
**Save:** `public/media/ui/alphabet-tiles.png`

### 6.4 QR-scan illustration (for the scan page)

```
Style bible above. A friendly illustration of a smartphone held up,
with a QR code visible on a card in the foreground. Sparkles and
floating letters pour out of the QR code toward the phone screen.
No characters. Cartoon style, transparent PNG, 1024×1024.
```
**Save:** `public/media/ui/scan-illo.png`

---

## 7. Looping micro-animations (Lottie route)

ChatGPT can't make Lottie files directly. The fastest free route:

1. Go to **lottiefiles.com** and search free animations:
   - "kid cheer", "kid wave", "happy kid", "child clap"
   - "confetti", "trophy", "sparkle burst"
   - "talking", "celebration"
2. Download the JSON file.
3. Drop into `public/lottie/` with names matching what the app expects:
   - `public/lottie/feather-pop-idle.json`
   - `public/lottie/feather-pop-cheer.json`
   - `public/lottie/kid-cheer.json`
   - `public/lottie/confetti-burst.json`
4. The app already auto-loads from this path (see `LottieAvatar.tsx`)
   and uses the PNG / SVG fallbacks otherwise.

If you want a **custom Lottie of Ms. Feather Pop herself**, the route is:

1. Send the character-sheet PNG from Section 2 to a designer on Fiverr
   ("rig and animate this character in Lottie/After Effects") — typical
   cost $30-$80 per anim.
2. Or rig the PNG yourself in **Adobe Character Animator** (face-tracks
   your webcam onto the cartoon and exports a video — much closer to
   the "physical video → toon" workflow she mentioned).

---

## 8. Talking-avatar video (the "physical video → toon" route)

For the intro video where you want her real face animated as the toon:

- **D-ID.com** — Upload Ms. Feather Pop's cartoon portrait + a script;
  it generates a talking-head video with lip-sync. ~$5-15/mo plan,
  10-min trial free.
- **HeyGen.com** — Same idea, slightly higher quality, ~$24/mo.
- **Animaker / Adobe Character Animator** — DIY rigged toon driven by
  your face/voice.

Workflow for the intro:
1. Generate `feather-pop-head.png` (Section 2b) in ChatGPT.
2. Upload to D-ID.
3. Type her welcome script ("Hi Word Explorers! I'm Ms. Feather Pop…").
4. Download the .mp4.
5. Save to `public/media/intro.mp4` — the intro page already auto-detects
   and plays it.

---

## 9. Quick checklist — minimum viable asset set

If you can only generate 8 images, do these first (in order):

- [ ] `feather-pop-wave.png`   (Section 2)
- [ ] `feather-pop-cheer.png`  (Section 2)
- [ ] `feather-pop-hint.png`   (Section 2)
- [ ] `feather-pop-head.png`   (Section 2b — for the mascot bubble)
- [ ] `kid-ari-cheer.png`      (Section 3)
- [ ] `kid-bee-cheer.png`      (Section 3)
- [ ] `kid-zara-cheer.png`     (Section 3)
- [ ] `reward-burst.png`       (Section 4.1)

These 8 alone will make the app feel like a completely different
product. The rest is polish on top.

---

## 10. File-path summary (where each asset goes)

```
public/
├── lottie/                                  ← Lottie JSON animations
│   ├── feather-pop-idle.json
│   ├── feather-pop-cheer.json
│   ├── kid-cheer.json
│   └── confetti-burst.json
│
└── media/
    ├── avatars/                             ← Character PNG/GIFs
    │   ├── feather-pop-idle.png
    │   ├── feather-pop-wave.png
    │   ├── feather-pop-cheer.png
    │   ├── feather-pop-think.png
    │   ├── feather-pop-hint.png
    │   ├── feather-pop-oops.png
    │   ├── feather-pop-wow.png
    │   ├── feather-pop-head.png
    │   ├── feather-pop-mouth-1..4.png
    │   ├── kid-ari-idle.png ... kid-ari-jump.png
    │   ├── kid-bee-* ... kid-zara-*
    │   └── (kid-<name>-<pose>.png convention)
    │
    ├── scenes/                              ← Scene illustrations
    │   ├── group-cheer.png
    │   ├── reward-burst.png
    │   ├── reward-burst.gif
    │   ├── trophy.png
    │   ├── confetti-sprites.png
    │   └── zone-<name>.png
    │
    ├── ui/                                  ← UI icons
    │   ├── coin.png
    │   ├── badges.png
    │   ├── alphabet-tiles.png
    │   └── scan-illo.png
    │
    ├── intro.mp4                            ← Talking-toon intro
    └── intros/                              ← Per-quest toons
        ├── feather.mp4
        ├── rainbow.mp4
        └── ...
```

The app's avatar/mascot components already probe these paths in this
order: **Lottie JSON → animated GIF → PNG → inline SVG fallback**. So
the moment you drop a file in, the upgrade is live — no code changes
required from me.

---

## 11. After you have the assets — ping me

Once you have a batch of PNGs in `public/media/avatars/`, tell me
*"the assets are in"* and I'll:

1. Wire mouth-sprite cycling for true lip-sync (if you generated 2c).
2. Swap the static reward-burst illustration in over the SVG one.
3. Use the zone background scenes behind each quest header.
4. Lay the kid PNGs into the existing animated containers (so they
   wave / jump / cheer — the keyframe animation already exists, the
   PNG just rides on top).

---

# Prize Wall art (v1.5 — drives subscriptions)

The Prize Wall page ships with rich inline SVG illustrations for every
prize so it looks premium on day one. Generating real PNG renderings
and dropping them into `public/media/rewards/<id>.png` swaps the
matching SVG out automatically — same fallback pattern as every other
asset.

## Brand bible

Reuse for every prompt:

> A premium kid-friendly product render in the Ms. Feather Pop brand
> palette (#6a2dff purple, #b13bff magenta, #ff2d8e pink, #ffd14a gold,
> #34e3a4 mint). Top-down 3/4 view, soft studio lighting, gentle
> shadow on a creamy off-white background, painterly storybook style
> with Disney-Pixar finish, ultra detailed, 4K. Isolated on a pure
> white background. --ar 1:1 --style raw

## Per-prize prompts

Match the filename to the `id` field in `defaultRewards` (see
`src/lib/game-data.ts`). Save into `public/media/rewards/<id>.png`.

### `sticker.png` — Feather Sticker (Bronze)

> Add to brand bible: a single circular holographic vinyl sticker
> with a die-cut wavy edge, lying on a wooden park bench. The face
> of the sticker shows a single magical glowing gold feather inside
> a swirling holographic rainbow background. The sticker reflects
> rainbow light on its surface. A small piece of the backing paper
> visible at the edge. Cute children's craft style, photoreal.

### `bookmark.png` — Quest Bookmark (Silver)

> Add to brand bible: a printed paper bookmark, slightly curled at
> the corners, standing upright on a stack of children's storybooks.
> The bookmark has a purple-to-pink gradient background, a gold
> "FEATHER QUEST" title bar at top, a big gold magical feather
> illustration in the middle, and a small gold tassel hanging from a
> hole punched at the top. Storybook style, photoreal.

### `patch.png` — Word Champion Patch (Gold)

> Add to brand bible: an embroidered iron-on circle patch sewn onto
> a denim jacket sleeve, viewed close-up at a slight angle. The
> patch has gold embroidered outer rim, pink-to-purple gradient
> inner field with embroidered stars at the four diagonals, and a
> gold ribbon banner across the middle that reads "CHAMPION" in bold
> embroidered letters. The denim background has visible stitching
> around the patch edge. Premium craft style, photoreal.

### `glitter-badge.png` — Glitter Feather Badge (Diamond / Members)

> Add to brand bible: a sparkling enamel pin in the shape of a
> magical feather with a gold royal crown on top, displayed on a
> jewelry pad. The feather glints with iridescent purple-pink
> glitter, the crown has tiny ruby and amethyst gems set in it, and
> two trailing pink-purple ribbon tails extend from the bottom.
> The pin has a polished gold metal trim. Members-only luxury
> children's collectible. Photoreal.

### `gold-frame.png` — Gold Avatar Frame (Diamond / Members)

> Add to brand bible: an ornate gold circular picture frame with
> baroque leaf and laurel ornaments around the outside, viewed
> straight-on, displayed against a velvet purple background. Inside
> the frame a soft purple-pink gradient window. At the bottom of the
> frame a small banner says "★ MEMBER ★" in elegant gold lettering.
> Royal heirloom aesthetic, photoreal.

## Folder layout

Drop the generated PNGs here — code already references them:

```
public/media/rewards/
  sticker.png
  bookmark.png
  patch.png
  glitter-badge.png
  gold-frame.png
```

Each file is optional — if missing, the inline SVG illustration
renders instead. Add prizes one at a time, no full-batch required.

## After generating

Tell me **"prize assets are in"** and I'll do a polish pass on the
Prize Wall: tighter shadows under each tile, a "new!" ribbon on the
most recently unlocked prize, and a "next is members-only" upsell
moment when a free-tier kid is close to running out of free prizes.
