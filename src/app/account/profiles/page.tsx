import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ProfilePicker } from "@/components/ProfilePicker";
import { hasParentPin } from "@/lib/parent-pin";
import { addChildAction, listChildren, removeChildAction } from "./actions";

export const metadata = { title: "Child profiles" };

export default async function ProfilesPage() {
  const [children, pinSet] = await Promise.all([listChildren(), hasParentPin()]);
  return (
    <main className="page">
      <section className="card">
        <span className="kicker">Family</span>
        <h1 className="h-display mt-2 text-3xl">Who&apos;s exploring today?</h1>
        <p className="text-[var(--ink-soft)]">
          Each child has their own feathers, streak, and mission history. Up to 6 children per account.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/account/pin" className="btn btn-gold btn-sm">
            <ShieldCheck aria-hidden className="h-4 w-4" />
            {pinSet ? "Change parent PIN" : "Set parent PIN"}
          </Link>
          {!pinSet ? (
            <span className="text-sm text-[var(--ink-soft)] self-center">
              Required to approve grown-up missions.
            </span>
          ) : null}
        </div>
      </section>
      <ProfilePicker
        children={children}
        addAction={addChildAction}
        removeAction={removeChildAction}
      />
    </main>
  );
}
