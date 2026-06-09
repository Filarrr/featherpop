import { FeatherSortGameClient } from "@/components/sort/FeatherSortGameClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feather Sort" };

export default function SortPage() {
  return (
    <main className="page sort-page">
      <FeatherSortGameClient />
    </main>
  );
}
