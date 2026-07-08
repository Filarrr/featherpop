import { HomeStats } from "@/components/HomeStats";
import { FeatherCollection } from "@/components/FeatherCollection";

export const metadata = { title: "Your feathers" };

export default function FeathersPage() {
  return (
    <main className="page">
      <HomeStats />
      <FeatherCollection />
    </main>
  );
}
