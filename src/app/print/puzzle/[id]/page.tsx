import { notFound } from "next/navigation";
import { getPuzzle } from "@/lib/prize-library";
import { PrintablePuzzle } from "@/components/print/PrintablePuzzle";

export const metadata = { title: "Print · Puzzle" };
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export default async function PrintPuzzlePage({ params }: RouteParams) {
  const { id } = await params;
  const puzzle = getPuzzle(id);
  if (!puzzle) notFound();

  return <PrintablePuzzle id={puzzle.id} title={puzzle.title} description={puzzle.description} />;
}
