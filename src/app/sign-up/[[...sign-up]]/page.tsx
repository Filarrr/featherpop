import { SignUp } from "@clerk/nextjs";
import { Feather, Sparkles, Wand2 } from "lucide-react";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <main className="auth-page auth-split">
      <aside className="auth-art">
        <div className="auth-art-stage">
          <MsFeatherPopAvatar pose="cheer" size={260} />
          <span className="auth-art-feather auth-art-feather-1" aria-hidden />
          <span className="auth-art-feather auth-art-feather-2" aria-hidden />
          <span className="auth-art-feather auth-art-feather-3" aria-hidden />
        </div>
        <h1 className="h-display text-4xl mt-3 text-center">
          <span className="h-gradient">Join the flock</span>
        </h1>
        <p className="auth-art-tagline">
          Grown-ups in 30 seconds. Then add a child profile, scan a QR, and
          watch the first feather flutter in.
        </p>
        <ul className="auth-perks">
          <li><Wand2 aria-hidden className="h-4 w-4" /> 24 random missions, growing</li>
          <li><Feather aria-hidden className="h-4 w-4" /> 6 magical feather types</li>
          <li><Sparkles aria-hidden className="h-4 w-4" /> Real-world prizes to unlock</li>
        </ul>
      </aside>
      <div className="auth-form-wrap">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#b13bff",
              borderRadius: "14px",
              fontFamily: "var(--font-fredoka)",
            },
          }}
          signInUrl="/sign-in"
          forceRedirectUrl="/welcome"
        />
      </div>
    </main>
  );
}
