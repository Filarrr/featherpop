import { ParkHuntStage } from "@/components/park-hunt/ParkHuntStage";

export const metadata = { title: "Park Hunt" };
export const dynamic = "force-dynamic";

export default function ParkHuntPage() {
  return (
    <main className="page parkhunt-page">
      <ParkHuntStage />
    </main>
  );
}
