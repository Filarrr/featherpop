import { redirect } from "next/navigation";
import { PrintPacks } from "@/components/PrintPacks";
import { getMembership, isMemberActive } from "@/lib/membership";
import { getGlobalChallenges } from "@/lib/global-content";

export default async function PrintPage() {
  const m = await getMembership();
  if (!isMemberActive(m)) {
    redirect("/membership?from=/print");
  }
  const challenges = (await getGlobalChallenges()).filter((c) => c.active);
  return (
    <main className="page">
      <PrintPacks challenges={challenges} />
    </main>
  );
}
