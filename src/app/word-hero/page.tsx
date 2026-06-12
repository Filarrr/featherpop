import { WordHero } from "@/components/WordHero";

export const metadata = { title: "Word Hero" };
export const dynamic = "force-dynamic";

export default function WordHeroPage() {
  return (
    <main className="page word-hero-page">
      <WordHero />
    </main>
  );
}
