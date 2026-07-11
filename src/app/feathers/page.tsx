import { FeatherCollection } from "@/components/FeatherCollection";
import { getMembership, isMemberActive } from "@/lib/membership";
import { isOwner } from "@/lib/owner";

export const metadata = { title: "Your feathers" };
export const dynamic = "force-dynamic";

export default async function FeathersPage() {
  const [membership, owner] = await Promise.all([
    getMembership().catch(() => null),
    isOwner().catch(() => false),
  ]);
  const member = (membership ? isMemberActive(membership) : false) || owner;

  return (
    <main className="page">
      <FeatherCollection member={member} />
    </main>
  );
}
