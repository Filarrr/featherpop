import { SignIn } from "@clerk/nextjs";
import { MsFeatherPopAvatar } from "@/components/MsFeatherPopAvatar";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-hero">
        <MsFeatherPopAvatar pose="wave" size={180} />
        <h1 className="h-display text-3xl mt-2">
          <span className="h-gradient">Welcome back</span>
        </h1>
        <p className="text-[var(--ink-soft)]">
          Sign in to keep your child&apos;s feathers and streak safe.
        </p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#b13bff",
            borderRadius: "14px",
            fontFamily: "var(--font-fredoka)",
          },
        }}
        signUpUrl="/sign-up"
      />
    </main>
  );
}
