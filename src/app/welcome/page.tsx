import { redirect } from "next/navigation";
import { WelcomeWizard } from "./WelcomeWizard";
import { listChildren, addChildAction } from "@/app/account/profiles/actions";
import { hasParentPin } from "@/lib/parent-pin";
import { setParentPinAction } from "@/app/account/pin/actions";

export const metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const [children, pinSet] = await Promise.all([listChildren(), hasParentPin()]);
  // If already onboarded (child + pin), no need for the wizard.
  if (children.length > 0 && pinSet) {
    redirect("/");
  }
  return (
    <main className="page">
      <WelcomeWizard
        hasChild={children.length > 0}
        hasPin={pinSet}
        addChildAction={addChildAction}
        setPinAction={setParentPinAction}
      />
    </main>
  );
}
