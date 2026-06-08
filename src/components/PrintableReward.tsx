"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { listRewards } from "@/lib/admin-store";
import { Reward } from "@/lib/game-data";
import { useActiveChild } from "@/lib/use-active-child";

export function PrintableReward({ rewardId }: { rewardId: string }) {
  const { active } = useActiveChild();
  const [reward, setReward] = useState<Reward | null>(null);

  useEffect(() => {
    const r = listRewards().find((x) => x.id === rewardId);
    setReward(r ?? null);
  }, [rewardId]);

  const nickname = active?.nickname ?? "Feather Explorer";

  if (!reward) {
    return (
      <main className="page no-print">
        <div className="card">
          <h1 className="h-display text-2xl">Reward not found</h1>
        </div>
      </main>
    );
  }

  return (
    <>
      <section className="no-print mx-auto max-w-2xl p-4">
        <div className="card">
          <span className="kicker">Printable</span>
          <h1 className="h-display mt-2 text-3xl">{reward.name}</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Print this certificate on regular paper or cardstock — it&apos;s
            sized to one US Letter / A4 page.
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-gold mt-4"
          >
            <Printer aria-hidden className="h-5 w-5" />
            Print certificate
          </button>
        </div>
      </section>

      <article className="reward-cert">
        <div className="reward-cert-frame">
          <p className="reward-cert-kicker">Ms. Feather Pop · Feather Missions</p>
          <h2 className="reward-cert-title">Certificate of Achievement</h2>
          <p className="reward-cert-presented">This certificate is presented to</p>
          <p className="reward-cert-name">{nickname}</p>
          <p className="reward-cert-body">
            for unlocking the <strong>{reward.name}</strong> reward
            <br />
            ({reward.featherpopRequired} FeatherPop earned).
          </p>
          <p className="reward-cert-tag">
            Way to go, brave explorer! Keep scanning, hopping, and helping.
          </p>
          <div className="reward-cert-signature">
            <div>
              <p className="line">Ms. Feather Pop</p>
              <p className="sublabel">Chief Feather Whisperer</p>
            </div>
            <div>
              <p className="line">{new Date().toLocaleDateString()}</p>
              <p className="sublabel">Date</p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
