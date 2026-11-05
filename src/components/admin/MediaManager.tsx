"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMediaAction, uploadMediaAction, type ActionResult } from "@/lib/actions";

interface M {
  id: number;
  url: string;
  originalName: string;
  size: number;
}

export default function MediaManager({ media }: { media: M[] }) {
  const [res, setRes] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const upload = (files: FileList) => {
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("file", f);
    start(async () => {
      setRes(await uploadMediaAction(fd));
      router.refresh();
    });
  };

  return (
    <div className="stack">
      <div className="card row between">
        <span className="muted">{media.length} files</span>
        <div className="row">
          {res && <span className={res.ok ? "alert ok" : "alert err"}>{res.message}</span>}
          <button className="btn primary" disabled={pending} onClick={() => ref.current?.click()}>
            {pending ? "Working…" : "Upload images"}
          </button>
        </div>
        <input ref={ref} type="file" multiple accept="image/*" hidden onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>
      <div className="media-grid">
        {media.map((m) => (
          <figure key={m.id} className="card media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.originalName} loading="lazy" />
            <figcaption>
              <span className="tiny" title={m.originalName}>{m.originalName}</span>
              <span className="tiny muted">{(m.size / 1024).toFixed(0)} KB</span>
              <div className="row">
                <button type="button" className="btn small ghost" onClick={() => navigator.clipboard?.writeText(m.url)}>Copy URL</button>
                <button
                  type="button"
                  className="btn small danger"
                  onClick={() => {
                    if (!confirm("Delete this file permanently?")) return;
                    start(async () => {
                      setRes(await deleteMediaAction(m.id));
                      router.refresh();
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
