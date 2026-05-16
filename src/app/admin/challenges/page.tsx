import { AdminGate } from "@/components/AdminGate";
import { AdminChallengeManager } from "@/components/AdminChallengeManager";

export default function AdminChallengesPage() {
  return (
    <AdminGate>
      <main className="page">
        <header className="mb-5">
          <span className="kicker">Admin · Challenges</span>
          <h1 className="h-display mt-2 text-4xl">
            <span className="h-gradient">Manage challenges</span>
          </h1>
        </header>
        <AdminChallengeManager />
      </main>
    </AdminGate>
  );
}
