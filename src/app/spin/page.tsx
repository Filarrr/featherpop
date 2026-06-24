import { listSpinPrizesAction } from "@/lib/child-progress-actions";
import { SpinWheelClient } from "@/components/spin/SpinWheelClient";

export const metadata = { title: "Spin Wheel" };
export const dynamic = "force-dynamic";

export default async function SpinPage() {
  const prizes = await listSpinPrizesAction();
  return (
    <main className="page spin-page">
      <SpinWheelClient prizes={prizes} />
    </main>
  );
}
