"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { setActiveChildIdGlobal, bumpChildrenVersion } from "@/lib/use-active-child";
import { Confetti } from "@/components/Confetti";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";
import { childCheer, fanfare, pop } from "@/lib/audio";

const AVATAR_OPTIONS = [
  "kid-ari",
  "kid-bee",
  "kid-kai",
  "kid-lila",
  "kid-mo",
  "kid-zara",
];

type Step = 1 | 2 | 3;

interface Props {
  hasChild: boolean;
  hasPin: boolean;
  addChildAction: (fd: FormData) => Promise<{ id: string } | null>;
  setPinAction: (
    prev: { ok: boolean; error?: string } | null,
    fd: FormData,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export function WelcomeWizard({
  hasChild,
  hasPin,
  addChildAction,
  setPinAction,
}: Props) {
  const router = useRouter();
  const initial: Step = !hasChild ? 1 : !hasPin ? 2 : 3;
  const [step, setStep] = useState<Step>(initial);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [adding, setAdding] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [pinState, pinForm, pinPending] = useActionState(setPinAction, null);

  function celebrate() {
    setConfettiKey((k) => k + 1);
    pop();
    window.setTimeout(() => childCheer(), 200);
    window.setTimeout(() => fanfare(), 500);
  }

  async function handleAdd(fd: FormData) {
    setAdding(true);
    try {
      fd.set("avatar", avatar);
      const result = await addChildAction(fd);
      if (result?.id) {
        setActiveChildIdGlobal(result.id);
        bumpChildrenVersion();
      }
      celebrate();
      setStep(2);
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  // Advance to step 3 when PIN saves successfully.
  useEffect(() => {
    if (pinState?.ok && step === 2) {
      celebrate();
      setStep(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinState?.ok, step]);

  return (
    <section className="card welcome-card">
      <Confetti trigger={confettiKey} pieces={60} />
      <div className="welcome-mascot">
        <MsFeatherPopAvatar
          pose={step === 1 ? "wave" : step === 2 ? "idle" : "cheer"}
          size={120}
        />
      </div>
      <span className="kicker">
        <Sparkles aria-hidden className="h-4 w-4" />
        Welcome · Step {step} of 3
      </span>
      <h1 className="h-display mt-2 text-3xl">
        <span className="h-gradient">
          {step === 3
            ? "You're ready to fly!"
            : "Let's set up Ms. Feather Pop"}
        </span>
      </h1>
      <p className="text-[var(--ink-soft)]">
        {step === 3
          ? "Open a QR or jump into a demo mission — every feather is yours from here."
          : "Three quick steps and your child can start collecting feathers."}
      </p>

      <ol className="welcome-steps mt-4">
        <li className={step >= 1 ? "is-done" : ""}>1. Add a child</li>
        <li className={step >= 2 ? "is-done" : ""}>2. Set a parent PIN</li>
        <li className={step >= 3 ? "is-done" : ""}>3. Try your first scan</li>
      </ol>

      {step === 1 ? (
        <form action={handleAdd} className="mt-5 grid gap-3 max-w-sm">
          <label className="grid gap-1">
            <span className="kicker">Child nickname</span>
            <input
              required
              name="nickname"
              maxLength={20}
              className="profile-input"
              placeholder="e.g. Sam"
            />
          </label>
          <span className="kicker">Choose an avatar</span>
          <div className="avatar-grid">
            {AVATAR_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt}
                className={`avatar-pick ${avatar === opt ? "is-active" : ""}`}
                onClick={() => setAvatar(opt)}
                aria-label={opt}
              >
                <Image
                  src={`/media/avatars/${opt}-wave.png`}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                />
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="btn btn-gold mt-2"
            disabled={adding}
          >
            {adding ? "Adding…" : "Add child"}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <form action={pinForm} className="mt-5 grid gap-3 max-w-sm">
          <p className="text-[var(--ink-soft)]">
            <ShieldCheck aria-hidden className="inline h-4 w-4 mr-1" />
            4–6 digits. Required to approve grown-up missions. Stored hashed —
            never sent to the child&apos;s device.
          </p>
          <label className="grid gap-1">
            <span className="kicker">New PIN</span>
            <input
              required
              type="password"
              name="pin"
              inputMode="numeric"
              pattern="\d{4,6}"
              minLength={4}
              maxLength={6}
              className="profile-input"
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-1">
            <span className="kicker">Confirm PIN</span>
            <input
              required
              type="password"
              name="confirm"
              inputMode="numeric"
              pattern="\d{4,6}"
              minLength={4}
              maxLength={6}
              className="profile-input"
              autoComplete="new-password"
            />
          </label>
          {pinState?.error ? (
            <p className="pinpad-error" role="alert">
              {pinState.error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn-gold"
            disabled={pinPending}
          >
            {pinPending ? "Saving…" : "Save PIN"}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setStep(3)}
          >
            Skip for now
          </button>
        </form>
      ) : null}

      {step === 3 ? (
        <div className="mt-5 grid gap-3">
          <p>
            <Check aria-hidden className="inline h-4 w-4 mr-1 text-[var(--mint)]" />
            All set! Open the camera on a Ms. Feather Pop QR code, or jump in
            and try a demo mission.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/quest/welcome" className="btn btn-gold">
              <Sparkles aria-hidden className="h-5 w-5" />
              Try a demo mission
            </Link>
            <Link href="/scan" className="btn btn-sky">
              Open scanner
            </Link>
            <Link href="/" className="btn btn-ghost">
              Go to home
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
