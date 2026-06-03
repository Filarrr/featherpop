import { SignUp } from "@clerk/nextjs";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-hero">
        <MsFeatherPopAvatar pose="cheer" size={180} />
        <h1 className="h-display text-3xl mt-2">
          <span className="h-gradient">Join the flock</span>
        </h1>
        <p className="text-[var(--ink-soft)]">
          Create a grown-up account. Add a child profile next, then start
          scanning feathers.
        </p>
      </div>
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
    </main>
  );
}
