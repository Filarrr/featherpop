import { SignIn } from "@clerk/nextjs";
import { Feather, Heart, Sparkles } from "lucide-react";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="auth-page auth-split">
      <aside className="auth-art">
        <div className="auth-art-stage">
          <MsFeatherPopAvatar pose="wave" size={260} />
          <span className="auth-art-feather auth-art-feather-1" aria-hidden />
          <span className="auth-art-feather auth-art-feather-2" aria-hidden />
          <span className="auth-art-feather auth-art-feather-3" aria-hidden />
        </div>
        <h1 className="h-display text-4xl mt-3 text-center">
          <span className="h-gradient">Welcome back, friend</span>
        </h1>
        <p className="auth-art-tagline">
          Your flock has been waiting. Pick up right where you left off.
        </p>
        <ul className="auth-perks">
          <li><Feather aria-hidden className="h-4 w-4" /> Magical feathers, kept safe</li>
          <li><Heart aria-hidden className="h-4 w-4" /> Multiple kids, one account</li>
          <li><Sparkles aria-hidden className="h-4 w-4" /> Streaks across devices</li>
        </ul>
      </aside>
      <div className="auth-form-wrap">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#b13bff",
              borderRadius: "14px",
              fontFamily: "var(--font-fredoka)",
            },
            elements: {
              // Force the Clerk widget to fit the parent — its built-in
              // min-width was overflowing narrow phone viewports and
              // dragging the card off the right edge of the screen.
              rootBox: { width: "100%", maxWidth: "100%" },
              card: {
                width: "100%",
                maxWidth: "100%",
                margin: 0,
                boxSizing: "border-box",
              },
              form: { width: "100%" },
            },
          }}
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}
