# Ms. Feather Pop — Image-to-Video Animation Prompts

How to turn the static PNGs you already have into brand-perfect animated
loops. Because we're feeding the AI **her existing illustration** as the
starting frame, the character stays 100% on-brand — the AI just animates
what's already there.

---

## 1. Which tool to use

Every tool below accepts an image + a motion prompt. Pick one — all five
give similar results for this kind of subtle character animation.

| Tool | Free tier | Best for | Notes |
|---|---|---|---|
| **Sora 2** (in ChatGPT Plus/Pro) | Included with ChatGPT subscription | Same chat where you made the PNGs — zero context switching | $20/mo Plus, $200/mo Pro |
| **Gemini Veo 3** (in Google AI Studio) | 3 free generations/day | Highest motion quality, super clean | Free tier is enough for a full set |
| **Kling AI** | 6 free credits/day | Character motion is the best of the bunch | Free tier rebuilds every day |
| **Hailuo / MiniMax** | Generous free credits | Hyper-realistic + cartoon both work | Chinese site, English UI |
| **Runway Gen-3 / Gen-4** | 10s of free credits | Pro feel, very smooth | Paid quickly: ~$15/mo |
| **Luma Dream Machine** | 5 free generations/day | Soft, dreamy motion | Easy UI |

> **My pick if you have ChatGPT Plus:** Sora 2 (same thread you made the
> PNGs in — just say *"animate this image with a gentle wave"*).
> **Free pick:** Gemini Veo 3 (free 3/day is enough to do 1-2 characters
> per day; ~5 days total to do the whole set).

---

## 2. Universal motion-prompt formula

Every clip uses this skeleton. Keep prompts short — 1-2 sentences max.

```
A short looping animation, 3 seconds, cartoon style.
[CHARACTER does ACTION]. [SECONDARY MICRO-MOTION].
Hair sways subtly. Wings flutter softly (if Ms. Feather Pop).
Looping seamlessly. Camera locked. No background motion.
```

Then upload the matching PNG as the starting frame.

> **Pro tip:** Set duration to **3 seconds**, framerate **24fps**, and
> ask for **"seamless loop"** explicitly. The loop is what makes it feel
> like a real cartoon and not a one-shot clip.

---

## 3. Ms. Feather Pop — one prompt per pose

For each row: upload the listed PNG, send the prompt, save the MP4 with
the filename in column 3.

| PNG to upload | Prompt | Save as |
|---|---|---|
| `feather-pop-idle.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop stands relaxed, gently breathing — her chest rises and falls slowly. Hair sways subtly. Wings flutter softly behind her. She blinks twice. Seamless loop. Camera locked, plain transparent background.* | `public/media/avatars/feather-pop-idle.mp4` |
| `feather-pop-wave.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop waves her raised hand side-to-side, smiling. Wings flutter softly behind her. Hair sways with the motion. Seamless loop. Camera locked, plain transparent background.* | `public/media/avatars/feather-pop-wave.mp4` |
| `feather-pop-cheer.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop jumps once in joy with both arms up, then lands and bounces gently in place. Wings flare wide on the jump. Eyes squint with joy. Seamless loop. Camera locked, plain background.* | `public/media/avatars/feather-pop-cheer.mp4` |
| `feather-pop-think.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop tilts her head slowly side to side with her finger on her chin, eyes glancing up curiously. Wings flutter softly. Seamless loop. Camera locked.* | `public/media/avatars/feather-pop-think.mp4` |
| `feather-pop-hint.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop's pointing hand bounces forward gently in rhythm, while the glowing feather in her other hand pulses with light. Wings flutter softly. Hair sways. Seamless loop. Camera locked.* | `public/media/avatars/feather-pop-hint.mp4` |
| `feather-pop-oops.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop sways gently with her hand on her cheek, eyes shifting apologetically, a tiny shrug. Wings droop slightly then perk up. Seamless loop. Camera locked.* | `public/media/avatars/feather-pop-oops.mp4` |
| `feather-pop-wow.png` | *A short 3-second looping cartoon animation. Ms. Feather Pop floats upward mid-air holding the giant golden FeatherPop coin above her head. Wings flap powerfully. Gold sparkles trail beneath her. Hair flows in the wind. Seamless loop, camera locked.* | `public/media/avatars/feather-pop-wow.mp4` |

### 3a. Talking head (the big one — for the mascot bubble)

Upload `feather-pop-head.png`. Prompt:

```
A short 4-second looping cartoon animation. Ms. Feather Pop's mouth opens
and closes naturally as if she's talking warmly. Eyes blink twice. Slight
head bob with the speech rhythm. Hair sways subtly. Wings barely visible
behind shoulders flutter. Seamless loop, camera locked, plain background.
```

**Save as:** `public/media/avatars/feather-pop-head.mp4`

> This one is the game-changer. Once it exists, every time she speaks in
> the mascot bubble it looks like a real cartoon, not a still image.

### 3b. Talking head — true lipsync (premium route)

If you want her actual voice lip-synced to a custom welcome message:

