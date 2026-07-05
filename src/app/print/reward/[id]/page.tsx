import { PrintableReward } from "@/components/PrintableReward";
import { getGlobalRewards } from "@/lib/global-content";

export default async function PrintRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rewards = await getGlobalRewards();
  const reward = rewards.find((r) => r.id === id) ?? null;
  return <PrintableReward reward={reward} />;
}
