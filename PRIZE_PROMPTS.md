# Ms. Feather Pop — Prize Wall AI Image Prompts

Copy any prompt below into **Midjourney v6**, **Flux.1 [schnell]**
(free at huggingface.co/spaces/black-forest-labs/FLUX.1-schnell),
**DALL-E 3** (ChatGPT Plus), or **Leonardo AI** (150 free credits/day).
Each prompt is tuned to produce a centered, transparent-ready product
render in the Ms. Feather Pop brand style.

Save the result to the exact filename shown — the code uses it
automatically (the inline SVG fallback disappears the moment the PNG
lands).

## File layout

```
public/media/rewards/
  sticker.png         <- Feather Sticker         (Bronze)
  bookmark.png        <- Quest Bookmark          (Silver)
  patch.png           <- Word Champion Patch     (Gold)
  glitter-badge.png   <- Glitter Feather Badge   (Diamond / Members)
  gold-frame.png      <- Gold Avatar Frame       (Diamond / Members)
```

## Brand palette (paste into every prompt)

`#6a2dff` deep purple · `#b13bff` magenta · `#ff2d8e` pink · `#ffd14a`
gold · `#ffb24a` warm orange · `#7cd1ff` sky · `#34e3a4` mint.

## Workflow

1. Copy a prompt into the AI tool of choice.
2. Generate 3–4 variants, pick the best.
3. If the AI puts text on the product where you don't want it, add
   `--no text, watermark, logo, signature, label` to the Midjourney
   tail or "no text or watermarks" to the natural-language version.
4. Drop into Photopea (free, browser) → Magic Wand on the background
   → Delete → Save as PNG. Or use remove.bg (50 free/month).
5. Save to `public/media/rewards/<id>.png` with the exact filename.
6. Commit + push — the swap is automatic.

---

## 1. `sticker.png` — Feather Sticker (Bronze)

**Style:** Holographic vinyl die-cut sticker. Magical, glittery,
maximalist.

### v1 — Centered hero shot (preferred)

```
A single round holographic vinyl sticker, perfectly centered in the
frame, top-down 3/4 view, photoreal macro studio photography. The
sticker has a wavy scalloped die-cut edge and is lying flat on a
sunlit warm wooden park bench with visible grain. The sticker face
shows ONE large magical gold feather standing perfectly upright and
centered, with finely detailed barbs, glowing soft halo. The
background of the sticker is a swirling iridescent rainbow gradient
(magenta #b13bff, pink #ff2d8e, sky blue #7cd1ff, gold #ffd14a, deep
purple #6a2dff) speckled with tiny twinkling stars. The sticker
surface catches the light with rainbow holographic reflections. A
small corner of the white paper backing is peeling up at the
bottom-right. Soft directional sunlight from upper-left, warm cast
shadow falling lower-right onto the wood. Disney-Pixar children's
storybook craft style, ultra detailed, premium product photography,
4K, square framing. No text, no watermark, no logo, no signature.
--ar 1:1 --style raw --q 2
```

### v2 — If v1 puts text on the sticker

```
Same as v1 but without ANY text or letters on the sticker face — the
entire face is just the gold feather over the holographic rainbow
swirl with stars. No words, no captions, no labels, no engravings.
--ar 1:1 --style raw --no text, words, letters, watermark, logo
```

---

## 2. `bookmark.png` — Quest Bookmark (Silver)

**Style:** Premium printed paper bookmark, slightly aged, magical.

### v1 — Standing portrait

```
A premium printed paper bookmark photographed standing upright,
propped against a small stack of three children's storybooks with
colorful spines, soft natural window light from the left, gentle
shadow on the cream tabletop. The bookmark itself fills the central
2/3 of the frame, viewed dead-on with a tiny tilt. Its body is a
smooth vertical gradient from deep purple #6a2dff at the top through
magenta #b13bff to hot pink #ff2d8e at the bottom. Across the top of
the bookmark, a polished gold engraved title bar reads "FEATHER
QUEST" in a bold rounded sans-serif font (kid-friendly), gold leaf
finish with subtle embossing. The center of the bookmark shows ONE
large illustrated magical golden feather glowing softly, hand-drawn
storybook style, with iridescent shimmer along the barbs. Below the
feather, three small embossed stars in a row. A circular hole
punched at the very top of the bookmark with a woven gold-and-pink
tassel hanging through it. A small curled corner at the bottom edge
suggests the bookmark is well-loved. The bookmark has a classic
V-shaped notch cut into the bottom. Premium product photography,
photoreal, ultra detailed, 4K. No watermark. --ar 4:5 --style raw
--q 2
```

### v2 — Top-down flat lay variation

```
Same bookmark from v1 but laid flat on a soft cream linen surface
photographed from directly above, top-down, evenly lit, gentle
shadow. Two open children's storybook pages partially visible in
the corners. Same gold title bar, same magical feather, same gold
tassel arranged across the top edge. --ar 4:5 --style raw
```

---

## 3. `patch.png` — Word Champion Patch (Gold)

**Style:** Embroidered iron-on patch, premium scout-merit-badge feel.

### v1 — On a denim jacket sleeve (preferred — gives context)

