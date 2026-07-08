import { MissionRunner } from "@/components/MissionRunner";

export default async function QuestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="page">
      <MissionRunner slug={slug} />
    </main>
  );
}

export const dynamic = "force-dynamic";
