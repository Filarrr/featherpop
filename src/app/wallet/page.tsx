import { WalletClient } from "@/components/WalletClient";

export default function WalletPage() {
  return (
    <main className="page">
      <header className="mb-5">
        <span className="kicker">Wallet</span>
        <h1 className="h-display mt-2 text-4xl md:text-5xl">
          <span className="h-gradient">FeatherPop</span>
        </h1>
      </header>
      <WalletClient />
    </main>
  );
}
