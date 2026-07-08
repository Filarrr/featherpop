import { redirect } from "next/navigation";
import { PrintPacks } from "@/components/PrintPacks";
import { getMembership, isMemberActive } from "@/lib/membership";

export default async function PrintPage() {
  const m = await getMembership();
  if (!isMemberActive(m)) {
    redirect("/membership?from=/print");
  }
  return (
    <main className="page">
      <PrintPacks />
    </main>
  );
}
