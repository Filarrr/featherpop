import type { Metadata, Viewport } from "next";
import { Baloo_2, Fredoka } from "next/font/google";
import "./globals.css";
import { BrandBar } from "@/components/BrandBar";
import { BottomNav } from "@/components/BottomNav";

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
    default: "Ms. Feather Pop · Word Quest",
    template: "%s · Ms. Feather Pop Word Quest",
  },
  description:
    "Scan QR codes, discover letters, build words, and earn FeatherPop rewards on Ms. Feather Pop's Word Quest.",
  applicationName: "Ms. Feather Pop Word Quest",
  icons: { icon: "/media/logo-dark.jpeg" },
  openGraph: {
    title: "Ms. Feather Pop · Word Quest",
    description:
      "A bright, kid-friendly literacy adventure. Scan, discover, build, win!",
    images: ["/media/poster.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#b13bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="app-shell">
          <BrandBar />
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
