import Link from "next/link";
import { isOwner } from "@/lib/owner";
import { getGlobalVideos, getGlobalSongs } from "@/lib/global-content";
import { MediaManager } from "@/components/admin/MediaManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Videos & Songs" };

export default async function AdminMediaPage() {
  if (!(await isOwner())) {
    return (
      <main className="page">
        <div className="card mx-auto max-w-md text-center">
          <h1 className="h-display text-2xl">Owners only</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Sign in with the owner account to manage videos & songs.
          </p>
          <Link href="/" className="btn btn-gold mt-4">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const [videos, songs] = await Promise.all([
    getGlobalVideos(),
    getGlobalSongs(),
  ]);

  return (
    <main className="page">
      <header className="mb-5">
        <span className="kicker">Admin · Media</span>
        <h1 className="h-display mt-2 text-4xl">
          <span className="h-gradient">Videos &amp; Songs</span>
        </h1>
        <p className="mt-1 text-[var(--ink-soft)]">
          Add links (e.g. your TikTok videos). Kids watch/listen on the Story
          Time and Music pages and earn the daily bonus.
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <MediaManager initial={videos} kind="video" />
        <MediaManager initial={songs} kind="song" />
      </div>
    </main>
  );
}
