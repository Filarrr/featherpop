import { resolveActiveChild } from "@/lib/active-child-server";
import { getGoldenFeatherMonthsAction } from "@/lib/child-progress-actions";
import { GoldenCertificateClient } from "@/components/print/GoldenCertificateClient";

export const metadata = { title: "Golden Feather Certificate" };
export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatMonthKey(mk: string): string {
  // mk is 'YYYY-MM'
  const [y, m] = mk.split("-");
  const idx = parseInt(m, 10) - 1;
  if (idx < 0 || idx > 11) return mk;
  return `${MONTH_NAMES[idx]} ${y}`;
}

export default async function GoldenFeatherCertificatePage() {
  const { active } = await resolveActiveChild();
  const months = await getGoldenFeatherMonthsAction();
  const nickname = active?.nickname ?? "Feather Explorer";
  const month = months[0] ? formatMonthKey(months[0]) : formatMonthKey(
    `${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.padStart(2, "0")}`,
  );

  return (
    <GoldenCertificateClient
      nickname={nickname}
      month={month}
      hasEarned={months.length > 0}
    />
  );
}
