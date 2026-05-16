"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/audio";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-btn"
      aria-label={enabled ? "Mute voice prompts" : "Enable voice prompts"}
      title={enabled ? "Sound on" : "Sound off"}
    >
      {enabled ? (
        <Volume2 aria-hidden className="h-5 w-5" />
      ) : (
        <VolumeX aria-hidden className="h-5 w-5" />
      )}
    </button>
  );
}
