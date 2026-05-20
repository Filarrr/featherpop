"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type LottieData = Record<string, unknown>;

/**
 * Renders a Lottie animation from /public/lottie/<name>.json.
 *
 * Drop any LottieFiles JSON into /public/lottie/ — e.g.
 *   /public/lottie/feather-pop-wave.json
 *   /public/lottie/kid-cheer.json
 *
 * Then reference it as <LottieAvatar name="feather-pop-wave" />.
 *
 * Falls back to the `fallback` children if the file isn't there yet, so the
 * app keeps working with the inline SVG avatars until real animations are
 * added.
 */
export function LottieAvatar({
  name,
  size = 180,
  loop = true,
  autoplay = true,
  fallback,
  className,
}: {
  name: string;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const [data, setData] = useState<LottieData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/lottie/${name}.json`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        const json = (await r.json()) as LottieData;
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (missing) return <>{fallback ?? null}</>;
  if (!data)
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );

  return (
    <Lottie
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
