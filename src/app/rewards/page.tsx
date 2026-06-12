import { RewardsClient } from "@/components/RewardsClient";

export const metadata = { title: "Prizes" };
export const dynamic = "force-dynamic";

export default function RewardsPage() {
  return (
    <main className="page rewards-page-wrap">
      <RewardsClient />
    </main>
  );
}
