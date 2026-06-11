# Ms. Feather Pop — AI Video Prompts

For animated clips that elevate key moments (the eagle dropping the
banner, the spider creeping in, the wing-flap loop). Paste into:

- **Sora 2** (best for character consistency + parchment unfurl)
- **Runway Gen-3 Alpha** (cinematic camera moves)
- **Pika 1.5** (free credits + fast iteration)
- **Kling AI** (long takes, free tier)

After generation: trim with [Clipchamp](https://app.clipchamp.com/) or
[Photopea Video](https://photopea.com), export as **MP4 (H.264, 30fps,
720p, transparent background where possible)**. Drop into
`public/media/sort/clips/` and tell me — I'll wire the playback.

---

## 1. `eagle-banner-reveal.mp4` — THE big moment (most important)

**Duration:** 5 seconds. **Format:** 1080×1920 portrait (or 1920×1080
landscape — both work, code handles either).

The bird visibly calls out **"Strudelay! Strudelay!"** twice during the
clip — the audio is added in-app via speechSynthesis (the app already
does the "Strudelay! Strudelay!" voice line), but the VIDEO needs to
make it OBVIOUS the bird is shouting. Two beats:

1. The bird's beak opens wide twice in dramatic sync with the call
2. A cartoon speech bubble pops out next to the beak with the word
   "STRUDELAY!" visible inside, then fades

### The prompt (with the speaking moment baked in)

```
A 5-second cinematic animated shot, 2D children's storybook style
with Disney-Pixar finish. A magical cartoon eagle bird with
iridescent purple-and-pink feathers (deep purple #6a2dff fading to
magenta #b13bff to hot pink #ff2d8e), gold-tipped wing tips, a big
shiny black eye with a small white highlight, and a friendly soft
smile, flies into frame from the lower-left along a graceful arc.
The bird carries a small rolled-up parchment scroll clutched in its
beak, held by a gold ribbon tie. The scroll is rolled tight,
parchment-cream color with visible gold ribbon ends fluttering.
Wings flap in slow character-animation style across the entire 5
seconds.

THE BIRD CALLS OUT TWICE:

At t=0.6s the bird tilts its head up, beak opens WIDE (drops the
scroll temporarily? no — keeps it firmly in the corner of its beak),
and a cartoon comic-book speech bubble POPS into existence floating
just to the right of the bird's beak. The speech bubble is a white
rounded cloud-shape with a clean gold border and a curved tail
pointing to the bird's beak. Inside the bubble, the word
"STRUDELAY!" appears in bold playful storybook lettering, deep purple
(#6a2dff) color, with a small exclamation mark. The bubble pops in
with a small spring (scale 0 → 1.1 → 1 over 0.2s) and bobs gently.
At t=1.4s the speech bubble fades out as the bird closes its beak.

At t=1.9s the bird calls out a SECOND TIME — beak opens wide again,
the SAME speech bubble (white rounded cloud, gold border, tail to
beak) pops back in with "STRUDELAY!" in the same purple lettering,
holds for 0.7s, then fades out by t=2.7s as the bird closes its beak.

Both times the bird's beak opens noticeably wide so it is OBVIOUS
the bird is shouting joyously, head tilted up slightly.

Background throughout: a magical purple-and-pink sunset sky over the
distant cliffs of a fantasy kingdom, soft pink clouds, a glowing
crescent moon, faint hilltop castles in lavender silhouette far
behind. Tiny gold glitter particles trail behind the bird's wing
tips.

At t=3.2s the bird slows, hovers in dead-center frame, and gently
releases the scroll from its beak. The scroll falls about 30 pixels
and unrolls open horizontally — the unrolling motion is satisfying
and bouncy, gold ribbons untying with a small spring. The unrolled
parchment now fills the center of the frame and is BLANK in the
middle (cream, with visible paper texture and frayed edges — DO NOT
write anything in the unrolled parchment, the word will be added
later in code). The bird continues hovering above the unrolled
scroll until t=5s, wings flapping. Tiny sparkle stars POP into
existence around the parchment in the final second.

End frame at t=5s: bird above, unrolled BLANK parchment below,
sparkles everywhere, no speech bubble visible.

Soft warm storybook lighting, gentle camera push-in 5% over the
duration. The ONLY text anywhere in the video is "STRUDELAY!" inside
the speech bubble, appearing only at t=0.6–1.4s and t=1.9–2.7s. No
watermark, no logo, no text on the unrolled parchment, no captions.
--ar 9:16 --quality high
```

**Why this works:**

- **Bird matches our already-generated `bird-fly.png`** so the still
  hero and the video look like the same character
- **Blank parchment center** so the code overlays the actual word
  (eagle's magic word changes per round — can't bake text in)
- **End frame holds for ~0.5s** so we can pause on it and overlay
  the word with a fade-in
- **No text in video** removes the OCR/AI-text-garbling problem
- **Portrait 9:16** fits mobile fullscreen, but landscape works too

### Variations to try

If the first generation looks off:

- **Eagle character drift** → add: `the same eagle character throughout
  the entire clip, consistent appearance, no morphing`
- **Wings look mechanical** → add: `wings flap with natural feather
  movement, soft individual feather articulation, not stiff or
  mechanical`
- **Parchment doesn't unroll satisfyingly** → add: `the scroll unrolls
  with a gentle springy bounce animation lasting 0.5 seconds, ribbons
  untying gracefully`
- **Background is too busy** → add: `simple dreamy sunset sky
  background with minimal detail, soft out-of-focus clouds`
- **Camera shake** → add: `static camera, no shake, no zoom, locked-off
  composition`
- **AI mangles "STRUDELAY!" in the speech bubble** (common — most
  video models can't write clean text):

  **Plan B — symbolic call instead of a text bubble.** Replace the
  speech-bubble paragraph with:

  > At t=0.6s and again at t=1.9s the bird's beak opens WIDE in a
  > clear "calling out" pose, head tilted up. Each time the beak
  > opens, three small gold musical notes and two purple sparkle
  > stars POP outward from the beak in a small arc, then fade. NO
  > speech bubble, NO words. The mouth-open pose makes it obvious
  > the bird is calling, and the gold notes are the only thing
  > coming out of its beak.

  The app's speechSynthesis says "Strudelay! Strudelay!" out loud
  when the clip plays — together the audio + the symbolic "calling
  out" sells the moment without the AI text-mangling risk.

- **AI puts the speech bubble in the wrong place** → add: `the
  speech bubble appears directly attached to the bird's beak by a
  short curved tail, never floating in empty space far from the
  bird`
- **AI shows the bubble for the wrong duration** → add: `the speech
  bubble appears exactly twice, briefly, then disappears completely
  before the scroll unrolls`

---

## 2. `spider-creep-in.mp4` — failure moment

**Duration:** 3 seconds. **Format:** 1080×1920 portrait.

```
A 3-second cinematic animated shot, 2D children's storybook style. A
cute (not scary) cartoon spider with a fluffy black body, 8 cuddly
legs, big round shiny eyes with sparkle highlights, ONE tiny fang in
a mischievous smile, and a small purple tuft on its head, drops from
the top of the frame on a single thin silver silk thread. At t=0 the
spider is at the very top; at t=1s it has descended to about 1/3
down; at t=2s it lands gently at center-screen and starts walking
side to side, legs alternating in a playful walk cycle. At t=2.5s
the spider stops and waves one leg at the camera, smiling. Background
is a soft dark-purple twilight sky with faint white sparkle stars,
no other elements. Spider is the only focal point, well-lit with a
soft top-light. Gentle bounce in the descent so the silk thread
springs slightly. Friendly playful tone — NEVER scary. No text, no
watermark. --ar 9:16
```

### Variations

- **Spider looks scary** → add: `friendly cute spider with cartoon
  proportions, oversized eyes, definitely NOT scary, kid-safe
  illustration style`
- **Movement is jerky** → add: `smooth, fluid character animation
  movement throughout, no jerky transitions`

---

## 3. `bird-flap-loop.mp4` — seamless flap cycle (optional, for ambient use)

**Duration:** 2 seconds, **loopable**. **Format:** 1080×1080 square,
transparent background if possible.

```
A 2-second perfectly loopable animation of a magical cartoon eagle
bird (purple-pink iridescent feathers, gold wing tips, friendly
smile, big shiny eye) flying in place, side view, against a fully
transparent background. The bird's body bobs gently up and down 8
pixels while the wings complete exactly ONE full flap cycle —
up-stroke, full extension, down-stroke, brake position — and return
to the starting wing position so the clip loops seamlessly with no
visible cut. The bird is centered in the frame, fills 80% of the
height. Static camera, no zoom, no pan. Soft directional light from
upper-left. No text, no watermark, no background elements at all.
--ar 1:1 --loopable
```

**Important:** Sora 2 doesn't support transparency. If you use Sora,
generate against a **chroma-key green** background and remove the
green in post:

> ...against a flat solid #00ff00 chroma-key green background...

Then in Clipchamp / Photopea, apply a green-screen / chroma-key
filter and export as MP4 with alpha (Apple ProRes 4444) or WebM
(VP9 with alpha).

---

## Files the code already expects

When you have any of these, drop them in and tell me:

```
public/media/sort/clips/
  eagle-banner-reveal.mp4    <- replaces BirdFlight component animation
  spider-creep-in.mp4         <- replaces Spider component animation
  bird-flap-loop.webm         <- ambient bird on home page (optional)
```

The code will auto-detect them (same probe pattern used everywhere
else) and the inline CSS/SVG animation falls back gracefully if a
clip is missing.

---

## Cost reality

- **Sora 2 Plus**: $20/mo, ~20s of 1080p video per generation. ~3
  clips for $20 if you only generate once each (you will iterate).
- **Runway Gen-3 Turbo**: $15/mo, faster but lower fidelity.
- **Pika 1.5**: Free tier gives ~30s of video/day. Slower but
  workable for iterating.
- **Kling AI**: Free tier, very generous on length but quality is
  uneven for character work.

**Recommended path:** Pika free tier for the spider clip (3s is fine
for free), Sora 2 for the eagle reveal (worth the spend — it's the
hero moment).

---

## After you have the clips

Drop into the expected paths, run `git add public/media/sort/clips/`,
and tell me **"clips are in"**. I'll:

1. Wire the eagle clip into `<BirdFlight>` (replaces the SVG
   sprite-sheet flap with a real video). The current animation
   becomes the fallback.
2. Wire the spider clip into `<Spider>` similarly.
3. If you generate the loop, embed it on the home page hero behind
   the PLAY button for a moving backdrop.
4. Pause the video on the last frame, overlay the actual word in
   the same gradient styling the page uses now.
