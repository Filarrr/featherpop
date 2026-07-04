# Egg hatch animation — asset drop-in

The egg-hatch reveal will automatically use an AI-generated clip if you add
one. No code change needed — just drop the file at the path below and it
plays; if it's missing, the built-in CSS animation is used.

## Where to put the file
```
public/media/eggs/egg-hatch.webm     ← preferred (transparent background)
public/media/eggs/egg-hatch.mp4      ← fallback (used if no .webm)
```
Create the `public/media/eggs/` folder if it isn't there.

## Specs
- **Square** (1:1), around **512×512** (up to 1024×1024 is fine).
- **~2–3 seconds**, plays once.
- **Transparent background** (that's why `.webm` / VP9-with-alpha is preferred;
  most MP4s can't be transparent). If your tool can't do transparency, use a
  clip on a **dark/magical background** that blends with the reveal card.
- **Egg + crack + sparkle ONLY — no creature inside.** The app overlays the
  specific character (unicorn, eagle, bunny…) on top, so one clip fits every
  hatch. If the clip shows a creature it'll clash with the overlay.

## Prompts

**Video tools (Runway, Sora, Kling, Pika, Luma):**
> A cute pastel magical egg sits centered on a transparent background. It
> wobbles twice, then cracks open along the middle with a bright burst of
> golden and pink sparkles and a soft glow. The two shell halves pop apart —
> the top lid flips up and off. No animal or creature appears — just the egg,
> the crack, and the sparkle burst. Children's storybook style, soft rounded
> shapes, bright cheerful colors, 3 seconds, loopable, transparent background.

**Animated image alternative (Midjourney/DALL·E frames → animated WebP/GIF):**
> Storybook illustration of a pastel magical egg cracking open with a burst of
> sparkles and golden light, two shell halves splitting apart, no creature
> inside, transparent background, bright kid-friendly colors, centered, square.
> (Generate a few frames: intact → wobbling → cracked → burst, then combine
> into a looping transparent WebP or GIF and save it as `egg-hatch.webm`/`.mp4`
> — or tell me and I'll switch the code to load a `.webp`/`.gif` instead.)

## Notes
- If you'd rather use a **transparent animated WebP/GIF** than a video, drop it
  in and let me know — I'll point the loader at that extension.
- Keep the file small (< ~2 MB) so it loads instantly on phones.
- The character emoji + name still appear on top, so the clip only needs to
  sell the "egg cracking open" moment.