```
A close-up macro photograph of an embroidered iron-on circular patch
sewn onto the upper sleeve of an indigo denim jacket, viewed at a
slight 3/4 angle so the embroidery's raised texture catches the
light. The patch is perfectly centered in the frame and dominates
60% of it. The patch has a thick raised gold embroidered outer rim,
a dashed cream-white embroidered stitch ring just inside, and a
saturated hot-pink-to-deep-purple gradient embroidered inner field
(#ff2d8e to #6a2dff). Across the middle of the patch, a flat gold
ribbon banner curves gently, with the word "CHAMPION" embroidered in
bold gold-thread serif letters across it. Four small embroidered
gold five-point stars sit at the four diagonal corners inside the
ring. Visible stitching around the outer edge of the patch where
it attaches to the denim, fraying slightly. Soft directional studio
light from upper-left, subtle drop shadow. Premium craft product
photography, photoreal, ultra detailed, 4K. --ar 1:1 --style raw
--q 2
```

### v2 — Isolated on cream linen (cleaner cutout)

```
Same embroidered patch design from v1 but isolated, laid flat on a
plain cream linen surface, top-down, photographed for a product
catalog, soft even lighting, gentle shadow. --ar 1:1 --style raw
```

---

## 4. `glitter-badge.png` — Glitter Feather Badge (Diamond / Members)

**Style:** Luxury enamel pin, jewelry-grade, glittery, regal.

### v1 — On a velvet jewelry pad (preferred)

```
A luxury sparkling enamel pin in the shape of a magical feather
crowned by a small ornate gold royal crown at the top of the
feather, displayed centered on a black velvet jewelry display pad,
top-down 3/4 view, dramatic jeweler's studio lighting. The feather
body is filled with iridescent purple-to-pink glitter enamel that
catches the light with sparkles — embedded fine glitter visible
across the surface, color shifts between magenta #b13bff, hot pink
#ff2d8e, deep purple #6a2dff. Polished antique-gold metal trim
outlines every edge of the feather. The crown on top has tiny ruby
red and amethyst purple gems set in the gold prongs. Two trailing
pink-to-purple gradient ribbon tails extend down from the bottom
of the feather, with rolled embroidered edges. Soft directional
spotlight from upper-left creates a gentle highlight on the gold
trim and a deep shadow on the velvet. Premium members-only luxury
children's collectible, jewelry-catalog product photography,
photoreal, macro detail, 4K. No text on the pin. --ar 1:1 --style
raw --q 2 --no text, logo, watermark
```

### v2 — Floating, alternate background

```
Same enamel pin design but floating against a dreamy soft-focus
gradient background of deep purple #6a2dff fading to hot pink #ff2d8e,
tiny gold sparkle particles drifting in the background, gentle
drop shadow below the pin. --ar 1:1 --style raw
```

---

## 5. `gold-frame.png` — Gold Avatar Frame (Diamond / Members)

**Style:** Ornate baroque heirloom picture frame.

### v1 — Front-on portrait against velvet (preferred)

```
An ornate circular gold picture frame with detailed baroque
leaf-and-laurel ornaments arranged symmetrically around the outside
rim (eight ornaments at the cardinal and inter-cardinal positions),
viewed straight-on dead center, displayed against a deep velvet
purple #6a2dff background with soft directional side lighting that
catches the metal. Inside the frame is a soft inner window with a
gradient from pale pink #ffd6f0 in the upper-left to magenta #b13bff
in the lower-right — empty, no portrait inside. At the very bottom
of the frame, a small engraved gold banner reads "★ MEMBER ★" in
elegant serif lettering with two five-point stars flanking the word.
The frame's metal has an antique-gold polished finish with subtle
verdigris and wear in the ornament crevices to suggest age.
Dramatic studio lighting, premium jewelry-catalog product
photography, photoreal, ultra detailed, 4K. --ar 1:1 --style raw
--q 2 --no watermark, signature
```

### v2 — Tilted angle for shelf-display feel

```
Same baroque gold frame from v1 but rotated about 8 degrees,
displayed on a velvet shelf in a private heirloom collection, soft
warm overhead lighting, small dust particles visible in the light
beam. --ar 1:1 --style raw
```

---

## Quick reference: which model for which prize

| Prize          | Recommended    | Why                                                   |
| -------------- | -------------- | ----------------------------------------------------- |
| sticker        | Flux / MJ v6   | Both nail holographic gradients                       |
| bookmark       | MJ v6          | Best for clean text rendering ("FEATHER QUEST")       |
| patch          | MJ v6          | Embroidery texture / raised thread is MJ's strength   |
| glitter-badge  | Flux / MJ v6   | Sparkle particles + enamel glitter — either works     |
| gold-frame     | MJ v6          | Baroque ornament detail benefits from MJ's training   |

## After a few PNGs are in

Tell me **"prize assets are in"** in chat. I'll do a polish pass:

- A small ribbon "NEW!" on the most recently unlocked prize
- Soft drop shadows beneath each PNG so they sit properly on the card
- Tighter art masking so the rounded tier-ring frames the product
  edge, not the AI's white background
- An optional "open the box" animation that scales the PNG in from
  small to full size when the child first lands on the page

## If something looks off

- **Feather isn't centered** (your sticker has this): add `feather
  perfectly centered in frame, dead-center composition, no off-screen
  cropping` to the prompt
- **Background isn't a clean color**: add `isolated on a pure white
  background, no other objects, no distractions`
- **Tiny text appears where you didn't want it**: append `--no text,
  letters, words, watermark, logo, signature` to MJ, or "no text or
  watermarks anywhere in the image" to a natural-language prompt
- **AI added a notch or cropped the edge weirdly**: add `complete,
  uncropped, full product visible, no cutoffs at frame edges`
