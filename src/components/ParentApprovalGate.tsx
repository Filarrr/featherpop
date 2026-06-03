"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Mission } from "@/lib/missions";
import { PinPad } from "./PinPad";
import {
  hasParentPinAction,
  verifyParentPinAction,
} from "@/app/account/pin/actions";

type Stage = "checking" | "no-pin" | "pin";

export function ParentApprovalGate({
  mission,
  onApproved,
  onCancel,
}: {
  mission: Mission;
  onApproved: () => void;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState<Stage>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;
    hasParentPinAction().then((has) => {
      if (!mounted) return;
      setStage(has ? "pin" : "no-pin");
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function check(pin: string) {
    setBusy(true);
    setError(null);
    const ok = await verifyParentPinAction(pin);
    setBusy(false);
    if (ok) {
      onApproved();
      return;
    }
    setAttempts((n) => n + 1);
    setError(
      attempts + 1 >= 3
        ? "Wrong PIN. Reset it from Account → Parent PIN."
        : "Wrong PIN. Try again.",
    );
  }

  if (stage === "checking") {
    return (
      <div className="approval-gate">
        <p>Checking parent PIN…</p>
      </div>
    );
  }

  if (stage === "no-pin") {
    return (
      <div className="approval-gate">
        <span className="kicker">Grown-up check</span>
        <h2 className="h-display">Set a parent PIN first</h2>
        <p>
          To approve this mission, the grown-up needs a PIN. This protects
          rewards from being self-approved.
        </p>
        <div className="approval-actions">
          <Link href="/account/pin" className="btn btn-gold">
            Set parent PIN
          </Link>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            <X aria-hidden className="h-5 w-5" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-gate">
      <span className="kicker">Grown-up check</span>
      <h2 className="h-display">{mission.prompt}</h2>
      {mission.helper ? <p>{mission.helper}</p> : null}
      <p className="text-sm text-[var(--ink-soft)]">
        Enter the parent PIN to approve.
      </p>
      <PinPad onSubmit={check} busy={busy} error={error} submitLabel="Approve" />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onCancel}
      >
        Back
      </button>
    </div>
  );
}
