import { notFound } from "next/navigation";
import { QuestExperience } from "@/components/QuestExperience";
import { defaultChallenges } from "@/lib/game-data";

export default async function QuestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Server-side render uses the static defaults so the page works on first paint;
  // the client component will pick up admin overrides for subsequent renders.
  const challenge = defaultChallenges.find((c) => c.slug === slug && c.active);
  if (!challenge) notFound();

  return (
    <main className="page">
      <QuestExperience challenge={challenge} />
    </main>
  );
}

export async function generateStaticParams() {
  return defaultChallenges.map((c) => ({ slug: c.slug }));
}
