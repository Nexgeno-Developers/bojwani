"use client";

import { useState, useTransition } from "react";
import { saveListAction, type ActionResult } from "@/lib/actions";
import ImageField, { type MediaItem } from "./ImageField";
import IconField from "./IconField";

export interface ColumnDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "icon" | "checkbox" | "select";
  options?: { value: string; label: string }[];
  help?: string;
  wide?: boolean;
}

type Row = Record<string, string | boolean | number | null> & { _k: string; id: number | null };

interface Props {
  model: "navItem" | "residenceSlide" | "highlight" | "amenity";
  columns: ColumnDef[];
  initial: Record<string, unknown>[];
  blank: Record<string, string | boolean>;
  itemLabel: string;
  titleKey: string;
  media?: MediaItem[];
}

let seq = 0;
const key = () => `k${++seq}`;

export default function ListEditor({ model, columns, initial, blank, itemLabel, titleKey, media = [] }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((r) => ({ ...(r as Row), _k: key(), id: (r.id as number) ?? null })),
  );
  const [dirty, setDirty] = useState(false);
  const [res, setRes] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const update = (fn: (r: Row[]) => Row[]) => {
    setRows(fn);
    setDirty(true);
    setRes(null);
  };
  const setField = (i: number, k: string, v: string | boolean) =>
    update((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i: number, d: number) =>
    update((rs) => {
      const n = [...rs];
      const j = i + d;
      if (j < 0 || j >= n.length) return rs;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const save = () =>
    start(async () => {
      const payload = rows.map(({ _k, ...r }) => r);
      const r = await saveListAction(model, payload);
      setRes(r);
      if (r.ok) setDirty(false);
    });

  return (
    <div className="stack">
      {rows.map((r, i) => (
        <div className="card item" key={r._k}>
          <div className="item-head">
            <span className="item-n">{i + 1}</span>
            <strong className="item-title">{String(r[titleKey] || `New ${itemLabel.toLowerCase()}`)}</strong>
            <div className="row">
              <button type="button" className="btn icon" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="btn icon" title="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button
                type="button"
                className="btn icon danger"
                title="Remove"
                onClick={() => {
                  if (confirm(`Remove this ${itemLabel.toLowerCase()}?`)) update((rs) => rs.filter((_, j) => j !== i));
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div className="item-grid">
            {columns.map((c) => (
              <div className={c.wide || c.type === "image" || c.type === "icon" || c.type === "textarea" ? "field wide" : "field"} key={c.key}>
                {c.type === "checkbox" ? (
                  <label className="check">
                    <input type="checkbox" checked={Boolean(r[c.key])} onChange={(e) => setField(i, c.key, e.target.checked)} /> {c.label}
                  </label>
                ) : (
                  <>
                    <span>{c.label}</span>
                    {c.type === "image" ? (
                      <ImageField value={String(r[c.key] ?? "")} media={media} onChange={(u) => setField(i, c.key, u)} />
                    ) : c.type === "icon" ? (
                      <IconField value={String(r[c.key] ?? "")} onChange={(v) => setField(i, c.key, v)} />
                    ) : c.type === "textarea" ? (
                      <textarea rows={3} value={String(r[c.key] ?? "")} onChange={(e) => setField(i, c.key, e.target.value)} />
                    ) : c.type === "select" ? (
                      <select value={String(r[c.key] ?? "")} onChange={(e) => setField(i, c.key, e.target.value)}>
                        {c.options?.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input value={String(r[c.key] ?? "")} onChange={(e) => setField(i, c.key, e.target.value)} />
                    )}
                  </>
                )}
                {c.help && <small className="muted">{c.help}</small>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn add" onClick={() => update((rs) => [...rs, { ...blank, _k: key(), id: null } as Row])}>
        + Add {itemLabel.toLowerCase()}
      </button>
      <div className="save-bar sticky">
        {dirty && !res && <span className="muted">Unsaved changes</span>}
        {res && <span className={res.ok ? "alert ok" : "alert err"}>{res.message}</span>}
        <button type="button" className="btn primary" disabled={pending} onClick={save}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
