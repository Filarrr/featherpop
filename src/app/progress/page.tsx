import { ProgressClient } from "@/components/ProgressClient";

export const metadata = { title: "My Progress" };
export const dynamic = "force-dynamic";

export default function ProgressPage() {
  return (
    <main className="page progress-page-wrap">
      <ProgressClient />
    </main>
  );
}
