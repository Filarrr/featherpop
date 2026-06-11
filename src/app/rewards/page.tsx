import { RewardsClient } from "@/components/RewardsClient";

export const metadata = { title: "Prizes" };
// Always re-render so a fresh FeatherPop balance shows after the kid earns
// some in Letter Pop / Feather Match / Park Hunt.
export const dynamic = "force-dynamic";

export default function RewardsPage() {
  return (
    <main className="page">
      <header className="rewards-page-head">
        <span className="kicker">Prizes</span>
        <h1 className="h-display text-3xl md:text-4xl">
          <span className="h-gradient">Prize wall</span>
        </h1>
        <p>
          Every feather earned brings a prize closer. Some you can print at
          home, some come as physical merch — and a few are Members-only.
        </p>
      </header>
      <RewardsClient />
    </main>
  );
}