1. Upload `feather-pop-head.png` to **D-ID** (https://www.d-id.com) or
   **HeyGen** (https://www.heygen.com).
2. Paste your script: *"Hi Word Explorers! I'm Ms. Feather Pop. Are
   you ready to find some letters and earn FeatherPop?"*
3. Pick a kid-friendly voice (D-ID has built-in voices; HeyGen has more).
4. Download the resulting MP4.
5. Save as `public/media/intro.mp4` — the intro page picks it up
   automatically.

D-ID free trial gives 10 min. HeyGen free tier 1 min/credit. More than
enough for the intro + per-quest videos.

---

## 4. The 6 kids — one universal prompt

The kids are simpler — small bobs, waves, jumps. Use the same prompt
template, swapping the PNG. Each kid has 5 poses; the most impactful 3
to animate are **wave, cheer, jump** (idle and read can stay static).

```
A short 3-second looping cartoon animation, kids' app style.
The child [ACTION FOR POSE].
Slight bounce in their body. Hair sways gently.
Seamless loop. Camera locked, plain transparent background.
```

| Pose | `[ACTION FOR POSE]` |
|---|---|
| WAVE  | waves their raised hand back and forth, smiling brightly |
| CHEER | jumps once with both arms up cheering, then lands and bounces in place |
| JUMP  | bounces continuously with both arms up, confetti dots floating around |

**Upload + save naming for each kid:**

```
kid-ari-wave.png   →  kid-ari-wave.mp4
kid-ari-cheer.png  →  kid-ari-cheer.mp4
kid-ari-jump.png   →  kid-ari-jump.mp4
(repeat for bee, kai, lila, mo, zara)
```

> **Time-saver:** Animate only **cheer + jump** for each of the 6 kids
> (12 clips total). Those are the poses that show in the reward burst
> and on the home / rewards pages. The rest can stay PNG.

---

## 5. Quest zone backgrounds (subtle motion)

Each scene can become a softly animated background. Upload the zone PNG,
use this prompt template:

```
A 4-second looping cartoon background animation.
[ZONE-SPECIFIC MOTION].
Slow, subtle, ambient — no characters, no jarring movement.
Seamless loop. Camera locked.
```

| Zone PNG | `[ZONE-SPECIFIC MOTION]` | Save as |
|---|---|---|
| `zone-feather-forest.png` | Feathers drift slowly downward through the air. Tree leaves sway gently in a breeze. Mushrooms glow softly. | `zone-feather-forest.mp4` |
| `zone-sky-stage.png` | Hot-air balloons rise slowly. Clouds drift left. Rainbow shimmers. Stars twinkle. | `zone-sky-stage.mp4` |
| `zone-adventure-trail.png` | Wildflowers sway in a breeze. Distant clouds drift. Butterflies cross the path. | `zone-adventure-trail.mp4` |
| `zone-pop-park.png` | Balloons drift upward. Fountain water sparkles. Swings sway gently. | `zone-pop-park.mp4` |
| `zone-star-stage.png` | Stars twinkle and fall slowly. Moon glows pulsing. Curtains sway. | `zone-star-stage.mp4` |
| `zone-reading-nest.png` | Fairy lights twinkle. Storybook pages flutter softly. Lanterns glow. | `zone-reading-nest.mp4` |

(All save to `public/media/scenes/`)

---

## 6. Reward burst (the big-win moment)

Upload `reward-burst.png`. Prompt:

```
A 3-second looping cartoon animation. The giant golden FeatherPop coin
in the center pulses and slowly rotates. Confetti pieces and stars
explode outward in a continuous radial burst. Ribbons swirl. The
magenta-and-cyan halo behind it shimmers. Seamless loop.
```

**Save as:** `public/media/scenes/reward-burst.mp4`

This replaces the current slowly-rotating PNG with real animated burst.

---

## 7. Trophy reveal

Upload `trophy.png`. Prompt:

```
A 2-second cartoon animation, plays once then holds. The golden trophy
rises into frame from below with a slight bounce. Sparkle stars pop
around it. Halo behind it brightens. Hold final frame.
```

**Save as:** `public/media/scenes/trophy.mp4`

Used on the result screen at the end of a quest.

---

## 8. File path map — what auto-loads where

The app's `AnimatedAvatar` component HEADs each path in this order and
plays the first that exists. So dropping any `.mp4` automatically
upgrades the static `.png` — no code changes:

```
1. /media/avatars/feather-pop-<pose>.mp4    (preferred)
2. /media/avatars/feather-pop-<pose>.webm
3. /media/avatars/feather-pop-<pose>.gif
4. /media/avatars/feather-pop-<pose>.png    (current state)
5. inline SVG fallback
```

Same chain for `kid-<name>-<pose>` and scene paths.

---

## 9. GIF vs MP4 — which to download

If the tool offers both, **always pick MP4**. Specifically:

- MP4 is ~10× smaller (a 3s 1024px MP4 ≈ 200 KB vs a GIF at 2-5 MB)
- MP4 supports alpha transparency (in .webm via VP9) — GIFs only have 1-bit transparency that looks crusty
- The app's `<video autoplay loop muted playsinline>` plays MP4 exactly
  like a GIF — kids don't see a difference

If only GIF is offered, that's fine — save as `.gif`, the app handles it.

---

## 10. Bulk workflow (recommended order)

If you do these in this order you get max visual impact for minimum work:

1. `feather-pop-head.mp4`    — biggest impact (mascot bubble talks now)
2. `feather-pop-wave.mp4`    — hero portrait waves
3. `feather-pop-cheer.mp4`   — quest win moment
4. `feather-pop-hint.mp4`    — mascot pointing during hints
5. `reward-burst.mp4`        — the explosion when you find the keyword
6. `kid-ari-cheer.mp4` + `kid-bee-jump.mp4` + `kid-zara-cheer.mp4`
   — these three play in the reward overlay; doing just these makes the
   win moment feel like a real party
7. `zone-pop-park.mp4`       — Pop Park is one of the most-played zones
8. The remaining kids + zones — polish, weekend project

After step 6 the app already feels twice as alive as it does now.

---

## 11. When you're done

Drop the MP4s into the paths above and tell me **"the videos are in"**.
I'll:

- Verify each one loads correctly
- Adjust container sizes if any aspect ratios shifted
- Wire the talking-head video specifically into the mascot bubble so it
  plays whenever Ms. Feather Pop speaks (and pauses when she's quiet).
