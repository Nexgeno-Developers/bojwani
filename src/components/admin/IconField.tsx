"use client";

import { useState } from "react";
import data from "../../../prisma/seed-data.json";

const PRESETS: { label: string; icon: string }[] = [
  ...data.highlights.map((h) => ({ label: h.title, icon: h.icon })),
  ...data.amenities.map((a) => ({ label: a.name, icon: a.icon })),
  { label: "Check mark", icon: '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>' },
  { label: "Map pin", icon: '<path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>' },
  { label: "Star", icon: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>' },
  { label: "Car / parking", icon: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3.5 16h17v3h-17z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>' },
  { label: "Shield / security", icon: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>' },
];

export default function IconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="icon-field">
      <div className="row">
        <span className="icon-prev">
          <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: value }} />
        </span>
        <button type="button" className="btn small ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Close icons" : "Pick icon"}
        </button>
      </div>
      {open && (
        <div className="icon-grid">
          {PRESETS.map((p, i) => (
            <button
              type="button"
              key={i}
              title={p.label}
              className={p.icon === value ? "on" : undefined}
              onClick={() => {
                onChange(p.icon);
                setOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: p.icon }} />
            </button>
          ))}
        </div>
      )}
      <details className="tiny">
        <summary className="muted">Custom SVG code (24×24 paths)</summary>
        <textarea className="mono" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      </details>
    </div>
  );
}
