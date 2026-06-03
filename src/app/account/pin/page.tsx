import { hasParentPin } from "@/lib/parent-pin";
import { PinManager } from "./PinManager";

export const metadata = { title: "Parent PIN" };

export default async function PinPage() {
  const hasPin = await hasParentPin();
  return (
    <main className="page">
      <PinManager hasPin={hasPin} />
    </main>
  );
}
