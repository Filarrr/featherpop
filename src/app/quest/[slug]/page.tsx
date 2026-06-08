import { MissionRunnerClient } from "@/components/MissionRunnerClient";

export default async function QuestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="page">
      <MissionRunnerClient slug={slug} />
    </main>
  );
}

export const dynamic = "force-dynamic";
