import { AdminGate } from "@/components/AdminGate";
import { AdminRewardsManager } from "@/components/AdminRewardsManager";

export default function AdminRewardsPage() {
  return (
    <AdminGate>
      <main className="page">
        <header className="mb-5">
          <span className="kicker">Admin · Rewards</span>
          <h1 className="h-display mt-2 text-4xl">
            <span className="h-gradient">Manage rewards</span>
          </h1>
        </header>
        <AdminRewardsManager />
      </main>
    </AdminGate>
  );
}
