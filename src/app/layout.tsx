import type { Metadata, Viewport } from "next";
import { Baloo_2, Fredoka } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { BrandBar } from "@/components/BrandBar";
import { BottomNav } from "@/components/BottomNav";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import { AudioNavCleanup } from "@/components/AudioNavCleanup";
import { NavGuardProvider } from "@/components/NavGuardProvider";
import { ActiveChildProvider } from "@/lib/use-active-child";
import { resolveActiveChild } from "@/lib/active-child-server";
import { getChildProgressAction } from "@/lib/child-progress-actions";
import { defaultChildProgress } from "@/lib/child-profile";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://play.msfeatherpop.com"),
  title: {
    default: "Ms. Feather Pop · Feather Missions",
    template: "%s · Ms. Feather Pop",
  },
  description:
    "Scan a QR, get a magical mission, collect feathers. A bright literacy + adventure app for kids ages 3–11.",
  applicationName: "Ms. Feather Pop",
  // Favicon + app icons come from src/app/{favicon.ico,icon.png,apple-icon.png}
  // (Next file conventions) — no manual override needed.
  openGraph: {
    title: "Ms. Feather Pop · Feather Missions",
    description:
      "A bright, kid-friendly mission adventure. Scan, do, earn feathers!",
    images: ["/media/poster.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#b13bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Edge-to-edge under the iPhone notch / Dynamic Island. The CSS uses
  // env(safe-area-inset-*) to pad correctly.
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolve the active child + its progress once per request so every page
  // gets correct data from the first paint, no localStorage roundtrip.
  const resolved = await resolveActiveChild().catch(() => null);
  const activeChildId = resolved?.activeChildId ?? null;
  const progress = activeChildId
    ? await getChildProgressAction(activeChildId).catch(() => defaultChildProgress)
    : defaultChildProgress;

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${fredoka.variable} ${baloo.variable} h-full antialiased`}
      >
        <body className="min-h-full">
          <ActiveChildProvider
            value={{
              activeChildId,
              active: resolved?.active ?? null,
              children: resolved?.children ?? [],
              progress,
            }}
          >
            <NavGuardProvider>
              <TopLoadingBar />
              <div className="app-shell">
                <BrandBar />
                {children}
                <BottomNav />
                <AudioNavCleanup />
              </div>
            </NavGuardProvider>
          </ActiveChildProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
