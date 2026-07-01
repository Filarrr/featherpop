import { redirect } from "next/navigation";
import { HomeHero } from "@/components/HomeHero";
import { resolveActiveChild } from "@/lib/active-child-server";
import { isOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // The owner account runs the platform, not plays it — send it straight to
  // the control room and never make it set up a child.
  if (await isOwner()) redirect("/admin");

  const { children, activeChildId } = await resolveActiveChild();
  if (children.length === 0) redirect("/welcome");
  if (!activeChildId) redirect("/account/profiles");

  return (
    <main className="page home-page">
      <HomeHero />
    </main>
  );
}
