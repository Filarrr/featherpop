import { FeatherCollection } from "@/components/FeatherCollection";

export const metadata = { title: "Your feathers" };

export default function FeathersPage() {
  return (
    <main className="page">
      <FeatherCollection />
    </main>
  );
}
