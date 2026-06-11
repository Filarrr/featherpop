import { redirect } from "next/navigation";
import { HomeHero } from "@/components/HomeHero";
import { resolveActiveChild } from "@/lib/active-child-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { children, activeChildId } = await resolveActiveChild();
  if (children.length === 0) redirect("/welcome");
  if (!activeChildId) redirect("/account/profiles");

  return (
    <main className="page home-page">
      <HomeHero />
    </main>
  );
}
