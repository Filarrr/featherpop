"use client";

import { useState } from "react";
import { Check, Gift, Sparkles } from "lucide-react";
import {
  claimMusicBonusAction,
  claimVideoBonusAction,
} from "@/lib/child-progress-actions";
import { childCheer, ding, fanfare, pop } from "@/lib/audio";

/**
 * Once-per-day +5 FeatherPop bonus card. Use on the Story Time page
 * (kind="video") or any music station page (kind="music"). The server
 * action gates by 'YYYY-MM-DD' per active child, so navigating away and
 * back doesn't let the kid re-claim.
 */
export function DailyBonusCard({
  kind,
}: {
  kind: "video" | "music";
}) {
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  async function claim() {
    if (busy || claimed) return;
    setBusy(true);
    setReason(null);
    pop();
    try {
      const res =
        kind === "video"
          ? await claimVideoBonusAction()
          : await claimMusicBonusAction();
      if (res.awarded) {
        setClaimed(true);
        ding(1320, 90);
        window.setTimeout(() => fanfare(), 250);
        window.setTimeout(() => childCheer(), 900);
      } else {
        setReason(res.reason ?? "Already claimed today.");
      }
    } finally {
      setBusy(false);
    }
  }

  const label = kind === "video" ? "video" : "song";

  return (
    <div
      className={`daily-bonus daily-bonus-${kind} ${
        claimed ? "is-claimed" : ""
      }`}
    >
      <div className="daily-bonus-icon" aria-hidden>
        {claimed ? (
          <Check className="h-7 w-7" />
        ) : (
          <Gift className="h-7 w-7" />
        )}
      </div>
      <div className="daily-bonus-body">
        <span className="kicker">
          <Sparkles aria-hidden className="h-4 w-4" />
          Daily Bonus
        </span>
        <h3>
          {claimed
            ? "+5 FeatherPop claimed!"
            : `Watch today's ${label} for +5 FeatherPop`}
        </h3>
        <p>
          {claimed
            ? `Come back tomorrow for another ${label} bonus.`
            : `One bonus per day. You can still ${
                kind === "video" ? "watch" : "play"
              } more — only the first ${label} a day gives feathers.`}
        </p>
        {reason ? <p className="daily-bonus-reason">{reason}</p> : null}
      </div>
      {!claimed ? (
        <button
          type="button"
          className="btn btn-gold btn-lg btn-pulse daily-bonus-btn"
          onClick={claim}
          disabled={busy}
        >
          {busy ? "Claiming…" : "Claim +5"}
        </button>
      ) : null}
    </div>
  );
}
