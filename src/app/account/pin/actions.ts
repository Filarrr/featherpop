"use server";

import { revalidatePath } from "next/cache";
import {
  clearParentPin,
  hasParentPin,
  setParentPin,
  verifyParentPin,
} from "@/lib/parent-pin";

export async function hasParentPinAction(): Promise<boolean> {
  return hasParentPin();
}

export async function verifyParentPinAction(pin: string): Promise<boolean> {
  return verifyParentPin(pin);
}

export async function setParentPinAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const pin = String(formData.get("pin") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!/^\d{4,6}$/.test(pin)) {
    return { ok: false, error: "PIN must be 4–6 digits." };
  }
  if (pin !== confirm) {
    return { ok: false, error: "PINs don't match." };
  }
  try {
    await setParentPin(pin);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath("/account/pin");
  revalidatePath("/account/profiles");
  return { ok: true };
}

export async function clearParentPinAction(): Promise<{ ok: boolean }> {
  await clearParentPin();
  revalidatePath("/account/pin");
  revalidatePath("/account/profiles");
  return { ok: true };
}
