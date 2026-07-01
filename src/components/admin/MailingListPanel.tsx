"use client";

import { useState } from "react";
import { Copy, Download, Mail } from "lucide-react";

export function MailingListPanel({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  function copyAll() {
    navigator.clipboard
      ?.writeText(emails.join("\n"))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  function downloadCsv() {
    const csv = "email\n" + emails.map((e) => `"${e}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vip-wishlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (emails.length === 0) {
    return (
      <p className="text-[var(--ink-soft)]">
        <Mail aria-hidden className="mr-1 inline h-4 w-4" />
        No signups yet. They&apos;ll appear here as families join the list.
      </p>
    );
  }

  return (
    <div className="admin-vip">
      <div className="admin-vip-head">
        <span className="admin-vip-count">
          <strong>{emails.length}</strong>{" "}
          {emails.length === 1 ? "person" : "people"} on the list
        </span>
        <div className="admin-vip-actions">
          <button type="button" onClick={copyAll} className="btn btn-ghost btn-sm">
            <Copy aria-hidden className="h-4 w-4" />
            {copied ? "Copied!" : "Copy all"}
          </button>
          <button type="button" onClick={downloadCsv} className="btn btn-ghost btn-sm">
            <Download aria-hidden className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>
      <ul className="admin-vip-list">
        {emails.map((email) => (
          <li key={email}>{email}</li>
        ))}
      </ul>
    </div>
  );
}
