import { redirect } from "next/navigation";

// Legacy Word Quest intro — V1 sends users straight to the scanner.
export default function IntroPage() {
  redirect("/scan");
}
