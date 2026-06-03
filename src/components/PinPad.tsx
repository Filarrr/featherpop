"use client";

import { useState } from "react";
import { Delete, ShieldCheck } from "lucide-react";

export function PinPad({
  minLength = 4,
  maxLength = 6,
  onSubmit,
  busy,
  error,
  submitLabel = "Confirm",
}: {
  minLength?: number;
  maxLength?: number;
  onSubmit: (pin: string) => void;
  busy?: boolean;
  error?: string | null;
  submitLabel?: string;
}) {
  const [pin, setPin] = useState("");

  const push = (d: string) => {
    if (busy) return;
    setPin((p) => (p.length >= maxLength ? p : p + d));
  };
  const back = () => setPin((p) => p.slice(0, -1));
  const clear = () => setPin("");
  const submit = () => {
    if (pin.length >= minLength && !busy) {
      onSubmit(pin);
      setPin("");
    }
  };

  return (
    <div className="pinpad">
      <div className="pinpad-display" aria-live="polite" aria-label="PIN entry">
        {Array.from({ length: Math.max(minLength, pin.length) }).map((_, i) => (
          <span key={i} className={i < pin.length ? "is-on" : ""} />
        ))}
      </div>
      {error ? <p className="pinpad-error" role="alert">{error}</p> : null}
      <div className="pinpad-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => push(d)}
            disabled={busy}
            className="pinpad-key"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          disabled={busy || pin.length === 0}
          className="pinpad-key pinpad-aux"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => push("0")}
          disabled={busy}
          className="pinpad-key"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          disabled={busy || pin.length === 0}
          className="pinpad-key pinpad-aux"
          aria-label="Backspace"
        >
          <Delete aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        className="btn btn-gold w-full"
        onClick={submit}
        disabled={busy || pin.length < minLength}
      >
        <ShieldCheck aria-hidden className="h-5 w-5" />
        {busy ? "Checking…" : submitLabel}
      </button>
    </div>
  );
}
