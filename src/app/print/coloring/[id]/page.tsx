import { notFound } from "next/navigation";
import { getColoring } from "@/lib/prize-library";
import { PrintableColoring } from "@/components/print/PrintableColoring";

export const metadata = { title: "Print · Coloring Page" };
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export default async function PrintColoringPage({ params }: RouteParams) {
  const { id } = await params;
  const page = getColoring(id);
  if (!page) notFound();

  return <PrintableColoring id={page.id} title={page.title} description={page.description} />;
}
