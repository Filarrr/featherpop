import { Suspense } from "react";
import { QrScanner } from "@/components/QrScanner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Park Hunt — Scan" };

export default function ScanPage() {
  return (
    <main className="page">
      <Suspense fallback={<div className="card">Loading scanner…</div>}>
        <QrScanner />
      </Suspense>
    </main>
  );
}
