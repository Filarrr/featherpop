# Lottie shopping list

LottieFiles' download CDN blocks automated fetches (403 even with a real
browser User-Agent), so this needs ~2 minutes of human clicking. Below
are 6 curated free animations that fit Ms. Feather Pop. For each:

1. Open the URL in your browser.
2. Click **Download → Lottie JSON**.
3. Rename to the **exact filename** in the right-hand column.
4. Move it into `public/lottie/`.

The app's `LottieAvatar` component already auto-loads from these paths —
no code changes needed once the files exist.

| # | What it's for | LottieFiles URL | Save as |
|---|---|---|---|
| 1 | Cheering celebration / reward burst | https://lottiefiles.com/free-animations/cheering | `public/lottie/cheering.json` |
| 2 | Confetti explosion (use behind reward burst) | https://lottiefiles.com/free-animations/confetti | `public/lottie/confetti.json` |
| 3 | Crowd cheer (multiple kids hyping) | https://lottiefiles.com/free-animations/crowd-cheer | `public/lottie/crowd-cheer.json` |
| 4 | Trophy reveal (result screen) | https://lottiefiles.com/free-animations/trophy | `public/lottie/trophy.json` |
| 5 | 5-star rating (when reward unlocked) | https://lottiefiles.com/free-animations/5-star | `public/lottie/stars.json` |
| 6 | Talking character mouth (cycles on speech) | https://lottiefiles.com/free-animations/talking | `public/lottie/talking.json` |

## Optional, nice-to-have

| # | What it's for | URL | Save as |
|---|---|---|---|
| 7 | Hand wave (Ms. Feather Pop bubble hover) | https://lottiefiles.com/free-animations/waving | `public/lottie/wave.json` |
| 8 | Kid waving (one of the avatars) | https://lottiefiles.com/free-animations/kid-waving | `public/lottie/kid-wave.json` |
| 9 | Success celebration burst | https://lottiefiles.com/free-animations/success-celebration | `public/lottie/success.json` |

## Once they're in `public/lottie/`

Tell me "lottie is in" and I'll:
- Drop the confetti loop behind the reward overlay (currently CSS confetti).
- Use the trophy + stars on the result screen.
- Layer the talking-mouth animation over Ms. Feather Pop's bubble while
  she speaks.
- Add the crowd-cheer behind the big-win moment.
