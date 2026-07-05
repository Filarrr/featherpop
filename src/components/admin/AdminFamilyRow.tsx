"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminSeedPanel, type ChildSeedInfo } from "./AdminSeedPanel";

export interface FamilyRowData {
  userId: string;
  label: string;
  email: string;
  childCount: number;
  featherPop: number;
  words: number;
  eggs: number;
  member: boolean;
  status: string;
  children: ChildSeedInfo[];
}

export function AdminFamilyRow({ family }: { family: FamilyRowData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="admin-family-item">
      <div className="admin-families-row">
        <span className="admin-families-name">
          <strong>{family.label}</strong>
          <small>{family.email}</small>
        </span>
        <span>{family.childCount}</span>
        <span>{family.featherPop.toLocaleString()}</span>
        <span>{family.words.toLocaleString()}</span>
        <span>{family.eggs}</span>
        <span>
          <em className={`admin-badge ${family.member ? "is-member" : ""}`}>
            {family.member ? family.status : "free"}
          </em>
        </span>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="btn btn-ghost btn-sm"
          aria-label={expanded ? "Close seed panel" : "Open seed panel"}
        >
          {expanded ? (
            <ChevronUp aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronDown aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
      {expanded && (
        <AdminSeedPanel userId={family.userId} children={family.children} />
      )}
    </div>
  );
}
