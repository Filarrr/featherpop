import { redirect } from "next/navigation";
import { PrintableReward } from "@/components/PrintableReward";
import { getMembership, isMemberActive } from "@/lib/membership";

export default async function PrintRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getMembership();
  if (!isMemberActive(m)) {
    redirect(`/membership?from=${encodeURIComponent(`/print/reward/${id}`)}`);
  }
  return <PrintableReward rewardId={id} />;
}
