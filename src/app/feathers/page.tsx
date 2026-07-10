import { FeatherCollection } from "@/components/FeatherCollection";
import { getMembership, isMemberActive } from "@/lib/membership";

export const metadata = { title: "Your feathers" };
export const dynamic = "force-dynamic";

export default async function FeathersPage() {
  const membership = await getMembership().catch(() => null);
  const member = membership ? isMemberActive(membership) : false;

  return (
    <main className="page">
      <FeatherCollection member={member} />
    </main>
  );
}
