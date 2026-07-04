import { Suspense } from "react";
import { ProgressClient } from "@/components/ProgressClient";
import { TestSeedWords } from "@/components/TestSeedWords";

export const metadata = { title: "My Progress" };
export const dynamic = "force-dynamic";

export default function ProgressPage() {
  return (
    <main className="page progress-page-wrap">
      <Suspense fallback={null}>
        <TestSeedWords />
      </Suspense>
      <ProgressClient />
    </main>
  );
}
