"use client";

import { useState, useTransition } from "react";
import { saveLegalAction, type ActionResult, type LegalInput } from "@/lib/actions";

type P = { kind: string; content: string; _k: string };
type S = { id: number | null; title: string; active: boolean; paragraphs: P[]; _k: string; open: boolean };

let seq = 0;
const k = () => `l${++seq}`;

function swap<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const n = [...arr];
  [n[i], n[j]] = [n[j], n[i]];
  return n;
}

export default function LegalEditor({ initial }: { initial: LegalInput[] }) {
  const [secs, setSecs] = useState<S[]>(() =>
    initial.map((s) => ({
      id: s.id ?? null,
      title: s.title,
      active: s.active,
      open: false,
      _k: k(),
      paragraphs: s.paragraphs.map((p) => ({ ...p, _k: k() })),
    })),
  );
  const [res, setRes] = useState<ActionResult | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  const up = (fn: (s: S[]) => S[]) => {
    setSecs(fn);
    setDirty(true);
    setRes(null);
  };
  const upSec = (i: number, patch: Partial<S>) => up((ss) => ss.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const upPar = (i: number, fn: (p: P[]) => P[]) => up((ss) => ss.map((s, j) => (j === i ? { ...s, paragraphs: fn(s.paragraphs) } : s)));

  const save = () =>
    start(async () => {
      const r = await saveLegalAction(
        secs.map((s) => ({ id: s.id, title: s.title, active: s.active, paragraphs: s.paragraphs.map(({ kind, content }) => ({ kind, content })) })),
      );
      setRes(r);
      if (r.ok) setDirty(false);
    });

  return (
    <div className="stack">
      {secs.map((s, i) => {
        let n = 0;
        return (
          <div className="card item" key={s._k}>
            <div className="item-head">
              <span className="item-n">{i + 1}</span>
              <input className="title-input" value={s.title} onChange={(e) => upSec(i, { title: e.target.value })} />
              <label className="check tiny">
                <input type="checkbox" checked={s.active} onChange={(e) => upSec(i, { active: e.target.checked })} /> Visible
              </label>
              <div className="row">
                <button type="button" className="btn icon" disabled={i === 0} onClick={() => up((ss) => swap(ss, i, -1))}>↑</button>
                <button type="button" className="btn icon" disabled={i === secs.length - 1} onClick={() => up((ss) => swap(ss, i, 1))}>↓</button>
                <button type="button" className="btn icon danger" onClick={() => confirm("Remove this whole accordion?") && up((ss) => ss.filter((_, j) => j !== i))}>×</button>
              </div>
            </div>
            <button type="button" className="btn small ghost" onClick={() => setSecs((ss) => ss.map((x, j) => (j === i ? { ...x, open: !x.open } : x)))}>
              {s.open ? "Hide paragraphs" : `Edit ${s.paragraphs.length} paragraphs`}
            </button>
            {s.open && (
              <div className="stack para-list">
                {s.paragraphs.map((p, pi) => {
                  if (p.kind === "heading") n = 0;
                  if (p.kind === "numbered") n++;
                  return (
                    <div className={`para para-${p.kind}`} key={p._k}>
                      <div className="para-side">
                        <span className="para-num">{p.kind === "numbered" ? `${n}.` : p.kind === "heading" ? "H" : "¶"}</span>
                        <select value={p.kind} onChange={(e) => upPar(i, (ps) => ps.map((x, j) => (j === pi ? { ...x, kind: e.target.value } : x)))}>
                          <option value="numbered">Numbered</option>
                          <option value="heading">Heading</option>
                          <option value="plain">Plain</option>
                        </select>
                        <div className="row">
                          <button type="button" className="btn icon" disabled={pi === 0} onClick={() => upPar(i, (ps) => swap(ps, pi, -1))}>↑</button>
                          <button type="button" className="btn icon" disabled={pi === s.paragraphs.length - 1} onClick={() => upPar(i, (ps) => swap(ps, pi, 1))}>↓</button>
                          <button type="button" className="btn icon danger" onClick={() => upPar(i, (ps) => ps.filter((_, j) => j !== pi))}>×</button>
                        </div>
                      </div>
                      <textarea
                        rows={Math.min(8, Math.max(2, Math.ceil(p.content.length / 110)))}
                        value={p.content}
                        onChange={(e) => upPar(i, (ps) => ps.map((x, j) => (j === pi ? { ...x, content: e.target.value } : x)))}
                      />
                    </div>
                  );
                })}
                <button type="button" className="btn add small" onClick={() => upPar(i, (ps) => [...ps, { kind: "numbered", content: "", _k: k() }])}>
                  + Add paragraph
                </button>
                <small className="muted">Numbers are automatic and restart after each heading. Links: &lt;a href=&quot;https://…&quot; target=&quot;_blank&quot;&gt;text&lt;/a&gt;</small>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="btn add" onClick={() => up((ss) => [...ss, { id: null, title: "New section", active: true, open: true, _k: k(), paragraphs: [] }])}>
        + Add accordion
      </button>
      <div className="save-bar sticky">
        {dirty && !res && <span className="muted">Unsaved changes</span>}
        {res && <span className={res.ok ? "alert ok" : "alert err"}>{res.message}</span>}
        <button type="button" className="btn primary" disabled={pending} onClick={save}>{pending ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}
