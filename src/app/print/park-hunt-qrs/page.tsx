import Link from "next/link";
import { getMembership, isMemberActive } from "@/lib/membership";
import { weekKey, weeklyStations } from "@/lib/park-hunt";
import { getGlobalWordBank } from "@/lib/global-content";
import { isOwner } from "@/lib/owner";
import { PrintableQrPack } from "@/components/print/PrintableQrPack";

export const metadata = { title: "Park Hunt QR Pack" };
export const dynamic = "force-dynamic";

export default async function ParkHuntQrsPage() {
  const [membership, owner] = await Promise.all([getMembership(), isOwner()]);
  // Members can print for their own park; the owner can always print (no
  // subscription needed) to set up stations and hand QRs to families.
  const member = isMemberActive(membership) || owner;

  if (!member) {
    return (
      <main className="page no-print">
        <div className="card">
          <span className="kicker">Members only</span>
          <h1 className="h-display mt-2 text-3xl">
            <span className="h-gradient">Printable Park Hunt QRs</span>
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Print the 6 station QRs to take Park Hunt to any park, backyard,
            or birthday party. This pack is part of Adventure Membership.
          </p>
          <ul className="mt-4 grid gap-2">
            <li>📍 5 numbered QR stations, ready to print</li>
            <li>🧷 Weatherproof-laminate-friendly layout</li>
            <li>📅 Word lists refresh every Monday automatically</li>
            <li>🎉 No setup — kids scan and the app does the rest</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/membership" className="btn btn-gold btn-lg">
              Unlock with membership
            </Link>
            <Link href="/" className="btn btn-ghost">Back home</Link>
          </div>
        </div>
      </main>
    );
  }

  // Members get the pack. Hand the current week's word lists to the
  // client so the print preview shows what kids will see this week.
  const week = weekKey();
  const bank = await getGlobalWordBank();
  const { stations } = weeklyStations(week, bank);
  return <PrintableQrPack stations={stations} weekKey={week} />;
}
